import { create } from 'zustand';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { ITEMS } from '../data/items.js';
import { DAILY_CHALLENGES, checkDailyProgress, hydrateDailyChallenges } from '../data/dailies.js';
import {
  getTodayKey,
  getYesterdayKey,
  getDateKey,
  getLevelThreshold,
  calcPoints,
  calcMultiplierOnComplete,
  calcMultiplierOnFail,
  calcGlobalStreak,
  isHabitDueOnDate,
  isHabitCompletedThisPeriod,
  getWeekStart,
  getWeekEnd,
  getMonthStart,
  getMonthEnd,
  getWeekCompletions,
  getHabitMultiplierCap,
  hasPermanentMultiplierGem,
} from '../utils/gameLogic.js';
import { DEFAULT_HABIT_THEME, HABIT_THEME_BY_ID, attachThemeToHabit } from '../data/habitThemes.js';
import { assignStoryForJourney, assignStoryForEpicAchievement, assignStoryForLegendaryAchievement } from '../data/stories.js';
import {
  loadUserData,
  saveProfile,
  saveHabit,
  saveHabits,
  deleteHabit as dbDeleteHabit,
  saveHabitEntry,
  saveHabitEntries,
  saveInventory,
  saveActiveEffects,
  saveAchievements,
  saveDaily,
  saveStory,
  savePlan,
  deletePlan as dbDeletePlan,
  updatePlanTask,
  applyTripleBonus,
  checkDailyForToday,
  loadDailyChallengesCatalog,
  incrementItemChosen,
  incrementDailyChosen,
} from '../lib/db.js';
import { supabase } from '../lib/supabase.js';
import { loadState, clearState } from '../lib/storage.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value) {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

function createUuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  const bytes = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// ── TARGETED EFFECTS UTILITIES ─────────────────────────────────────────────

/**
 * Check if an effect requires habit targeting based on naming pattern.
 * Effects ending with "_target" require the user to select a specific habit.
 */
function requiresTargeting(effectKey) {
  return effectKey.endsWith('_target');
}

/**
 * Creates a targeted effect object for the store.
 */
function createTargetedEffect(item, targetHabitId) {
  return {
    key: item.effectKey.replace('_target', ''), // Remove _target suffix for actual effect
    value: item.effectValue,
    targetHabitId,
    itemName: item.name,
    ...(item.effectType === 'timed' && {
      expiresAt: (() => {
        const expires = new Date();
        expires.setDate(expires.getDate() + item.durationDays);
        return expires.toISOString();
      })()
    })
  };
}

/**
 * Check if an effect should be applied to a specific habit.
 * An effect applies if it's global (no targetHabitId) or targeted to this habit.
 */
function effectAppliesTo(effect, habitId) {
  return !effect.targetHabitId || effect.targetHabitId === habitId;
}

function normalizeActiveEffects(rawEffects = [], habits = []) {
  const now = new Date();
  const habitIds = new Set(habits.map(h => h.id));
  const permGemByHabit = new Set();
  const normalized = [];

  rawEffects.forEach(effect => {
    if (!effect) return;

    if (effect.expiresAt && new Date(effect.expiresAt) <= now) {
      return;
    }

    if (effect.key === 'perm_base_mult') {
      if (!effect.targetHabitId || !habitIds.has(effect.targetHabitId)) {
        return;
      }
      if (permGemByHabit.has(effect.targetHabitId)) {
        return;
      }
      permGemByHabit.add(effect.targetHabitId);
    }

    normalized.push(effect);
  });

  return normalized;
}

function removeGemIfLostThreshold(activeEffects = [], habitId, nextMultiplier) {
  if (!habitId || nextMultiplier >= 3) {
    return { effects: activeEffects, removed: false };
  }

  const shouldHaveGem = hasPermanentMultiplierGem(habitId, activeEffects);
  if (!shouldHaveGem) {
    return { effects: activeEffects, removed: false };
  }

  const effects = activeEffects.filter(e => !(e.key === 'perm_base_mult' && e.targetHabitId === habitId));
  return { effects, removed: true };
}

function migrateHabitIds(habits) {
  const idMap = new Map();
  const migrated = habits.map(habit => {
    if (habit?.id && isUuid(habit.id)) return habit;
    const newId = createUuid();
    if (habit?.id) idMap.set(habit.id, newId);
    return { ...habit, id: newId };
  });
  return { habits: migrated, idMap };
}

function migrateHistory(history, idMap) {
  if (!history || !Object.keys(history).length) return history ?? {};
  const next = {};
  for (const [date, dayMap] of Object.entries(history)) {
    const nextDay = {};
    for (const [habitId, status] of Object.entries(dayMap ?? {})) {
      const mappedId = idMap.get(habitId) ?? habitId;
      nextDay[mappedId] = status;
    }
    next[date] = nextDay;
  }
  return next;
}

function resolveJourneyProgress({ level, points, earnedPoints, unlockedStories, pickJourneyItemChoices }) {
  let finalLevel = level;
  let finalPoints = points + earnedPoints;
  const rewards = [];

  while (finalPoints >= getLevelThreshold(finalLevel)) {
    const threshold = getLevelThreshold(finalLevel);
    finalPoints -= threshold;
    finalLevel += 1;

    const story = assignStoryForJourney(finalLevel, unlockedStories);
    const itemChoices = pickJourneyItemChoices(finalLevel);
    rewards.push({ journeyNumber: finalLevel, story, itemChoices });
  }

  return { finalLevel, finalPoints, rewards };
}

const INVENTORY_SAVE_DEBOUNCE_MS = 180;
const inventorySaveQueue = new Map();

function normalizeInventorySnapshot(inventory) {
  const normalized = new Map();
  for (const entry of (inventory ?? [])) {
    if (!entry?.itemId) continue;
    const qty = Number(entry.qty ?? 0);
    if (!Number.isFinite(qty) || qty <= 0) continue;
    normalized.set(entry.itemId, (normalized.get(entry.itemId) ?? 0) + qty);
  }

  return [...normalized.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([itemId, qty]) => ({ itemId, qty }));
}

function clearQueuedInventorySaves(exceptUserId) {
  for (const [queuedUserId, entry] of inventorySaveQueue.entries()) {
    if (exceptUserId && queuedUserId === exceptUserId) continue;
    if (entry.timer) clearTimeout(entry.timer);
    inventorySaveQueue.delete(queuedUserId);
  }
}

function flushInventorySave(userId) {
  const entry = inventorySaveQueue.get(userId);
  if (!entry) return;
  if (entry.running) {
    entry.needsRun = true;
    return;
  }

  entry.running = true;
  entry.timer = null;

  const run = async () => {
    try {
      do {
        entry.needsRun = false;
        const snapshot = normalizeInventorySnapshot(entry.getSnapshot?.() ?? []);
        const signature = JSON.stringify(snapshot);
        if (!snapshot.length && entry.lastSavedSignature === '[]') {
          continue;
        }
        if (entry.lastSavedSignature === signature) {
          continue;
        }

        await saveInventory(userId, snapshot);
        entry.lastSavedSignature = signature;
      } while (entry.needsRun);
    } catch {
      // Mantener fire-and-forget para no bloquear UX por errores de red.
    } finally {
      entry.running = false;
      if (!entry.timer && !entry.needsRun) {
        inventorySaveQueue.delete(userId);
      }
    }
  };

  run();
}

function queueInventorySave(userId, getSnapshot) {
  if (!userId || typeof getSnapshot !== 'function') return;

  let entry = inventorySaveQueue.get(userId);
  if (!entry) {
    entry = {
      timer: null,
      running: false,
      needsRun: false,
      getSnapshot,
      lastSavedSignature: null,
    };
    inventorySaveQueue.set(userId, entry);
  }

  entry.getSnapshot = getSnapshot;
  entry.needsRun = true;

  if (entry.timer) {
    clearTimeout(entry.timer);
  }

  entry.timer = setTimeout(() => flushInventorySave(userId), INVENTORY_SAVE_DEBOUNCE_MS);
}

const useGameStore = create(
  (set, get) => ({
    // Core
    _userId: null,        // Supabase user ID (set on init)
    _initPromise: null,
    _initializingUserId: null,
    _initializedUserId: null,
    _dailyCheckPromise: null,
    habits: [],
    level: 0,
    points: 0,
    lifetimePoints: 0,
    history: {},          // { 'YYYY-MM-DD': { [habitId]: 'completed' | 'failed' | 'partial' | 'over' | 'skipped' } }
    globalStreak: 0,
    lastWeeklyProcessDate: null, // Track when weekly habits were last processed

    // Dailies
    currentDaily: null,   // { id, name, description, icon, difficulty, condition, rewards, progress, completed }
    dailyOptions: null,   // Array de 3 opciones para elegir
    dailySelectionMade: false, // Si el usuario ya eligió su daily
    lastDailyDate: null,  // 'YYYY-MM-DD'
    dailyCatalog: hydrateDailyChallenges(DAILY_CHALLENGES),

    // Gamification
    unlockedAchievements: [],
    inventory: [],        // [{ itemId, qty }]
    activeEffects: [],    // [{ key, value, expiresAt (ISO date) }]

    // Viajes e historias
    unlockedStories: [],  // [{ journeyId, storyId, unlockedAt }]
    journeyRewardQueue: [], // [{ journeyNumber, story, itemChoices }] — flujo post-viaje
    pendingDailyReward: null, // { dailyId, dailyName, points, itemChoices }

    // Planes
    plans: {}, // { 'YYYY-MM-DD': { id, date, name, tasks: [...], tripleApplied } }

    // UI notifications queue
    notifications: [],
    savedNotifications: [],

    // Streak rewards
    streakReward: null,

    // ── HABITS ────────────────────────────────────────────────────
    addHabit(habit) {
      const newHabit = {
        id: createUuid(),
        name: habit.name,
        minutes: habit.minutes,
        periodicity: habit.periodicity,
        emoji: habit.emoji ?? HABIT_THEME_BY_ID[habit.themeId ?? DEFAULT_HABIT_THEME]?.icon ?? '🎯',
        themeId: habit.themeId ?? DEFAULT_HABIT_THEME,
        customDays: habit.customDays,
        customInterval: habit.customInterval,
        weeklyTimesTarget: habit.weeklyTimesTarget ?? null,
        multiplier: 1.0,
        baseMultiplier: 1.0,
        streak: 0,
        createdAt: new Date().toISOString(),
      };
      set(state => ({ habits: [...state.habits, newHabit] }));

      // Persistir en BD
      const userId = get()._userId;
      if (userId) {
        saveHabit(userId, newHabit)
          .then(saved => {
            if (saved && saved.id !== newHabit.id) {
              set(state => ({
                habits: state.habits.map(h => h.id === newHabit.id ? saved : h),
              }));
            }
          })
          .catch(() => { });
      }

      get()._checkAchievements();
      get()._checkAndGenerateDaily().catch(err => console.error('[store] Error in addHabit daily check:', err));
    },

    removeHabit(id) {
      set(state => ({ habits: state.habits.filter(h => h.id !== id) }));

      // Persistir en BD
      if (get()._userId) dbDeleteHabit(id).catch(() => { });
    },

    updateHabit(id, updates) {
      set(state => ({
        habits: state.habits.map(h =>
          h.id === id ? { ...h, ...updates } : h
        )
      }));

      // Persistir en BD
      const userId = get()._userId;
      if (userId) {
        const updated = get().habits.find(h => h.id === id);
        if (updated) saveHabit(userId, updated).catch(() => { });
      }
    },

    // ── INITIALIZATION ────────────────────────────────────────────
    async init(userId) {
      if (!userId) return;

      const state = get();
      if (state._userId && state._userId !== userId) {
        clearQueuedInventorySaves();
      }
      if (state._initPromise && state._initializingUserId === userId) {
        await state._initPromise;
        return;
      }

      if (!state._initPromise && state._initializedUserId === userId) {
        return;
      }

      const initPromise = (async () => {
        // Guardar el userId en el store para que las acciones puedan acceder a él
        set({ _userId: userId, _initializingUserId: userId });

        try {
          const remoteData = await loadUserData(userId);

          if (remoteData) {
            const normalizedEffects = normalizeActiveEffects(remoteData.activeEffects ?? [], remoteData.habits ?? []);
            // ── Hay datos en Supabase → usarlos como fuente de verdad ──
            set({
              habits: remoteData.habits,
              level: remoteData.level,
              points: remoteData.points,
              lifetimePoints: remoteData.lifetimePoints,
              history: remoteData.history,
              globalStreak: remoteData.globalStreak,
              unlockedAchievements: remoteData.unlockedAchievements,
              unlockedStories: remoteData.unlockedStories ?? [],
              journeyRewardQueue: [],
              inventory: remoteData.inventory,
              activeEffects: normalizedEffects,
              currentDaily: remoteData.currentDaily,
              dailyOptions: remoteData.dailyOptions ?? null,
              dailySelectionMade: remoteData.dailySelectionMade ?? false,
              lastDailyDate: remoteData.lastDailyDate,
              dailyCatalog: hydrateDailyChallenges(DAILY_CHALLENGES),
              lastWeeklyProcessDate: remoteData.lastWeeklyProcessDate,
              plans: remoteData.plans ?? {},
            });
          } else {
            // ── BD vacía → intentar migrar estado local (si existe) ──
            const localState = loadState();
            if (localState && Object.keys(localState).length) {
              const { habits: migratedHabits, idMap } = migrateHabitIds(localState.habits ?? []);
              const migratedHistory = migrateHistory(localState.history ?? {}, idMap);
              const normalizedEffects = normalizeActiveEffects(localState.activeEffects ?? [], migratedHabits);

              set({
                habits: migratedHabits.map(attachThemeToHabit),
                level: localState.level ?? 0,
                points: localState.points ?? 0,
                lifetimePoints: localState.lifetimePoints ?? 0,
                history: migratedHistory,
                globalStreak: localState.globalStreak ?? 0,
                unlockedAchievements: localState.unlockedAchievements ?? [],
                journeyRewardQueue: [],
                inventory: localState.inventory ?? [],
                activeEffects: normalizedEffects,
                currentDaily: localState.currentDaily ?? null,
                dailyCatalog: hydrateDailyChallenges(DAILY_CHALLENGES),
                lastDailyDate: localState.lastDailyDate ?? null,
                lastWeeklyProcessDate: localState.lastWeeklyProcessDate ?? null,
              });

              saveProfile(userId, {
                level: localState.level ?? 0,
                points: localState.points ?? 0,
                lifetimePoints: localState.lifetimePoints ?? 0,
                globalStreak: localState.globalStreak ?? 0,
                lastWeeklyProcessDate: localState.lastWeeklyProcessDate ?? null,
              }).catch(() => { });

              saveHabits(userId, migratedHabits)
                .then(saved => {
                  if (saved?.length) {
                    set({ habits: saved });
                  }
                })
                .catch(() => { });

              const entries = [];
              for (const [date, dayMap] of Object.entries(migratedHistory)) {
                for (const [habitId, status] of Object.entries(dayMap)) {
                  entries.push({ habitId, date, status });
                }
              }
              if (entries.length) saveHabitEntries(userId, entries).catch(() => { });
              if (localState.inventory?.length) queueInventorySave(userId, () => localState.inventory);
              if (normalizedEffects.length) saveActiveEffects(userId, normalizedEffects).catch(() => { });
              if (localState.unlockedAchievements?.length) saveAchievements(userId, localState.unlockedAchievements).catch(() => { });
              if (localState.currentDaily && localState.lastDailyDate) {
                saveDaily(userId, localState.currentDaily, localState.lastDailyDate).catch(() => { });
              }

              clearState();
            } else {
              // ── BD vacía y sin datos locales → usuario nuevo ──
              set({
                habits: [],
                level: 0,
                points: 0,
                lifetimePoints: 0,
                history: {},
                globalStreak: 0,
                unlockedAchievements: [],
                journeyRewardQueue: [],
                inventory: [],
                activeEffects: [],
                currentDaily: null,
                dailyCatalog: hydrateDailyChallenges(DAILY_CHALLENGES),
                lastDailyDate: null,
                lastWeeklyProcessDate: null,
                plans: {},
              });
              saveProfile(userId, {
                level: 0,
                points: 0,
                lifetimePoints: 0,
                globalStreak: 0,
                lastWeeklyProcessDate: null,
              }).catch(() => { });
            }
          }
        } catch (err) {
          // Si Supabase falla, seguir con el estado local sin interrumpir
          console.error('[store] Error cargando datos de BD, usando estado local:', err);
        }

        try {
          const catalog = await loadDailyChallengesCatalog();
          if (catalog.length) {
            set({ dailyCatalog: catalog });
          }
        } catch (error) {
          console.error('[store] Error cargando catálogo de dailies:', error);
        }

        // Procesos de inicio (siempre, independientemente del origen de datos)
        get()._processExpiredHabits();
        get()._processWeeklyHabits();
        get()._processFusionDegradation(); // Procesar degradación de fusión al inicio
        get()._recalcGlobalStreak();
        await get()._checkAndGenerateDaily();
        get()._purgeExpiredEffects();
        set({ _initializedUserId: userId });
      })();

      set({ _initPromise: initPromise });

      try {
        await initPromise;
      } finally {
        const latestState = get();
        if (latestState._initializingUserId === userId) {
          set({ _initPromise: null, _initializingUserId: null });
        } else {
          set({ _initPromise: null });
        }
      }
    },

    // ── COMPLETING / FAILING ──────────────────────────────────────
    completeHabit(habitId) {
      const state = get();
      const today = getTodayKey();
      const habit = state.habits.find(h => h.id === habitId);
      if (!habit) return;
      if (!isHabitDueOnDate(habit, today, state.history)) return;
      if (state.history[today]?.[habitId] === 'completed') return; // already done

      const activeEffects = state._getActiveEffects();
      const earned = calcPoints(habit, activeEffects);

      // Lógica de multiplicador para completar
      let newMult = calcMultiplierOnComplete(habit, activeEffects);

      // DEGRADACIÓN DE FUSIÓN: -0.4 incluso al completar
      const fusionEffect = activeEffects.find(e =>
        e.key === 'fusion_degradation' && e.targetHabitId === habitId
      );
      if (fusionEffect && get()._shouldDegradeFusionToday(habit, fusionEffect, new Date())) {
        newMult = parseFloat(Math.max(3.0, newMult - (fusionEffect.degradationAmount || 0.4)).toFixed(1));
        get()._pushNotification('item', `🧪 Hábito fusionado: se aplica degradación diaria (-0.4). Nuevo: ×${newMult.toFixed(1)}`);
      }

      const newPoints = state.points + earned;
      const newLifetime = state.lifetimePoints + earned;

      // Consume "next_triple" if present for this specific habit or global
      const usedEffect = state.activeEffects.find(e =>
        e.key === 'next_triple' && effectAppliesTo(e, habitId)
      );

      // Decrement phoenix_bonus usesRemaining if present for this habit
      let nextEffects = usedEffect
        ? state.activeEffects.filter(e => e !== usedEffect)
        : state.activeEffects;

      nextEffects = nextEffects.map(e => {
        if (e.key === 'phoenix_bonus' && e.targetHabitId === habitId && (e.usesRemaining ?? 0) > 0) {
          const newUsesRemaining = e.usesRemaining - 1;
          return newUsesRemaining > 0 ? { ...e, usesRemaining: newUsesRemaining } : null;
        }
        return e;
      }).filter(Boolean);

      // Update history
      const newHistory = {
        ...state.history,
        [today]: { ...(state.history[today] ?? {}), [habitId]: 'completed' },
      };

      const { finalLevel, finalPoints, rewards: journeyRewards } = resolveJourneyProgress({
        level: state.level,
        points: state.points,
        earnedPoints: earned,
        unlockedStories: state.unlockedStories,
        pickJourneyItemChoices: get()._pickJourneyRewards,
      });

      set(state2 => ({
        habits: state2.habits.map(h =>
          h.id === habitId
            ? { ...h, multiplier: newMult, streak: h.streak + 1 }
            : h
        ),
        points: finalPoints,
        lifetimePoints: newLifetime,
        level: finalLevel,
        history: newHistory,
        activeEffects: nextEffects,
        journeyRewardQueue: [...state2.journeyRewardQueue, ...journeyRewards],
      }));

      // Persistir en BD (fire & forget)
      const userId = get()._userId;
      if (userId) {
        const updatedHabit = get().habits.find(h => h.id === habitId);
        if (updatedHabit) saveHabit(userId, updatedHabit).catch(() => { });
        saveHabitEntry(userId, habitId, today, 'completed').catch(() => { });
        saveProfile(userId, { level: finalLevel, points: finalPoints, lifetimePoints: newLifetime, globalStreak: get().globalStreak, lastWeeklyProcessDate: get().lastWeeklyProcessDate }).catch(() => { });
        saveActiveEffects(userId, nextEffects).catch(() => { });
        journeyRewards.forEach(reward => {
          if (reward.story) saveStory(userId, reward.journeyNumber, reward.story.id).catch(() => { });
        });
      }

      get()._pushNotification('complete', `+${earned} pts — ×${newMult.toFixed(1)}`);
      get()._recalcGlobalStreak();
      get()._checkAchievements();
      get()._updateDailyProgress();
    },

    /**
     * Mark habit as done for LESS time than configured.
     * - Uses the actual minutes provided for points.
     * - Multiplier increases as in a normal completion.
     * - Keeps/extends the streak.
     * - History status: "partial" (shown en amarillo).
     */
    completeHabitPartial(habitId, minutesDone) {
      const state = get();
      const today = getTodayKey();
      const habit = state.habits.find(h => h.id === habitId);
      if (!habit) return;
      if (!isHabitDueOnDate(habit, today, state.history)) return;
      if (state.history[today]?.[habitId]) return; // already resolved today

      const activeEffects = state._getActiveEffects();

      // Points calculation reusing the same bonus effects as calcPoints,
      // but with the real minutes done.
      const basePoints = minutesDone * habit.multiplier;
      let bonusMult = 1;
      if (activeEffects.some(e => e.key === 'double_points')) bonusMult *= 2;
      if (activeEffects.some(e => e.key === 'triple_points')) bonusMult *= 3;
      const nextTripleEffect = activeEffects.find(e => e.key === 'next_triple' &&
        effectAppliesTo(e, habitId));
      if (nextTripleEffect) bonusMult *= 3;
      let earned = Math.round(basePoints * bonusMult);

      // Apply phoenix_bonus to points
      const phoenixEffectPartial = activeEffects.find(e => 
        e.key === 'phoenix_bonus' && 
        e.targetHabitId === habitId && 
        (e.usesRemaining ?? 0) > 0
      );
      if (phoenixEffectPartial) earned = earned * phoenixEffectPartial.value;

      const newMult = calcMultiplierOnComplete(habit, activeEffects);
      const newPoints = state.points + earned;
      const newLifetime = state.lifetimePoints + earned;

      // Consume "next_triple" if present
      let nextEffects = nextTripleEffect
        ? state.activeEffects.filter(e => e !== nextTripleEffect)
        : state.activeEffects;

      // Decrement phoenix_bonus usesRemaining if present for this habit
      nextEffects = nextEffects.map(e => {
        if (e.key === 'phoenix_bonus' && e.targetHabitId === habitId && (e.usesRemaining ?? 0) > 0) {
          const newUsesRemaining = e.usesRemaining - 1;
          return newUsesRemaining > 0 ? { ...e, usesRemaining: newUsesRemaining } : null;
        }
        return e;
      }).filter(Boolean);

      // Update history
      const newHistory = {
        ...state.history,
        [today]: { ...(state.history[today] ?? {}), [habitId]: 'partial' },
      };

      const { finalLevel, finalPoints, rewards: journeyRewards } = resolveJourneyProgress({
        level: state.level,
        points: state.points,
        earnedPoints: earned,
        unlockedStories: state.unlockedStories,
        pickJourneyItemChoices: get()._pickJourneyRewards,
      });

      set(state2 => ({
        habits: state2.habits.map(h =>
          h.id === habitId
            ? { ...h, multiplier: newMult, streak: h.streak + 1 }
            : h
        ),
        points: finalPoints,
        lifetimePoints: newLifetime,
        level: finalLevel,
        history: newHistory,
        activeEffects: nextEffects,
        journeyRewardQueue: [...state2.journeyRewardQueue, ...journeyRewards],
      }));

      // Persistir en BD (fire & forget)
      const userId2 = get()._userId;
      if (userId2) {
        const updatedHabit = get().habits.find(h => h.id === habitId);
        if (updatedHabit) saveHabit(userId2, updatedHabit).catch(() => { });
        saveHabitEntry(userId2, habitId, today, 'partial').catch(() => { });
        saveProfile(userId2, { level: finalLevel, points: finalPoints, lifetimePoints: newLifetime, globalStreak: get().globalStreak, lastWeeklyProcessDate: get().lastWeeklyProcessDate }).catch(() => { });
        saveActiveEffects(userId2, nextEffects).catch(() => { });
        journeyRewards.forEach(reward => {
          if (reward.story) saveStory(userId2, reward.journeyNumber, reward.story.id).catch(() => { });
        });
      }

      get()._pushNotification('complete', `+${earned} pts — ×${newMult.toFixed(1)} (parcial)`);
      get()._recalcGlobalStreak();
      get()._checkAchievements();
      get()._updateDailyProgress();
    },

    /**
     * Mark habit as done for MORE time than configured.
     * - Uses the actual minutes provided for points.
     * - Multiplier increases as in a normal completion.
     * - History status: "over" (tick violeta).
     */
    completeHabitOvertime(habitId, minutesDone) {
      const state = get();
      const today = getTodayKey();
      const habit = state.habits.find(h => h.id === habitId);
      if (!habit) return;
      if (!isHabitDueOnDate(habit, today, state.history)) return;
      if (state.history[today]?.[habitId]) return; // already resolved today

      const activeEffects = state._getActiveEffects();

      // Points based on real minutes done, preserving bonus effects.
      const basePoints = minutesDone * habit.multiplier;
      let bonusMult = 1;
      if (activeEffects.some(e => e.key === 'double_points')) bonusMult *= 2;
      if (activeEffects.some(e => e.key === 'triple_points')) bonusMult *= 3;
      const nextTripleEffect = activeEffects.find(e => e.key === 'next_triple' &&
        effectAppliesTo(e, habitId));
      if (nextTripleEffect) bonusMult *= 3;
      let earned = Math.round(basePoints * bonusMult);

      // Apply phoenix_bonus to points
      const phoenixEffectOvertime = activeEffects.find(e => 
        e.key === 'phoenix_bonus' && 
        e.targetHabitId === habitId && 
        (e.usesRemaining ?? 0) > 0
      );
      if (phoenixEffectOvertime) earned = earned * phoenixEffectOvertime.value;

      const newMult = calcMultiplierOnComplete(habit, activeEffects);
      const newPoints = state.points + earned;
      const newLifetime = state.lifetimePoints + earned;

      // Consume "next_triple" if present
      let nextEffects = nextTripleEffect
        ? state.activeEffects.filter(e => e !== nextTripleEffect)
        : state.activeEffects;

      // Decrement phoenix_bonus usesRemaining if present for this habit
      nextEffects = nextEffects.map(e => {
        if (e.key === 'phoenix_bonus' && e.targetHabitId === habitId && (e.usesRemaining ?? 0) > 0) {
          const newUsesRemaining = e.usesRemaining - 1;
          return newUsesRemaining > 0 ? { ...e, usesRemaining: newUsesRemaining } : null;
        }
        return e;
      }).filter(Boolean);

      // Update history
      const newHistory = {
        ...state.history,
        [today]: { ...(state.history[today] ?? {}), [habitId]: 'over' },
      };

      const { finalLevel, finalPoints, rewards: journeyRewards } = resolveJourneyProgress({
        level: state.level,
        points: state.points,
        earnedPoints: earned,
        unlockedStories: state.unlockedStories,
        pickJourneyItemChoices: get()._pickJourneyRewards,
      });

      set(state2 => ({
        habits: state2.habits.map(h =>
          h.id === habitId
            ? { ...h, multiplier: newMult, streak: h.streak + 1 }
            : h
        ),
        points: finalPoints,
        lifetimePoints: newLifetime,
        level: finalLevel,
        history: newHistory,
        activeEffects: nextEffects,
        journeyRewardQueue: [...state2.journeyRewardQueue, ...journeyRewards],
      }));

      // Persistir en BD (fire & forget)
      const userId3 = get()._userId;
      if (userId3) {
        const updatedHabit = get().habits.find(h => h.id === habitId);
        if (updatedHabit) saveHabit(userId3, updatedHabit).catch(() => { });
        saveHabitEntry(userId3, habitId, today, 'over').catch(() => { });
        saveProfile(userId3, { level: finalLevel, points: finalPoints, lifetimePoints: newLifetime, globalStreak: get().globalStreak, lastWeeklyProcessDate: get().lastWeeklyProcessDate }).catch(() => { });
        saveActiveEffects(userId3, nextEffects).catch(() => { });
        journeyRewards.forEach(reward => {
          if (reward.story) saveStory(userId3, reward.journeyNumber, reward.story.id).catch(() => { });
        });
      }

      get()._pushNotification('complete', `+${earned} pts — ×${newMult.toFixed(1)} (extra)`);
      get()._recalcGlobalStreak();
      get()._checkAchievements();
      get()._updateDailyProgress();
    },


    failHabit(habitId) {
      const state = get();
      const today = getTodayKey();
      const habit = state.habits.find(h => h.id === habitId);
      if (!habit) return;
      if (!isHabitDueOnDate(habit, today, state.history)) return;
      if (state.history[today]?.[habitId]) return;

      // Lógica de multiplicador para fallo
      const activeEffects = state._getActiveEffects();
      let newMult = calcMultiplierOnFail(habit, activeEffects);

      // Consume shield if used
      let newActiveEffects = [...state.activeEffects];
      const shield = newActiveEffects.find(e => e.key === 'golden_shield') || newActiveEffects.find(e => e.key === 'streak_shield');
      if (shield) {
        newActiveEffects = newActiveEffects.filter(e => e !== shield);
        const msg = shield.key === 'golden_shield'
          ? `⭐ Racha Dorada consumida: ¡Protección y +0.2 al multiplicador!`
          : `🛡️ ${shield.itemName || 'Escudo'} consumido: ¡Multiplicador protegido!`;
        get()._pushNotification('item', msg);
      }

      // DOBLE PENALIZACIÓN: fallo normal + degradación de fusión
      const fusionEffect = activeEffects.find(e =>
        e.key === 'fusion_degradation' && e.targetHabitId === habitId
      );
      if (fusionEffect && get()._shouldDegradeFusionToday(habit, fusionEffect, today)) {
        newMult = parseFloat(Math.max(1.0, newMult - (fusionEffect.degradationAmount || 0.4)).toFixed(1));
        get()._pushNotification('fail', `🧪 Hábito fusionado: ¡DOBLE PENALIZACIÓN POR FALLAR!`);
      }

      // Si baja de 3.0, el efecto de fusión termina
      if (newMult <= 3.0 && fusionEffect) {
        newActiveEffects = newActiveEffects.filter(e => e !== fusionEffect);
        get()._pushNotification('item', `✨ El efecto de fusión ha terminado para "${habit.name}".`);
      }

      const gemLoss = removeGemIfLostThreshold(newActiveEffects, habitId, newMult);
      newActiveEffects = gemLoss.effects;

      const newHistory = {
        ...state.history,
        [today]: { ...(state.history[today] ?? {}), [habitId]: 'failed' },
      };

      set(state2 => ({
        habits: state2.habits.map(h =>
          h.id === habitId ? { ...h, multiplier: newMult, streak: 0 } : h
        ),
        history: newHistory,
        activeEffects: newActiveEffects,
      }));

      // Persistir en BD (fire & forget)
      const userId5 = get()._userId;
      if (userId5) {
        const updatedHabit = get().habits.find(h => h.id === habitId);
        if (updatedHabit) saveHabit(userId5, updatedHabit).catch(() => { });
        saveHabitEntry(userId5, habitId, today, 'failed').catch(() => { });
        if (newActiveEffects.length !== state.activeEffects.length) saveActiveEffects(userId5, newActiveEffects).catch(() => { });
        saveProfile(userId5, { level: get().level, points: get().points, lifetimePoints: get().lifetimePoints, globalStreak: get().globalStreak, lastWeeklyProcessDate: get().lastWeeklyProcessDate }).catch(() => { });
      }

      get()._pushNotification('fail', `Penalización: ×${newMult.toFixed(1)}`);
      if (gemLoss.removed) {
        get()._pushNotification('item', '💠 La Gema del Multiplicador se perdió al bajar de ×3.0.');
      }
      get()._recalcGlobalStreak();
      get()._updateDailyProgress();
    },

    // ── ITEMS ──────────────────────────────────────────────────────
    useItem(itemId, targetHabitId = null, quantity = 1) {
      const state = get();
      const item = ITEMS[itemId];
      if (!item) return;
      const invEntry = state.inventory.find(i => i.itemId === itemId);
      if (!invEntry || invEntry.qty < 1) return;

      // Remove one from inventory
      const newInventory = state.inventory
        .map(i => i.itemId === itemId ? { ...i, qty: i.qty - 1 } : i)
        .filter(i => i.qty > 0);

      if (item.effectType === 'timed') {
        if (requiresTargeting(item.effectKey) && !targetHabitId) {
          get()._pushNotification('item', 'Debes seleccionar un hábito para usar este objeto.');
          return;
        }

        // Support both global and targeted timed effects
        const effect = requiresTargeting(item.effectKey) && targetHabitId
          ? createTargetedEffect(item, targetHabitId)
          : {
            key: item.effectKey,
            value: item.effectValue,
            expiresAt: (() => {
              const expires = new Date();
              expires.setDate(expires.getDate() + item.durationDays);
              return expires.toISOString();
            })(),
            itemName: item.name,
          };

        set(state2 => ({
          inventory: newInventory,
          activeEffects: [...state2.activeEffects, effect],
        }));

        // Persistir en BD
        const uid = get()._userId;
        if (uid) {
          queueInventorySave(uid, () => get().inventory);
          saveActiveEffects(uid, get().activeEffects).catch(() => { });
        }
        get()._pushNotification('item', `${item.icon} ${item.name} activado!`);
      }
      else if (item.effectType === 'passive') {
        if (requiresTargeting(item.effectKey) && !targetHabitId) {
          get()._pushNotification('item', 'Debes seleccionar un hábito para usar este objeto.');
          return;
        }

        // Support both global and targeted passive effects  
        const effect = requiresTargeting(item.effectKey) && targetHabitId
          ? createTargetedEffect(item, targetHabitId)
          : {
            key: item.effectKey,
            value: item.effectValue,
            itemName: item.name,
          };

        set(state2 => ({
          inventory: newInventory,
          activeEffects: [...state2.activeEffects, effect],
        }));

        // Persistir en BD
        const uid = get()._userId;
        if (uid) {
          queueInventorySave(uid, () => get().inventory);
          saveActiveEffects(uid, get().activeEffects).catch(() => { });
        }
        get()._pushNotification('item', `${item.icon} ${item.name} equipado!`);
      }
      else if (item.effectType === 'instant') {
        if ((item.effectKey === 'mult_recovery' || item.effectKey === 'perm_base_mult' || item.effectKey === 'mult_boost_target' || item.effectKey === 'habit_mult_boost_target' || item.effectKey === 'delete_habit' || item.effectKey === 'phoenix_restore') && !targetHabitId) {
          get()._pushNotification('item', 'Debes seleccionar un hábito para usar este objeto.');
          return;
        }

        if (item.effectKey === 'fusion' && (!targetHabitId || !Array.isArray(targetHabitId) || targetHabitId.length !== 2)) {
          get()._pushNotification('item', 'Selecciona exactamente 2 hábitos para fusionar.');
          return;
        }

        if (item.effectKey === 'perm_base_mult' && targetHabitId && hasPermanentMultiplierGem(targetHabitId, state.activeEffects)) {
          get()._pushNotification('item', 'Ese hábito ya tiene activa la Gema del Multiplicador.');
          return;
        }

        // Legacy instant effects that modify habits/state directly
        if (item.effectKey === 'double_streak') {
          const nextStreak = Math.max(1, (state.globalStreak ?? 0) * 2);
          set({
            inventory: newInventory,
            globalStreak: nextStreak,
          });
          const uid = get()._userId;
          if (uid) {
            queueInventorySave(uid, () => get().inventory);
            saveProfile(uid, {
              level: get().level,
              points: get().points,
              lifetimePoints: get().lifetimePoints,
              globalStreak: nextStreak,
              lastWeeklyProcessDate: get().lastWeeklyProcessDate,
            }).catch(() => { });
          }
        } else if (item.effectKey === 'copy_multiplier') {
          const highest = Math.max(1.0, ...state.habits.map(h => h.multiplier ?? 1.0));
          set(state2 => ({
            inventory: newInventory,
            habits: state2.habits.map(h => {
              const cap = getHabitMultiplierCap(h.id, state2.activeEffects);
              const copied = parseFloat(Math.min(cap, highest).toFixed(1));
              return { ...h, multiplier: copied };
            }),
          }));
          const uid = get()._userId;
          if (uid) {
            queueInventorySave(uid, () => get().inventory);
            saveHabits(uid, get().habits).catch(() => { });
          }
        } else if (item.effectKey === 'delete_habit' && targetHabitId) {
          set(state2 => ({
            inventory: newInventory,
            habits: state2.habits.filter(h => h.id !== targetHabitId),
            activeEffects: state2.activeEffects.filter(e => e.targetHabitId !== targetHabitId),
          }));

          const uid = get()._userId;
          if (uid) {
            queueInventorySave(uid, () => get().inventory);
            saveActiveEffects(uid, get().activeEffects).catch(() => { });
            // Para "Vacío": eliminamos solo el hábito, conservando historial/estadísticas.
            supabase.from('habits').delete().eq('id', targetHabitId).catch(() => { });
          }
          get()._recalcGlobalStreak();
        } else if (item.effectKey === 'mult_recovery' && targetHabitId) {
          set(state2 => ({
            inventory: newInventory,
            habits: state2.habits.map(h =>
              h.id === targetHabitId
                ? (() => {
                  const cap = getHabitMultiplierCap(h.id, state2.activeEffects);
                  return { ...h, multiplier: Math.min(cap, parseFloat((h.multiplier + item.effectValue).toFixed(1))) };
                })()
                : h
            ),
          }));
          const uid = get()._userId;
          if (uid) {
            queueInventorySave(uid, () => get().inventory);
            const updatedHabit = get().habits.find(h => h.id === targetHabitId);
            if (updatedHabit) saveHabit(uid, updatedHabit).catch(() => { });
          }
        } else if (item.effectKey === 'perm_base_mult' && targetHabitId) {
          set(state2 => ({
            inventory: newInventory,
            activeEffects: [...state2.activeEffects.filter(e => !(e.key === 'perm_base_mult' && e.targetHabitId === targetHabitId)), {
              key: 'perm_base_mult',
              value: item.effectValue,
              targetHabitId,
              itemName: item.name,
            }],
          }));
          const uid = get()._userId;
          if (uid) {
            queueInventorySave(uid, () => get().inventory);
            saveActiveEffects(uid, get().activeEffects).catch(() => { });
          }
        } else if ((item.effectKey === 'mult_boost_target' || item.effectKey === 'habit_mult_boost_target') && targetHabitId) {
          set(state2 => ({
            inventory: newInventory,
            habits: state2.habits.map(h =>
              h.id === targetHabitId
                ? (() => {
                  const cap = getHabitMultiplierCap(h.id, state2.activeEffects);
                  return { ...h, multiplier: Math.min(cap, parseFloat((h.multiplier + item.effectValue).toFixed(1))) };
                })()
                : h
            ),
          }));
          const uid = get()._userId;
          if (uid) {
            queueInventorySave(uid, () => get().inventory);
            const updatedHabit = get().habits.find(h => h.id === targetHabitId);
            if (updatedHabit) saveHabit(uid, updatedHabit).catch(() => { });
          }
        } else if (item.effectKey === 'fusion' && Array.isArray(targetHabitId) && targetHabitId.length === 2) {
          const [h1Id, h2Id] = targetHabitId;
          const h1 = state.habits.find(h => h.id === h1Id);
          const h2 = state.habits.find(h => h.id === h2Id);

          if (!h1 || !h2) {
            get()._pushNotification('item', 'Error: Hábitos no encontrados.');
            return;
          }

          // Sumar multiplicadores sin límite
          const fusedMult = parseFloat((Number(h1.multiplier ?? 1) + Number(h2.multiplier ?? 1)).toFixed(1));

          const newActiveEffects = [
            ...state.activeEffects,
            {
              key: 'fusion_degradation',
              targetHabitId: h1Id,
              itemName: 'Poción de Fusión',
              degradationAmount: 0.4,
              habitPeriodicityInfo: {
                periodicity: h1.periodicity,
                weeklyTimesTarget: h1.weeklyTimesTarget,
                customPattern: h1.customPattern,
                customDays: h1.customDays,
                customInterval: h1.customInterval
              },
              createdAt: new Date().toISOString()
            },
            {
              key: 'fusion_degradation',
              targetHabitId: h2Id,
              itemName: 'Poción de Fusión',
              degradationAmount: 0.4,
              habitPeriodicityInfo: {
                periodicity: h2.periodicity,
                weeklyTimesTarget: h2.weeklyTimesTarget,
                customPattern: h2.customPattern,
                customDays: h2.customDays,
                customInterval: h2.customInterval
              },
              createdAt: new Date().toISOString()
            }
          ];

          set(state2 => ({
            inventory: newInventory,
            habits: state2.habits.map(h =>
              (h.id === h1Id || h.id === h2Id) ? { ...h, multiplier: fusedMult } : h
            ),
            activeEffects: newActiveEffects
          }));

          const uid = get()._userId;
          if (uid) {
            queueInventorySave(uid, () => get().inventory);
            saveHabits(uid, get().habits).catch(() => { });
            saveActiveEffects(uid, get().activeEffects).catch(() => { });
          }
          get()._pushNotification('item', `🧪 ¡Fusión exitosa! Multiplicador: ×${fusedMult.toFixed(1)}`);
        } else if (item.effectKey === 'phoenix_restore' && targetHabitId) {
          const targetHabit = state.habits.find(h => h.id === targetHabitId);

          if (!targetHabit) {
            get()._pushNotification('item', 'Hábito no encontrado.');
            return;
          }

          if ((targetHabit.multiplier ?? 1) >= 3) {
            get()._pushNotification('item', 'Este hábito ya tiene multiplicador ×3 o superior.');
            return;
          }

          // Establecer multiplicador a 3.0
          set(state2 => ({
            inventory: newInventory,
            habits: state2.habits.map(h =>
              h.id === targetHabitId ? { ...h, multiplier: 3.0 } : h
            ),
            activeEffects: [...state2.activeEffects, {
              key: 'phoenix_bonus',
              value: 2, // multiplicador de puntos
              targetHabitId,
              usesRemaining: 5,
              itemName: item.name,
            }],
          }));

          const uid = get()._userId;
          if (uid) {
            queueInventorySave(uid, () => get().inventory);
            const updatedHabit = get().habits.find(h => h.id === targetHabitId);
            if (updatedHabit) saveHabit(uid, updatedHabit).catch(() => { });
            saveActiveEffects(uid, get().activeEffects).catch(() => { });
          }
        } else if (item.effectKey === 'void_exchange') {
          const currentQty = (state.inventory.find(i => i.itemId === itemId)?.qty ?? 0) + 1;
          if (quantity > currentQty) {
            get()._pushNotification('item', 'No tienes suficientes Piedras del Vacío.');
            return;
          }

          const rarityMap = { 2: 'common', 4: 'rare', 6: 'epic', 10: 'legendary' };
          const rarity = rarityMap[quantity] || 'common';

          const itemsOfRarity = Object.values(ITEMS).filter(i => i.rarity === rarity && i.id !== 'void_stone');
          if (itemsOfRarity.length === 0) {
            get()._pushNotification('item', 'No hay objetos de esta rareza disponibles.');
            return;
          }

          const randomItem = itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)];

          const stonesToRemove = quantity - 1;
          const finalInventory = stonesToRemove > 0
            ? newInventory.map(i => i.itemId === itemId ? { ...i, qty: i.qty - stonesToRemove } : i).filter(i => i.qty > 0)
            : newInventory;

          const randomExistingQty = finalInventory.find(i => i.itemId === randomItem.id)?.qty ?? 0;
          const mergedInventory = finalInventory
            .filter(i => i.itemId !== randomItem.id)
            .concat({ itemId: randomItem.id, qty: randomExistingQty + 1 })
            .filter(i => i.qty > 0);

          set(state2 => ({
            inventory: mergedInventory,
          }));

          const uid = get()._userId;
          if (uid) queueInventorySave(uid, () => get().inventory);

          get()._pushNotification('item', `✨ Has recibido: ${randomItem.icon} ${randomItem.name}!`, randomItem.id);
        }
        // Handle targeted effects using generic system
        else if (requiresTargeting(item.effectKey) && targetHabitId) {
          const targetedEffect = createTargetedEffect(item, targetHabitId);
          set(state2 => ({
            inventory: newInventory,
            activeEffects: [...state2.activeEffects, targetedEffect],
          }));
          const uid = get()._userId;
          if (uid) {
            queueInventorySave(uid, () => get().inventory);
            saveActiveEffects(uid, get().activeEffects).catch(() => { });
          }
        } else {
          set({ inventory: newInventory });
          const uid = get()._userId;
          if (uid) queueInventorySave(uid, () => get().inventory);
        }
        get()._pushNotification('item', `${item.icon} ${item.name} usado!`);
      }
    },

    grantItem(itemId) {
      const item = ITEMS[itemId];
      if (!item) return;
      set(state => {
        const existing = state.inventory.find(i => i.itemId === itemId);
        if (itemId === 'multiplier_gem' && existing?.qty >= 1) {
          return {};
        }
        const maxStack = item.maxStack ?? 99;
        if (existing && existing.qty >= maxStack) return {};
        return {
          inventory: existing
            ? state.inventory.map(i => i.itemId === itemId ? { ...i, qty: i.qty + 1 } : i)
            : [...state.inventory, { itemId, qty: 1 }],
        };
      });
      // Persistir en BD
      const uid = get()._userId;
      if (uid) queueInventorySave(uid, () => get().inventory);
    },

    // ── JOURNEY REWARDS ───────────────────────────────────────────

    /**
     * Called when the user closes the story modal after completing a journey.
     * Grants all 3 item rewards, records the story unlock, and consumes the queue.
     */
    claimJourneyItems() {
      const state = get();
      const reward = state.journeyRewardQueue[0];
      if (!reward) return;

      // Record the story as unlocked in the store
      const alreadyUnlocked = reward.story
        ? state.unlockedStories.some(s => s.storyId === reward.story.id)
        : false;
      const newStory = reward.story
        && !alreadyUnlocked
        ? { journeyId: reward.journeyNumber, storyId: reward.story.id, unlockedAt: new Date().toISOString() }
        : null;

      set(state2 => ({
        journeyRewardQueue: state2.journeyRewardQueue.slice(1),
        unlockedStories: newStory
          ? [...state2.unlockedStories, newStory]
          : state2.unlockedStories,
      }));

      // Grant all 3 items
      if (reward.itemChoices && reward.itemChoices.length > 0) {
        reward.itemChoices.forEach(itemId => {
          get().grantItem(itemId);
        });
      }

      // Get item names for notification
      const itemNames = reward.itemChoices
        ? reward.itemChoices.map(id => ITEMS[id]?.name || id).join(', ')
        : '';

      get()._pushNotification('journey', `¡VIAJE ${reward.journeyNumber} COMPLETADO! +${reward.itemChoices?.length || 0} objetos${itemNames ? `: ${itemNames}` : ''}`, reward.journeyNumber);
      get()._checkAchievements();
    },

    /**
     * Picks 3 random items for journey completion.
     * - 2 items: 70% common, 30% rare
     * - 1 item: 70% epic, 30% legendary
     */
    _pickJourneyRewards(journeyNumber) {
      const allItemIds = Object.keys(ITEMS);
      const chosen = [];
      const usedIds = new Set();

      const rarity1 = Math.random() < 0.7 ? 'common' : 'rare';
      const rarity2 = Math.random() < 0.7 ? 'common' : 'rare';
      const rarity3 = Math.random() < 0.7 ? 'epic' : 'legendary';

      const rarities = [rarity1, rarity2, rarity3];

      for (const rarity of rarities) {
        let pool = allItemIds.filter(id => ITEMS[id].rarity === rarity && !usedIds.has(id));
        if (pool.length === 0) {
          pool = allItemIds.filter(id => !usedIds.has(id));
        }
        const pick = pool[Math.floor(Math.random() * pool.length)];
        if (pick) {
          chosen.push(pick);
          usedIds.add(pick);
        }
      }

      return chosen;
    },

    // Compatibilidad: hay llamadas existentes que esperan este nombre.
    _pickJourneyItemChoices(journeyNumber) {
      return get()._pickJourneyRewards(journeyNumber);
    },

    _pickDailyItemChoices(daily) {
      if (!daily) return [];
      const dailyPool = Array.isArray(daily.rewards?.items) ? [...daily.rewards.items] : [];
      const basePool = Array.from(new Set(dailyPool.length ? dailyPool : Object.keys(ITEMS)));
      const availablePool = [...basePool];
      const pickCount = 3;
      const choices = [];

      for (let i = 0; i < pickCount && availablePool.length > 0; i++) {
        const idx = Math.floor(Math.random() * availablePool.length);
        choices.push(availablePool[idx]);
        availablePool.splice(idx, 1);
      }

      if (choices.length < pickCount) {
        const fallback = Object.keys(ITEMS).filter(id => !choices.includes(id));
        while (choices.length < pickCount && fallback.length) {
          const idx = Math.floor(Math.random() * fallback.length);
          choices.push(fallback[idx]);
          fallback.splice(idx, 1);
        }
      }

      return choices;
    },

    // ── INTERNAL ──────────────────────────────────────────────────
    _getActiveEffects() {
      const now = new Date();
      return get().activeEffects.filter(e =>
        !e.expiresAt || new Date(e.expiresAt) > now
      );
    },

    _purgeExpiredEffects() {
      const now = new Date();
      const state = get();
      const purged = state.activeEffects.filter(e =>
        !e.expiresAt || new Date(e.expiresAt) > now
      );
      set({ activeEffects: purged });
      const uid = get()._userId;
      if (uid && purged.length !== state.activeEffects.length) saveActiveEffects(uid, purged).catch(() => { });
    },

    _processExpiredHabits() {
      const state = get();
      const today = getTodayKey();

      const isCompletedStatus = (status) =>
        status === 'completed' || status === 'partial' || status === 'over';

      const failedEntries = [];
      const updatedHabits = [...state.habits];
      const newHistory = { ...state.history };
      const activeEffects = state._getActiveEffects();
      let nextActiveEffects = [...activeEffects];
      let removedGemCount = 0;

      for (const habit of state.habits) {
        if (habit.periodicity === 'weekly_times' || habit.periodicity === 'custom') continue;

        const habitCreatedDate = new Date(habit.createdAt);
        habitCreatedDate.setHours(0, 0, 0, 0);
        const todayDate = new Date(today + 'T12:00:00');

        if (habit.periodicity === 'daily') {
          for (let d = new Date(habitCreatedDate); d <= todayDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const dayStatus = newHistory[dateStr]?.[habit.id];

            if (!isCompletedStatus(dayStatus) && dayStatus !== 'failed') {
              if (!newHistory[dateStr]) newHistory[dateStr] = {};
              newHistory[dateStr][habit.id] = 'failed';
              failedEntries.push({ habitId: habit.id, date: dateStr, status: 'failed' });

              const habitIndex = updatedHabits.findIndex(h => h.id === habit.id);
              if (habitIndex !== -1) {
                // DOBLE PENALIZACIÓN EN PROCESO AUTOMÁTICO
                let newMult = calcMultiplierOnFail(habit, nextActiveEffects);

                // Consume shield if used
                const shield = nextActiveEffects.find(e => e.key === 'golden_shield') || nextActiveEffects.find(e => e.key === 'streak_shield');
                if (shield) {
                  nextActiveEffects = nextActiveEffects.filter(e => e !== shield);
                }

                const fusionEffect = nextActiveEffects.find(e => e.key === 'fusion_degradation' && e.targetHabitId === habit.id);
                if (fusionEffect && get()._shouldDegradeFusionToday(habit, fusionEffect, new Date(dateStr + 'T12:00:00'))) {
                  newMult = parseFloat(Math.max(1.0, newMult - (fusionEffect.degradationAmount || 0.4)).toFixed(1));
                  if (newMult <= 3.0) {
                    nextActiveEffects = nextActiveEffects.filter(e => e !== fusionEffect);
                  }
                }

                const gemLoss = removeGemIfLostThreshold(nextActiveEffects, habit.id, newMult);
                nextActiveEffects = gemLoss.effects;
                if (gemLoss.removed) removedGemCount += 1;
                updatedHabits[habitIndex] = {
                  ...updatedHabits[habitIndex],
                  multiplier: newMult,
                  streak: 0
                };
              }
            }
          }
        } else if (habit.periodicity === 'weekly') {
          let currentWeekStart = getWeekStart(habitCreatedDate.toISOString().split('T')[0]);
          let currentWeekStartDate = new Date(currentWeekStart + 'T12:00:00');
          const todayWeekStart = getWeekStart(today);
          const todayWeekStartDate = new Date(todayWeekStart + 'T12:00:00');

          while (currentWeekStartDate <= todayWeekStartDate) {
            const weekEnd = getWeekEnd(currentWeekStart);
            const weekEndDate = new Date(weekEnd + 'T12:00:00');
            const now = new Date();

            if (now >= weekEndDate) {
              const wasAlreadyFailed = (newHistory[weekEnd]?.[habit.id] === 'failed');
              if (!wasAlreadyFailed && !isHabitCompletedThisPeriod(habit, weekEnd, newHistory)) {
                if (!newHistory[weekEnd]) newHistory[weekEnd] = {};
                newHistory[weekEnd][habit.id] = 'failed';
                failedEntries.push({ habitId: habit.id, date: weekEnd, status: 'failed' });

                const habitIndex = updatedHabits.findIndex(h => h.id === habit.id);
                if (habitIndex !== -1) {
                  let newMult = calcMultiplierOnFail(habit, nextActiveEffects);

                  // Consume shield if used
                  const shield = nextActiveEffects.find(e => e.key === 'streak_shield' || e.key === 'golden_shield');
                  if (shield) {
                    nextActiveEffects = nextActiveEffects.filter(e => e !== shield);
                  }

                  const gemLoss = removeGemIfLostThreshold(nextActiveEffects, habit.id, newMult);
                  nextActiveEffects = gemLoss.effects;
                  if (gemLoss.removed) removedGemCount += 1;
                  updatedHabits[habitIndex] = {
                    ...updatedHabits[habitIndex],
                    multiplier: newMult,
                    streak: 0
                  };
                }
              }
            }

            currentWeekStartDate.setDate(currentWeekStartDate.getDate() + 7);
            currentWeekStart = currentWeekStartDate.toISOString().split('T')[0];
          }
        } else if (habit.periodicity === 'monthly') {
          let currentMonthStart = getMonthStart(habitCreatedDate.toISOString().split('T')[0]);
          let currentMonthStartDate = new Date(currentMonthStart + 'T12:00:00');
          const todayMonthStart = getMonthStart(today);
          const todayMonthStartDate = new Date(todayMonthStart + 'T12:00:00');

          while (currentMonthStartDate <= todayMonthStartDate) {
            const monthEnd = getMonthEnd(currentMonthStart);
            const monthEndDate = new Date(monthEnd + 'T12:00:00');
            const now = new Date();

            if (now >= monthEndDate) {
              const wasAlreadyFailed = (newHistory[monthEnd]?.[habit.id] === 'failed');
              if (!wasAlreadyFailed && !isHabitCompletedThisPeriod(habit, monthEnd, newHistory)) {
                if (!newHistory[monthEnd]) newHistory[monthEnd] = {};
                newHistory[monthEnd][habit.id] = 'failed';
                failedEntries.push({ habitId: habit.id, date: monthEnd, status: 'failed' });

                const habitIndex = updatedHabits.findIndex(h => h.id === habit.id);
                if (habitIndex !== -1) {
                  let newMult = calcMultiplierOnFail(habit, nextActiveEffects);

                  // Consume shield if used
                  const shield = nextActiveEffects.find(e => e.key === 'streak_shield' || e.key === 'golden_shield');
                  if (shield) {
                    nextActiveEffects = nextActiveEffects.filter(e => e !== shield);
                  }

                  const gemLoss = removeGemIfLostThreshold(nextActiveEffects, habit.id, newMult);
                  nextActiveEffects = gemLoss.effects;
                  if (gemLoss.removed) removedGemCount += 1;
                  updatedHabits[habitIndex] = {
                    ...updatedHabits[habitIndex],
                    multiplier: newMult,
                    streak: 0
                  };
                }
              }
            }

            currentMonthStartDate.setMonth(currentMonthStartDate.getMonth() + 1);
            currentMonthStart = currentMonthStartDate.toISOString().split('T')[0];
          }
        }
      }

      if (failedEntries.length === 0) return;

      set({
        habits: updatedHabits,
        history: newHistory,
        activeEffects: nextActiveEffects,
      });

      const uid = get()._userId;
      if (uid) {
        saveHabits(uid, updatedHabits).catch(() => { });
        if (failedEntries.length > 0) saveHabitEntries(uid, failedEntries).catch(() => { });
        if (nextActiveEffects.length !== state.activeEffects.length) saveActiveEffects(uid, nextActiveEffects).catch(() => { });
      }

      const uniqueFailedHabits = [...new Set(failedEntries.map(e => e.habitId))];
      const message = uniqueFailedHabits.length === 1
        ? `Hábito marcado como fallido automáticamente`
        : `${uniqueFailedHabits.length} hábitos marcados como fallidos automáticamente`;

      get()._pushNotification('auto_fail', message);
      if (removedGemCount > 0) {
        get()._pushNotification('item', `💠 ${removedGemCount} gema(s) de multiplicador se perdieron por bajar de ×3.0.`);
      }
      get()._recalcGlobalStreak();
    },

    _processWeeklyHabits() {
      const state = get();
      const today = getTodayKey();
      const todayDate = new Date(today + 'T12:00:00');

      // Solo procesar los lunes
      if (todayDate.getDay() !== 1) return;

      // Ya procesamos esta semana
      if (state.lastWeeklyProcessDate === today) return;

      // Obtener hábitos de objetivo semanal (incluye legacy con periodicidad custom)
      const weeklyHabits = state.habits.filter(h => h.weeklyTimesTarget);
      if (weeklyHabits.length === 0) return;

      const yesterday = getYesterdayKey();
      const lastWeekStart = getWeekStart(yesterday);
      const activeEffects = state._getActiveEffects();
      let nextActiveEffects = [...activeEffects];
      let removedGemCount = 0;

      const newHistory = { ...state.history };
      const updatedHabits = [...state.habits];
      let hasChanges = false;

      weeklyHabits.forEach(habit => {
        const completions = getWeekCompletions(habit.id, state.history, yesterday);
        const target = habit.weeklyTimesTarget;

        if (completions < target) {
          const missedCount = target - completions;
          const penaltyPerMiss = 0.4;
          const totalPenalty = penaltyPerMiss * missedCount;

          // Calcular nuevo multiplicador con penalización y escudos
          let newMult = habit.multiplier;
          const shield = nextActiveEffects.find(e => e.key === 'golden_shield') ||
            nextActiveEffects.find(e => e.key === 'streak_shield') ||
            nextActiveEffects.find(e => e.key === 'balance_shield');

          if (shield) {
            if (shield.key === 'golden_shield') {
              newMult = parseFloat((habit.multiplier + 0.2).toFixed(1));
            }
            // Solo consumir si no es balance_shield (que es temporal por días, no por usos)
            if (shield.key !== 'balance_shield') {
              nextActiveEffects = nextActiveEffects.filter(e => e !== shield);
            }
          } else {
            const penaltyEffect = nextActiveEffects.find(e => e.key === 'reduced_penalty');
            const actualPenalty = penaltyEffect ? (penaltyEffect.value * missedCount) : totalPenalty;
            newMult = Math.max(1.0, parseFloat((habit.multiplier - actualPenalty).toFixed(1)));
          }

          const gemLoss = removeGemIfLostThreshold(nextActiveEffects, habit.id, newMult);
          nextActiveEffects = gemLoss.effects;
          if (gemLoss.removed) removedGemCount += 1;

          // Marcar todos los días de la semana pasada como failed (para registro)
          for (let i = 0; i < 7; i++) {
            const d = new Date(lastWeekStart + 'T12:00:00');
            d.setDate(d.getDate() + i);
            const dateKey = d.toISOString().split('T')[0];
            if (!newHistory[dateKey]) newHistory[dateKey] = {};
            if (!newHistory[dateKey][habit.id]) {
              newHistory[dateKey][habit.id] = 'failed';
              hasChanges = true;
            }
          }

          // Actualizar el hábito
          const habitIndex = updatedHabits.findIndex(h => h.id === habit.id);
          if (habitIndex !== -1) {
            updatedHabits[habitIndex] = {
              ...updatedHabits[habitIndex],
              multiplier: newMult,
              streak: 0
            };
          }
        }
      });

      if (hasChanges || weeklyHabits.some(h => {
        const completions = getWeekCompletions(h.id, state.history, yesterday);
        return completions < h.weeklyTimesTarget;
      })) {
        set({
          habits: updatedHabits,
          history: newHistory,
          activeEffects: nextActiveEffects,
          lastWeeklyProcessDate: today
        });
        // Persistir en BD (fire & forget)
        const uid = get()._userId;
        if (uid) {
          saveHabits(uid, updatedHabits).catch(() => { });
          // Persistir todas las entradas 'failed' añadidas
          const entries = [];
          for (const [date, dayMap] of Object.entries(newHistory)) {
            for (const [habitId, status] of Object.entries(dayMap)) {
              if (status === 'failed') entries.push({ habitId, date, status });
            }
          }
          if (entries.length) saveHabitEntries(uid, entries).catch(() => { });
          if (nextActiveEffects.length !== state.activeEffects.length) saveActiveEffects(uid, nextActiveEffects).catch(() => { });
          saveProfile(uid, { level: get().level, points: get().points, lifetimePoints: get().lifetimePoints, globalStreak: get().globalStreak, lastWeeklyProcessDate: today }).catch(() => { });
        }
        get()._recalcGlobalStreak();
        get()._pushNotification('weekly_review', 'Resumen semanal de hábitos procesado');
        if (removedGemCount > 0) {
          get()._pushNotification('item', `💠 ${removedGemCount} gema(s) de multiplicador se perdieron por bajar de ×3.0.`);
        }
      } else {
        set({ lastWeeklyProcessDate: today });
        const uid = get()._userId;
        if (uid) saveProfile(uid, { level: get().level, points: get().points, lifetimePoints: get().lifetimePoints, globalStreak: get().globalStreak, lastWeeklyProcessDate: today }).catch(() => { });
      }
    },

    _recalcGlobalStreak() {
      const { habits, history, globalStreak: oldStreak } = get();
      const newStreak = calcGlobalStreak(habits, history);

      const oldIsMultiple = oldStreak > 0 && oldStreak % 3 === 0;
      const newIsMultiple = newStreak > 0 && newStreak % 3 === 0;

      if (newStreak > 0 && newIsMultiple && !oldIsMultiple) {
        const rarity = newStreak >= 12 ? 'legendary'
          : newStreak >= 9 ? 'epic'
            : newStreak >= 6 ? 'rare'
              : 'common';

        const itemsOfRarity = Object.values(ITEMS).filter(i => i.rarity === rarity);
        if (itemsOfRarity.length > 0) {
          const randomItem = itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)];
          set({
            globalStreak: newStreak,
            streakReward: randomItem,
          });
          const uid = get()._userId;
          if (uid) {
            saveProfile(uid, { level: get().level, points: get().points, lifetimePoints: get().lifetimePoints, globalStreak: newStreak, lastWeeklyProcessDate: get().lastWeeklyProcessDate }).catch(() => { });
          }
          return;
        }
      }

      set({ globalStreak: newStreak });
      const uid = get()._userId;
      if (uid) saveProfile(uid, { level: get().level, points: get().points, lifetimePoints: get().lifetimePoints, globalStreak: newStreak, lastWeeklyProcessDate: get().lastWeeklyProcessDate }).catch(() => { });
    },

    clearStreakReward() {
      set({ streakReward: null });
    },

    // ── FUSION LOGIC ───────────────────────────────────────────────
    _shouldDegradeFusionToday(habit, fusionEffect, dateObj) {
      const info = fusionEffect.habitPeriodicityInfo;
      const dayOfWeek = dateObj.getDay(); // 0=Dom, 1=Lun...

      switch (info.periodicity) {
        case 'daily':
          return true;
        case 'weekly':
          if (info.weeklyTimesTarget) {
            // Distribuir según el target semanal
            const target = info.weeklyTimesTarget;
            const degradationDays = {
              1: [1], // Lun
              2: [1, 4], // Lun, Jue
              3: [1, 3, 5], // Lun, Mie, Vie
              4: [1, 2, 4, 5], // Lun, Mar, Jue, Vie
              5: [1, 2, 3, 4, 5], // Lun-Vie
              6: [1, 2, 3, 4, 5, 6], // Lun-Sab
              7: [0, 1, 2, 3, 4, 5, 6] // Todos
            };
            const activeDays = degradationDays[target] || [1, 3, 5];
            return activeDays.includes(dayOfWeek);
          }
          return dayOfWeek === 1; // Solo lunes para semanal simple
        case 'monthly':
          return dateObj.getDate() === 1; // Primero de mes
        case 'custom':
          // Reutilizar lógica de isHabitDueOnDate si es posible o imitarla
          if (info.customDays) {
            const days = info.customDays.split(',').map(Number);
            return days.includes(dayOfWeek === 0 ? 7 : dayOfWeek);
          }
          if (info.customInterval) {
            const created = new Date(habit.createdAt);
            created.setHours(0, 0, 0, 0);
            const current = new Date(dateObj);
            current.setHours(0, 0, 0, 0);
            const diffDays = Math.floor((current - created) / (1000 * 60 * 60 * 24));
            return diffDays % info.customInterval === 0;
          }
          return true;
        default:
          return true;
      }
    },

    _processFusionDegradation() {
      const state = get();
      const activeEffects = state._getActiveEffects();
      const fusionEffects = activeEffects.filter(e => e.key === 'fusion_degradation');
      if (fusionEffects.length === 0) return;

      const today = new Date();
      let hasChanges = false;
      let nextHabits = [...state.habits];
      let nextEffects = [...state.activeEffects];

      fusionEffects.forEach(effect => {
        const habit = nextHabits.find(h => h.id === effect.targetHabitId);
        if (!habit) return;

        if (get()._shouldDegradeFusionToday(habit, effect, today)) {
          hasChanges = true;
          // Degradación de -0.4 hasta un mínimo de 3.0
          const currentMult = habit.multiplier ?? 1.0;
          const nextMult = parseFloat(Math.max(3.0, currentMult - (effect.degradationAmount || 0.4)).toFixed(1));

          nextHabits = nextHabits.map(h => h.id === habit.id ? { ...h, multiplier: nextMult } : h);

          // Si llegamos a 3.0, el efecto termina
          if (nextMult <= 3.0) {
            nextEffects = nextEffects.filter(e => e !== effect);
            get()._pushNotification('item', `✨ El efecto de fusión ha terminado para "${habit.name}".`);
          }
        }
      });

      if (hasChanges) {
        set({ habits: nextHabits, activeEffects: nextEffects });
        const uid = get()._userId;
        if (uid) {
          saveHabits(uid, nextHabits).catch(() => { });
          saveActiveEffects(uid, nextEffects).catch(() => { });
        }
      }
    },

    // === SELECCIÓN ALEATORIA DE RECOMPENSAS ===
    _getItemsByRarity(rarity) {
      return Object.values(ITEMS).filter(item => item.rarity === rarity).map(item => item.id);
    },

    _selectRandomReward(rarity) {
      const POOL_CONFIG = {
        random_common: { primary: 'common', secondary: 'uncommon', primaryChance: 0.7 },
        random_uncommon: { primary: 'uncommon', secondary: 'rare', primaryChance: 0.7 },
        random_rare: { primary: 'rare', secondary: 'epic', primaryChance: 0.7 },
        random_epic: { primary: 'epic', secondary: 'legendary', primaryChance: 0.7 },
        random_legendary: { primary: 'legendary', secondary: null, primaryChance: 1.0 },
      };

      const config = POOL_CONFIG[rarity];
      if (!config) return null;

      const pool = config.secondary
        ? (Math.random() < config.primaryChance
          ? this._getItemsByRarity(config.primary)
          : this._getItemsByRarity(config.secondary))
        : this._getItemsByRarity(config.primary);

      if (pool.length === 0) return null;
      return pool[Math.floor(Math.random() * pool.length)];
    },

    _checkAchievements() {
      const state = get();
      const newlyUnlocked = [];

      ACHIEVEMENTS.forEach(ach => {
        if (state.unlockedAchievements.includes(ach.id)) return;
        try {
          if (ach.check(state)) {
            newlyUnlocked.push(ach);
          }
        } catch { }
      });

      if (newlyUnlocked.length > 0) {
        set(state2 => ({
          unlockedAchievements: [
            ...state2.unlockedAchievements,
            ...newlyUnlocked.map(a => a.id),
          ],
        }));
        // Persistir logros nuevos en BD
        const uid = get()._userId;
        if (uid) saveAchievements(uid, newlyUnlocked.map(a => a.id)).catch(() => { });

        newlyUnlocked.forEach(ach => {
          get()._pushNotification('achievement', `🏆 LOGRO: ${ach.name}`, ach.id);

          // Desbloquear historia si tiene y no estaba antes
          if (ach.storyId) {
            const storyData = getStoryById(ach.storyId);
            if (storyData) {
              const newStory = {
                journeyId: 0,
                storyId: ach.storyId,
                unlockedAt: new Date().toISOString()
              };
              const alreadyUnlocked = get().unlockedStories.some(s => s.storyId === ach.storyId);

              if (!alreadyUnlocked) {
                set(state3 => ({
                  unlockedStories: [...state3.unlockedStories, newStory],
                }));
                if (uid) saveStory(uid, 0, ach.storyId).catch(() => { });
                get()._pushNotification('story', `📜 Historia desbloqueada`, ach.storyId);
              }
            }
          }

          // Otorgar recompensa de item
          if (ach.reward) {
            const rewardId = ach.reward.startsWith('random_')
              ? get()._selectRandomReward(ach.reward)
              : ach.reward;
            if (rewardId) get().grantItem(rewardId);
          }
        });
      }
    },

    _pushNotification(type, msg, refId = null) {
      const id = Date.now() + Math.random();
      const notificationObj = { id, type, msg, refId, timestamp: Date.now() };

      set(state => {
        const nextState = {
          notifications: [...state.notifications, notificationObj],
        };

        // Save to persistent notifications if it's an important type
        const importantTypes = ['achievement', 'story', 'item', 'level', 'journey'];
        if (importantTypes.includes(type)) {
          // Si es un item sin refId, suele ser un error o mensaje de uso, no lo guardamos en el historial
          if (!(type === 'item' && !refId)) {
            nextState.savedNotifications = [notificationObj, ...(state.savedNotifications || [])];
          }
        }

        return nextState;
      });

      setTimeout(() => {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id),
        }));
      }, 10000);
    },

    removeSavedNotification(id) {
      set(state => ({
        savedNotifications: (state.savedNotifications || []).filter(n => n.id !== id)
      }));
    },

    clearSavedNotifications() {
      set({ savedNotifications: [] });
    },

    dismissNotification(id) {
      set(state => ({
        notifications: state.notifications.filter(n => n.id !== id),
      }));
    },

    // ── DAILIES ───────────────────────────────────────────────────
    async _checkAndGenerateDaily() {
      const state = get();

      if (state._dailyCheckPromise) {
        await state._dailyCheckPromise;
        return;
      }

      const dailyCheckPromise = (async () => {
        const today = getTodayKey();
        const userId = get()._userId;

        if (!userId) {
          console.warn('[store] No userId available for daily check');
          return;
        }

        try {
          // Verificar en la base de datos si existe una misión para hoy
          const dailyData = await checkDailyForToday(userId, today);

          if (dailyData) {
            // Existe una misión seleccionada para hoy, cargarla
            const { currentDaily } = dailyData;

            set({
              currentDaily,
              dailySelectionMade: true,
              dailyOptions: null,
              lastDailyDate: today,
            });

            // Actualizar progreso de la misión actual
            get()._updateDailyProgress();
          } else {
            // No existe misión para hoy, generar opciones ponderadas para el modal
            const { getDailyByDifficulty } = await import('../data/dailies.js');

            const pickWeighted = (diffA, diffB, weightA) => {
              const targetDiff = Math.random() < weightA ? diffA : diffB;
              let daily = getDailyByDifficulty(targetDiff, []);
              // Fallback si no hay de esa dificultad (poco probable con el catálogo actual)
              if (!daily) daily = getDailyByDifficulty(diffA === targetDiff ? diffB : diffA, []);
              return daily;
            };

            const options = [];
            const usedIds = [];

            // Opción 1: 80% easy, 20% medium
            const opt1 = pickWeighted('easy', 'medium', 0.8);
            if (opt1) { options.push(opt1); usedIds.push(opt1.id); }

            // Opción 2: 60% medium, 40% hard
            let opt2 = pickWeighted('medium', 'hard', 0.6);
            if (opt2 && usedIds.includes(opt2.id)) opt2 = getDailyByDifficulty('hard', usedIds) || getDailyByDifficulty('medium', usedIds);
            if (opt2) { options.push(opt2); usedIds.push(opt2.id); }

            // Opción 3: 60% hard, 40% epic
            let opt3 = pickWeighted('hard', 'epic', 0.6);
            if (opt3 && usedIds.includes(opt3.id)) opt3 = getDailyByDifficulty('epic', usedIds) || getDailyByDifficulty('hard', usedIds);
            if (opt3) { options.push(opt3); usedIds.push(opt3.id); }

            // Mapear a formato de progreso
            const finalOptions = options.map(daily => ({
              ...daily,
              progress: { current: 0, target: 1, completed: false },
              completed: false,
            }));

            set({
              dailyOptions: finalOptions,
              currentDaily: null,
              dailySelectionMade: false,
              lastDailyDate: today,
            });

            // Crear fila inicial solo si no existe (sin sobrescribir selección existente).
            const { error: insertError } = await supabase.from('user_daily_progress').upsert({
              user_id: userId,
              date: today,
              daily_id: null,
              daily_data: { options: finalOptions },
              daily_selection_made: false,
              completed: false,
              progress_current: 0,
              progress_target: 1,
            }, { onConflict: 'user_id,date', ignoreDuplicates: true });

            if (insertError) {
              console.error('[store] Error inserting daily options:', insertError.message);
            }
          }
        } catch (error) {
          console.error('[store] Error checking daily for today:', error);
          // En caso de error, continuar con el comportamiento anterior
          // para no bloquear la app
        }
      })();

      set({ _dailyCheckPromise: dailyCheckPromise });

      try {
        await dailyCheckPromise;
      } finally {
        set({ _dailyCheckPromise: null });
      }
    },

    selectDaily(dailyId) {
      const state = get();
      const selectedOption = state.dailyOptions?.find(o => o.id === dailyId);
      if (!selectedOption) {
        return;
      }

      const today = getTodayKey();

      set({
        currentDaily: selectedOption,
        dailySelectionMade: true,
        dailyOptions: null, // Clear options after selection
      });

      // Persistir selección en BD
      const uid = get()._userId;
      if (uid) {
        // eslint-disable-next-line no-unused-vars
        const { condition, check, ...serializableDaily } = selectedOption;

        supabase.from('user_daily_progress').upsert({
          user_id: uid,
          date: today,
          daily_id: dailyId,
          daily_data: serializableDaily, // Only save the selected daily, not the options
          daily_selection_made: true,
          completed: false,
          progress_current: 0,
          progress_target: 1,
        }, { onConflict: 'user_id,date' });

        incrementDailyChosen(dailyId).catch(() => { });
      }

      // Iniciar seguimiento de progreso
      get()._updateDailyProgress();
    },

    _updateDailyProgress() {
      const state = get();
      if (!state.currentDaily) return;

      const progress = checkDailyProgress(state.currentDaily, state);
      const wasCompleted = state.currentDaily.completed;

      set(state2 => ({
        currentDaily: {
          ...state2.currentDaily,
          progress,
          completed: progress.completed,
        }
      }));

      // Persistir progreso del daily en BD
      const uid = get()._userId;
      if (uid) saveDaily(uid, get().currentDaily, get().lastDailyDate).catch(() => { });

      // If just completed, give rewards
      if (progress.completed && !wasCompleted) {
        get()._completeDailyChallenge();
      }
    },

    _completeDailyChallenge() {
      const state = get();
      if (!state.currentDaily || !state.currentDaily.rewards) return;

      const { points, items } = state.currentDaily.rewards;

      // Award points
      let journeyRewards = [];
      if (points) {
        const progress = resolveJourneyProgress({
          level: state.level,
          points: state.points,
          earnedPoints: points,
          unlockedStories: state.unlockedStories,
          pickJourneyItemChoices: get()._pickJourneyRewards,
        });
        journeyRewards = progress.rewards;
        const newLifetime = state.lifetimePoints + points;

        set(state2 => ({
          points: progress.finalPoints,
          lifetimePoints: newLifetime,
          level: progress.finalLevel,
          journeyRewardQueue: [...state2.journeyRewardQueue, ...journeyRewards],
        }));

        const uid = get()._userId;
        if (uid) {
          saveProfile(uid, {
            level: progress.finalLevel,
            points: progress.finalPoints,
            lifetimePoints: newLifetime,
            globalStreak: get().globalStreak,
            lastWeeklyProcessDate: get().lastWeeklyProcessDate
          }).catch(() => { });
          journeyRewards.forEach(reward => {
            if (reward.story) saveStory(uid, reward.journeyNumber, reward.story.id).catch(() => { });
          });
        }
      }

      const itemChoices = get()._pickDailyItemChoices(state.currentDaily);

      if (itemChoices.length === 0) {
        if (items && items.length > 0) {
          items.forEach(itemId => get().grantItem(itemId));
        }
        get()._pushNotification('daily', `🏆 Daily completado! +${points} pts`);
      } else {
        set({
          pendingDailyReward: {
            dailyId: state.currentDaily.id,
            dailyName: state.currentDaily.name,
            points: points ?? 0,
            itemChoices,
          },
        });
      }
    },

    claimDailyItem(chosenItemId) {
      const reward = get().pendingDailyReward;
      if (!reward) return;

      if (chosenItemId) {
        get().grantItem(chosenItemId);
        incrementItemChosen(chosenItemId).catch(() => { });
      }

      const itemName = chosenItemId ? ITEMS[chosenItemId]?.name : 'un objeto';
      get()._pushNotification('daily', `🏆 Daily completado! +${reward.points} pts, ${itemName}`);

      set({ pendingDailyReward: null });
    },

    // ── PLANES ─────────────────────────────────────────────────────────
    /**
     * Crea un nuevo plan para una fecha específica.
     */
    createPlan(planData) {
      const state = get();
      const userId = state._userId;
      if (!userId) return;

      const newPlan = {
        date: planData.date,
        name: planData.name || 'Mi Plan',
        tasks: planData.tasks.map(t => ({
          id: createUuid(),
          name: t.name,
          durationMinutes: t.durationMinutes,
          completed: false,
          completedAt: null,
          deleted: false,
        })),
        tripleApplied: false,
      };

      savePlan(userId, newPlan)
        .then(saved => {
          if (saved) {
            set(state2 => ({
              plans: {
                ...state2.plans,
                [saved.date]: { id: saved.id, ...newPlan },
              },
            }));
          }
        })
        .catch(() => { });
    },

    /**
     * Actualiza un plan existente.
     */
    updatePlan(date, updates) {
      const state = get();
      const userId = state._userId;
      const existingPlan = state.plans[date];
      if (!userId || !existingPlan) return;

      const updatedPlan = {
        ...existingPlan,
        ...updates,
        tasks: updates.tasks || existingPlan.tasks,
      };

      set(state2 => ({
        plans: {
          ...state2.plans,
          [date]: updatedPlan,
        },
      }));

      savePlan(userId, updatedPlan, existingPlan.id).catch(() => { });
    },

    /**
     * Elimina un plan.
     */
    removePlan(date) {
      const state = get();
      const userId = state._userId;
      const existingPlan = state.plans[date];
      if (!userId || !existingPlan) return;

      set(state2 => {
        const newPlans = { ...state2.plans };
        delete newPlans[date];
        return { plans: newPlans };
      });

      dbDeletePlan(existingPlan.id).catch(() => { });
    },

    /**
     * Completa una tarea del plan y otorga puntos.
     */
    completePlanTask(date, taskId, actualMinutes) {
      const state = get();
      const userId = state._userId;
      const plan = state.plans[date];
      if (!userId || !plan) return;

      const task = plan.tasks.find(t => t.id === taskId);
      if (!task || task.completed) return;

      const activeEffects = state._getActiveEffects();

      const duration = actualMinutes || task.durationMinutes;
      let basePoints = duration;

      let bonusMult = 1;
      if (activeEffects.some(e => e.key === 'double_points')) bonusMult *= 2;
      if (activeEffects.some(e => e.key === 'triple_points')) bonusMult *= 3;
      const nextTripleEffect = activeEffects.find(e => e.key === 'next_triple');
      if (nextTripleEffect) bonusMult *= 3;

      const earned = Math.round(basePoints * bonusMult);
      const newPoints = state.points + earned;
      const newLifetime = state.lifetimePoints + earned;

      const updatedTasks = plan.tasks.map(t =>
        t.id === taskId
          ? { ...t, completed: true, completedAt: new Date().toISOString(), durationMinutes: duration }
          : t
      );

      const activeTasks = updatedTasks.filter(t => !t.deleted);
      const allCompleted = activeTasks.every(t => t.completed);

      const progress = resolveJourneyProgress({
        level: state.level,
        points: state.points,
        earnedPoints: earned,
        unlockedStories: state.unlockedStories,
        pickJourneyItemChoices: get()._pickJourneyRewards,
      });
      let finalPoints = progress.finalPoints;
      let finalLevel = progress.finalLevel;
      let finalLifetime = newLifetime;
      let tripleApplied = plan.tripleApplied;
      let journeyRewards = [...progress.rewards];

      if (allCompleted && !plan.tripleApplied) {
        const planPoints = updatedTasks.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
        const tripleBonus = planPoints * 2;
        const bonusProgress = resolveJourneyProgress({
          level: finalLevel,
          points: finalPoints,
          earnedPoints: tripleBonus,
          unlockedStories: state.unlockedStories,
          pickJourneyItemChoices: get()._pickJourneyRewards,
        });
        finalPoints = bonusProgress.finalPoints;
        finalLevel = bonusProgress.finalLevel;
        finalLifetime += tripleBonus;
        tripleApplied = true;
        journeyRewards = [...journeyRewards, ...bonusProgress.rewards];

        if (plan.id) {
          applyTripleBonus(plan.id).catch(() => { });
        }

        get()._pushNotification('complete', `¡PLAN COMPLETO! ×3 → +${tripleBonus} pts`);
      }

      const updatedPlan = {
        ...plan,
        tasks: updatedTasks,
        tripleApplied,
      };

      set(state2 => ({
        plans: {
          ...state2.plans,
          [date]: updatedPlan,
        },
        points: finalPoints,
        lifetimePoints: finalLifetime,
        level: finalLevel,
        journeyRewardQueue: [...state2.journeyRewardQueue, ...journeyRewards],
      }));

      updatePlanTask(taskId, { completed: true, completedAt: new Date().toISOString() }).catch(() => { });

      const uid = get()._userId;
      if (uid) {
        saveProfile(uid, {
          level: finalLevel,
          points: finalPoints,
          lifetimePoints: finalLifetime,
          globalStreak: get().globalStreak,
          lastWeeklyProcessDate: get().lastWeeklyProcessDate
        }).catch(() => { });
        journeyRewards.forEach(reward => {
          if (reward.story) saveStory(uid, reward.journeyNumber, reward.story.id).catch(() => { });
        });
      }

      if (!plan.tripleApplied) {
        get()._pushNotification('complete', `+${earned} pts`);
      }

      get()._checkAchievements();
    },

    /**
     * Elimina una tarea del plan (marca como eliminada).
     */
    deletePlanTask(date, taskId) {
      const state = get();
      const userId = state._userId;
      const plan = state.plans[date];
      if (!userId || !plan) return;

      const updatedTasks = plan.tasks.map(t =>
        t.id === taskId ? { ...t, deleted: true } : t
      );

      const updatedPlan = {
        ...plan,
        tasks: updatedTasks,
      };

      set(state2 => ({
        plans: {
          ...state2.plans,
          [date]: updatedPlan,
        },
      }));

      updatePlanTask(taskId, { deleted: true }).catch(() => { });
    },
  })
);

export default useGameStore;
