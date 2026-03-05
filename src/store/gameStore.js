import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { ITEMS } from '../data/items.js';
import { getRandomDaily, checkDailyProgress } from '../data/dailies.js';
import {
  LEVEL_THRESHOLDS,
  getTodayKey,
  getYesterdayKey,
  calcPoints,
  calcMultiplierOnComplete,
  calcMultiplierOnFail,
  calcGlobalStreak,
  isHabitDueOnDate,
  getWeekStart,
  getWeekCompletions,
} from '../utils/gameLogic.js';
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
} from '../lib/db.js';

const useGameStore = create(
  persist(
    (set, get) => ({
      // Core
      _userId: null,        // Supabase user ID (set on init)
      habits: [],
      level: 0,
      points: 0,
      lifetimePoints: 0,
      history: {},          // { 'YYYY-MM-DD': { [habitId]: 'completed' | 'failed' | 'partial' | 'over' | 'skipped' } }
      globalStreak: 0,
      lastWeeklyProcessDate: null, // Track when weekly habits were last processed

      // Dailies
      currentDaily: null,   // { id, name, description, icon, difficulty, condition, rewards, progress, completed }
      lastDailyDate: null,  // 'YYYY-MM-DD'

      // Gamification
      unlockedAchievements: [],
      inventory: [],        // [{ itemId, qty }]
      activeEffects: [],    // [{ key, value, expiresAt (ISO date) }]

      // UI notifications queue
      notifications: [],

      // ── HABITS ────────────────────────────────────────────────────
      addHabit(habit) {
        const newHabit = {
          id: Date.now().toString(),
          name: habit.name,
          minutes: habit.minutes,
          periodicity: habit.periodicity,
          emoji: habit.emoji ?? '🎯',
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
        if (userId) saveHabit(userId, newHabit).catch(() => {});

        get()._checkAchievements();
        get()._checkAndGenerateDaily();
      },

      removeHabit(id) {
        set(state => ({ habits: state.habits.filter(h => h.id !== id) }));

        // Persistir en BD
        if (get()._userId) dbDeleteHabit(id).catch(() => {});
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
          if (updated) saveHabit(userId, updated).catch(() => {});
        }
      },

      // ── INITIALIZATION ────────────────────────────────────────────
      async init(userId) {
        // Guardar el userId en el store para que las acciones puedan acceder a él
        set({ _userId: userId });

        try {
          const remoteData = await loadUserData(userId);

          if (remoteData) {
            // ── Hay datos en Supabase → usarlos como fuente de verdad ──
            set({
              habits: remoteData.habits,
              level: remoteData.level,
              points: remoteData.points,
              lifetimePoints: remoteData.lifetimePoints,
              history: remoteData.history,
              globalStreak: remoteData.globalStreak,
              unlockedAchievements: remoteData.unlockedAchievements,
              inventory: remoteData.inventory,
              activeEffects: remoteData.activeEffects,
              currentDaily: remoteData.currentDaily,
              lastDailyDate: remoteData.lastDailyDate,
              lastWeeklyProcessDate: remoteData.lastWeeklyProcessDate,
            });
          } else {
            // ── BD vacía → usuario nuevo: resetear estado local y crear perfil ──
            set({
              habits: [],
              level: 0,
              points: 0,
              lifetimePoints: 0,
              history: {},
              globalStreak: 0,
              unlockedAchievements: [],
              inventory: [],
              activeEffects: [],
              currentDaily: null,
              lastDailyDate: null,
              lastWeeklyProcessDate: null,
            });
            saveProfile(userId, {
              level: 0,
              points: 0,
              lifetimePoints: 0,
              globalStreak: 0,
              lastWeeklyProcessDate: null,
            }).catch(() => {});
          }
        } catch (err) {
          // Si Supabase falla, seguir con el estado local sin interrumpir
          console.error('[store] Error cargando datos de BD, usando estado local:', err);
        }

        // Procesos de inicio (siempre, independientemente del origen de datos)
        get()._processExpiredHabits();
        get()._processWeeklyHabits();
        get()._checkAndGenerateDaily();
        get()._purgeExpiredEffects();
      },

      // ── COMPLETING / FAILING ──────────────────────────────────────
      completeHabit(habitId) {
        const state = get();
        const today = getTodayKey();
        const habit = state.habits.find(h => h.id === habitId);
        if (!habit) return;
        if (state.history[today]?.[habitId] === 'completed') return; // already done

        const activeEffects = state._getActiveEffects();
        const earned = calcPoints(habit, activeEffects);
        const newMult = calcMultiplierOnComplete(habit, activeEffects);
        const newPoints = state.points + earned;
        const newLifetime = state.lifetimePoints + earned;

        // Consume "next_triple" if present
        const nextEffects = state.activeEffects.filter(e => e.key !== 'next_triple');

        // Update history
        const newHistory = {
          ...state.history,
          [today]: { ...(state.history[today] ?? {}), [habitId]: 'completed' },
        };

        // Level up check
        const threshold = LEVEL_THRESHOLDS[state.level] ?? 999999;
        let finalLevel = state.level;
        let finalPoints = newPoints;
        let levelUpMsg = null;

        if (newPoints >= threshold) {
          finalLevel = state.level + 1;
          finalPoints = newPoints - threshold;
          levelUpMsg = `¡NIVEL ${finalLevel} ALCANZADO!`;
        }

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
          notifications: levelUpMsg
            ? [...state2.notifications, { id: Date.now(), type: 'level', msg: levelUpMsg }]
            : state2.notifications,
        }));

        // Persistir en BD (fire & forget)
        const userId = get()._userId;
        if (userId) {
          const updatedHabit = get().habits.find(h => h.id === habitId);
          if (updatedHabit) saveHabit(userId, updatedHabit).catch(() => {});
          saveHabitEntry(userId, habitId, today, 'completed').catch(() => {});
          saveProfile(userId, { level: finalLevel, points: finalPoints, lifetimePoints: newLifetime, globalStreak: get().globalStreak, lastWeeklyProcessDate: get().lastWeeklyProcessDate }).catch(() => {});
          if (nextEffects.length !== state.activeEffects.length) saveActiveEffects(userId, nextEffects).catch(() => {});
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
        if (state.history[today]?.[habitId]) return; // already resolved today

        const activeEffects = state._getActiveEffects();

        // Points calculation reusing the same bonus effects as calcPoints,
        // but with the real minutes done.
        const basePoints = minutesDone * habit.multiplier;
        let bonusMult = 1;
        if (activeEffects.some(e => e.key === 'double_points')) bonusMult *= 2;
        if (activeEffects.some(e => e.key === 'next_triple')) bonusMult *= 3;
        const earned = Math.round(basePoints * bonusMult);

        const newMult = calcMultiplierOnComplete(habit, activeEffects);
        const newPoints = state.points + earned;
        const newLifetime = state.lifetimePoints + earned;

        // Consume "next_triple" if present
        const nextEffects = state.activeEffects.filter(e => e.key !== 'next_triple');

        // Update history
        const newHistory = {
          ...state.history,
          [today]: { ...(state.history[today] ?? {}), [habitId]: 'partial' },
        };

        // Level up check
        const threshold = LEVEL_THRESHOLDS[state.level] ?? 999999;
        let finalLevel = state.level;
        let finalPoints = newPoints;
        let levelUpMsg = null;

        if (newPoints >= threshold) {
          finalLevel = state.level + 1;
          finalPoints = newPoints - threshold;
          levelUpMsg = `¡NIVEL ${finalLevel} ALCANZADO!`;
        }

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
          notifications: levelUpMsg
            ? [...state2.notifications, { id: Date.now(), type: 'level', msg: levelUpMsg }]
            : state2.notifications,
        }));

        // Persistir en BD (fire & forget)
        const userId2 = get()._userId;
        if (userId2) {
          const updatedHabit = get().habits.find(h => h.id === habitId);
          if (updatedHabit) saveHabit(userId2, updatedHabit).catch(() => {});
          saveHabitEntry(userId2, habitId, today, 'partial').catch(() => {});
          saveProfile(userId2, { level: finalLevel, points: finalPoints, lifetimePoints: newLifetime, globalStreak: get().globalStreak, lastWeeklyProcessDate: get().lastWeeklyProcessDate }).catch(() => {});
          if (nextEffects.length !== state.activeEffects.length) saveActiveEffects(userId2, nextEffects).catch(() => {});
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
        if (state.history[today]?.[habitId]) return; // already resolved today

        const activeEffects = state._getActiveEffects();

        // Points based on real minutes done, preserving bonus effects.
        const basePoints = minutesDone * habit.multiplier;
        let bonusMult = 1;
        if (activeEffects.some(e => e.key === 'double_points')) bonusMult *= 2;
        if (activeEffects.some(e => e.key === 'next_triple')) bonusMult *= 3;
        const earned = Math.round(basePoints * bonusMult);

        const newMult = calcMultiplierOnComplete(habit, activeEffects);
        const newPoints = state.points + earned;
        const newLifetime = state.lifetimePoints + earned;

        // Consume "next_triple" if present
        const nextEffects = state.activeEffects.filter(e => e.key !== 'next_triple');

        // Update history
        const newHistory = {
          ...state.history,
          [today]: { ...(state.history[today] ?? {}), [habitId]: 'over' },
        };

        // Level up check
        const threshold = LEVEL_THRESHOLDS[state.level] ?? 999999;
        let finalLevel = state.level;
        let finalPoints = newPoints;
        let levelUpMsg = null;

        if (newPoints >= threshold) {
          finalLevel = state.level + 1;
          finalPoints = newPoints - threshold;
          levelUpMsg = `¡NIVEL ${finalLevel} ALCANZADO!`;
        }

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
          notifications: levelUpMsg
            ? [...state2.notifications, { id: Date.now(), type: 'level', msg: levelUpMsg }]
            : state2.notifications,
        }));

        // Persistir en BD (fire & forget)
        const userId3 = get()._userId;
        if (userId3) {
          const updatedHabit = get().habits.find(h => h.id === habitId);
          if (updatedHabit) saveHabit(userId3, updatedHabit).catch(() => {});
          saveHabitEntry(userId3, habitId, today, 'over').catch(() => {});
          saveProfile(userId3, { level: finalLevel, points: finalPoints, lifetimePoints: newLifetime, globalStreak: get().globalStreak, lastWeeklyProcessDate: get().lastWeeklyProcessDate }).catch(() => {});
          if (nextEffects.length !== state.activeEffects.length) saveActiveEffects(userId3, nextEffects).catch(() => {});
        }

        get()._pushNotification('complete', `+${earned} pts — ×${newMult.toFixed(1)} (extra)`);
        get()._recalcGlobalStreak();
        get()._checkAchievements();
        get()._updateDailyProgress();
      },

      /**
       * Corrige el día anterior (ayer) abriendo las mismas opciones de completado
       * que hoy, pero ajustando el multiplicador como si ayer se hubiera marcado
       * como fallo (-0.4) y ahora:
       *  - "menos tiempo" → devuelve ese -0.4 (neto 0.0)
       *  - "más tiempo" o "completado" → devuelve -0.4 y añade +0.2 (neto +0.2)
       *
       * mode: 'partial' | 'over' | 'standard'
       */
      retroCompleteYesterday(habitId, mode, minutesDone) {
        const state = get();
        const yesterday = getYesterdayKey();
        const habit = state.habits.find(h => h.id === habitId);
        if (!habit) return;

        const dayHistory = state.history[yesterday] ?? {};
        const currentStatus = dayHistory[habitId];
        // Si ya está marcado como completado (de cualquier tipo), no hacer nada
        if (currentStatus === 'completed' || currentStatus === 'partial' || currentStatus === 'over') {
          return;
        }

        // Duración real usada para el cálculo de puntos
        const minutes =
          mode === 'standard'
            ? habit.minutes
            : Number(minutesDone);
        if (!Number.isFinite(minutes) || minutes <= 0) return;

        // Aproximamos el multiplicador "previo al fallo" como mult actual + 0.4
        const baseMultBeforeFail = Math.min(3.0, parseFloat((habit.multiplier + 0.4).toFixed(1)));

        let finalStatus = 'completed';
        let multDelta = 0.6; // +0.4 por deshacer el fallo, +0.2 por completar

        if (mode === 'partial') {
          finalStatus = 'partial';
          multDelta = 0.4; // solo devolvemos el -0.4 del fallo
        } else if (mode === 'over') {
          finalStatus = 'over';
          multDelta = 0.6;
        } else {
          finalStatus = 'completed';
          multDelta = 0.6;
        }

        // Puntos calculados como si el multiplicador hubiera sido el "correcto" (previo al fallo)
        const effectiveMultForPoints = baseMultBeforeFail;
        const earned = Math.round(minutes * effectiveMultForPoints);

        const newMult = Math.min(3.0, parseFloat((habit.multiplier + multDelta).toFixed(1)));

        set(state2 => ({
          points: state2.points + earned,
          lifetimePoints: state2.lifetimePoints + earned,
          history: {
            ...state2.history,
            [yesterday]: { ...(state2.history[yesterday] ?? {}), [habitId]: finalStatus },
          },
          habits: state2.habits.map(h =>
            h.id === habitId ? { ...h, multiplier: newMult, streak: h.streak + 1 } : h
          ),
        }));

        // Persistir en BD (fire & forget)
        const userId4 = get()._userId;
        if (userId4) {
          const updatedHabit = get().habits.find(h => h.id === habitId);
          if (updatedHabit) saveHabit(userId4, updatedHabit).catch(() => {});
          saveHabitEntry(userId4, habitId, yesterday, finalStatus).catch(() => {});
          saveProfile(userId4, { level: get().level, points: get().points, lifetimePoints: get().lifetimePoints, globalStreak: get().globalStreak, lastWeeklyProcessDate: get().lastWeeklyProcessDate }).catch(() => {});
        }

        get()._recalcGlobalStreak();
        get()._checkAchievements();
        get()._updateDailyProgress();
        get()._pushNotification('complete', `+${earned} pts — corrección de ayer`);
      },

      failHabit(habitId) {
        const state = get();
        const today = getTodayKey();
        const habit = state.habits.find(h => h.id === habitId);
        if (!habit) return;
        if (state.history[today]?.[habitId]) return;

        const activeEffects = state._getActiveEffects();
        const newMult = calcMultiplierOnFail(habit, activeEffects);

        // Consume shield if used
        let newActiveEffects = [...state.activeEffects];
        const shieldIdx = newActiveEffects.findIndex(e => e.key === 'streak_shield' || e.key === 'golden_shield');
        if (shieldIdx !== -1) newActiveEffects.splice(shieldIdx, 1);

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
          if (updatedHabit) saveHabit(userId5, updatedHabit).catch(() => {});
          saveHabitEntry(userId5, habitId, today, 'failed').catch(() => {});
          if (newActiveEffects.length !== state.activeEffects.length) saveActiveEffects(userId5, newActiveEffects).catch(() => {});
        }

        get()._pushNotification('fail', `Penalización: ×${newMult.toFixed(1)}`);
        get()._recalcGlobalStreak();
        get()._updateDailyProgress();
      },

      // ── ITEMS ──────────────────────────────────────────────────────
      useItem(itemId, targetHabitId = null) {
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
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + item.durationDays);
          set(state2 => ({
            inventory: newInventory,
            activeEffects: [...state2.activeEffects, {
              key: item.effectKey,
              value: item.effectValue,
              expiresAt: expiresAt.toISOString(),
              itemName: item.name,
            }],
          }));
          // Persistir en BD
          const uid = get()._userId;
          if (uid) {
            saveInventory(uid, get().inventory).catch(() => {});
            saveActiveEffects(uid, get().activeEffects).catch(() => {});
          }
          get()._pushNotification('item', `${item.icon} ${item.name} activado!`);
        }
        else if (item.effectType === 'passive') {
          set(state2 => ({
            inventory: newInventory,
            activeEffects: [...state2.activeEffects, {
              key: item.effectKey,
              value: item.effectValue,
              itemName: item.name,
            }],
          }));
          // Persistir en BD
          const uid = get()._userId;
          if (uid) {
            saveInventory(uid, get().inventory).catch(() => {});
            saveActiveEffects(uid, get().activeEffects).catch(() => {});
          }
          get()._pushNotification('item', `${item.icon} ${item.name} equipado!`);
        }
        else if (item.effectType === 'instant') {
          if (item.effectKey === 'mult_recovery' && targetHabitId) {
            set(state2 => ({
              inventory: newInventory,
              habits: state2.habits.map(h =>
                h.id === targetHabitId
                  ? { ...h, multiplier: Math.min(3.0, parseFloat((h.multiplier + item.effectValue).toFixed(1))) }
                  : h
              ),
            }));
            const uid = get()._userId;
            if (uid) {
              saveInventory(uid, get().inventory).catch(() => {});
              const updatedHabit = get().habits.find(h => h.id === targetHabitId);
              if (updatedHabit) saveHabit(uid, updatedHabit).catch(() => {});
            }
          } else if (item.effectKey === 'perm_base_mult' && targetHabitId) {
            set(state2 => ({
              inventory: newInventory,
              habits: state2.habits.map(h =>
                h.id === targetHabitId
                  ? { ...h, baseMultiplier: Math.min(3.0, parseFloat(((h.baseMultiplier ?? 1.0) + item.effectValue).toFixed(1))),
                          multiplier: Math.min(3.0, parseFloat((h.multiplier + item.effectValue).toFixed(1))) }
                  : h
              ),
            }));
            const uid = get()._userId;
            if (uid) {
              saveInventory(uid, get().inventory).catch(() => {});
              const updatedHabit = get().habits.find(h => h.id === targetHabitId);
              if (updatedHabit) saveHabit(uid, updatedHabit).catch(() => {});
            }
          } else if (item.effectKey === 'retroactive_complete' && targetHabitId) {
            const yesterday = getYesterdayKey();
            const habit = get().habits.find(h => h.id === targetHabitId);
            if (habit) {
              const earned = Math.round(habit.minutes * habit.multiplier);
              set(state2 => ({
                inventory: newInventory,
                points: state2.points + earned,
                lifetimePoints: state2.lifetimePoints + earned,
                history: {
                  ...state2.history,
                  [yesterday]: { ...(state2.history[yesterday] ?? {}), [targetHabitId]: 'completed' },
                },
                habits: state2.habits.map(h =>
                  h.id === targetHabitId ? { ...h, streak: h.streak + 1 } : h
                ),
              }));
              const uid = get()._userId;
              if (uid) {
                saveInventory(uid, get().inventory).catch(() => {});
                saveHabitEntry(uid, targetHabitId, yesterday, 'completed').catch(() => {});
                saveProfile(uid, { level: get().level, points: get().points, lifetimePoints: get().lifetimePoints, globalStreak: get().globalStreak, lastWeeklyProcessDate: get().lastWeeklyProcessDate }).catch(() => {});
                const updatedHabit = get().habits.find(h => h.id === targetHabitId);
                if (updatedHabit) saveHabit(uid, updatedHabit).catch(() => {});
              }
            } else {
              set({ inventory: newInventory });
              const uid = get()._userId;
              if (uid) saveInventory(uid, get().inventory).catch(() => {});
            }
          } else {
            set({ inventory: newInventory });
            const uid = get()._userId;
            if (uid) saveInventory(uid, get().inventory).catch(() => {});
          }
          get()._pushNotification('item', `${item.icon} ${item.name} usado!`);
        }
      },

      grantItem(itemId) {
        const item = ITEMS[itemId];
        if (!item) return;
        set(state => {
          const existing = state.inventory.find(i => i.itemId === itemId);
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
        if (uid) saveInventory(uid, get().inventory).catch(() => {});
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
        set(state => ({
          activeEffects: state.activeEffects.filter(e =>
            !e.expiresAt || new Date(e.expiresAt) > now
          ),
        }));
      },

      _processExpiredHabits() {
        const state = get();
        const today = getTodayKey();
        const yesterday = getYesterdayKey();
        
        // Buscar hábitos que estaban programados ayer pero no se completaron
        const expiredHabits = state.habits.filter(habit => {
          const wasDueYesterday = isHabitDueOnDate(habit, yesterday);
          const yesterdayStatus = state.history[yesterday]?.[habit.id];
          const wasNotResolved = !yesterdayStatus; // No completed, failed, partial, etc.
          
          return wasDueYesterday && wasNotResolved;
        });

        if (expiredHabits.length === 0) return;

        // Marcar como failed automáticamente y aplicar penalizaciones
        const newHistory = { ...state.history };
        if (!newHistory[yesterday]) newHistory[yesterday] = {};

        const updatedHabits = [...state.habits];
        const activeEffects = state._getActiveEffects();

        expiredHabits.forEach(habit => {
          // Marcar como failed en el historial
          newHistory[yesterday][habit.id] = 'failed';
          
          // Aplicar penalización de multiplicador
          const newMult = calcMultiplierOnFail(habit, activeEffects);
          
          // Actualizar hábito con multiplicador penalizado y streak a 0
          const habitIndex = updatedHabits.findIndex(h => h.id === habit.id);
          if (habitIndex !== -1) {
            updatedHabits[habitIndex] = {
              ...updatedHabits[habitIndex],
              multiplier: newMult,
              streak: 0
            };
          }
        });

        // Aplicar todos los cambios
        set({
          habits: updatedHabits,
          history: newHistory
        });

        // Persistir en BD (fire & forget)
        const uid = get()._userId;
        if (uid) {
          saveHabits(uid, updatedHabits).catch(() => {});
          const entries = expiredHabits.map(h => ({ habitId: h.id, date: yesterday, status: 'failed' }));
          saveHabitEntries(uid, entries).catch(() => {});
        }

        // Notificar al usuario
        const message = expiredHabits.length === 1 
          ? `Hábito "${expiredHabits[0].name}" marcado como fallido automáticamente`
          : `${expiredHabits.length} hábitos marcados como fallidos automáticamente`;
        
        get()._pushNotification('auto_fail', message);

        // Recalcular racha global después de los cambios
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
        
        // Obtener hábitos weekly_times
        const weeklyHabits = state.habits.filter(h => h.periodicity === 'weekly_times' && h.weeklyTimesTarget);
        if (weeklyHabits.length === 0) return;
        
        const yesterday = getYesterdayKey();
        const lastWeekStart = getWeekStart(yesterday);
        const activeEffects = state._getActiveEffects();
        
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
            if (activeEffects.some(e => e.key === 'streak_shield')) {
              // Shield protects - no penalty
            } else if (activeEffects.some(e => e.key === 'golden_shield')) {
              newMult = parseFloat((habit.multiplier + 0.2).toFixed(1));
            } else {
              const penaltyEffect = activeEffects.find(e => e.key === 'reduced_penalty');
              const actualPenalty = penaltyEffect ? penaltyEffect.value : totalPenalty;
              newMult = Math.max(1.0, parseFloat((habit.multiplier - actualPenalty).toFixed(1)));
            }
            
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
            lastWeeklyProcessDate: today
          });
          // Persistir en BD (fire & forget)
          const uid = get()._userId;
          if (uid) {
            saveHabits(uid, updatedHabits).catch(() => {});
            // Persistir todas las entradas 'failed' añadidas
            const entries = [];
            for (const [date, dayMap] of Object.entries(newHistory)) {
              for (const [habitId, status] of Object.entries(dayMap)) {
                if (status === 'failed') entries.push({ habitId, date, status });
              }
            }
            if (entries.length) saveHabitEntries(uid, entries).catch(() => {});
            saveProfile(uid, { level: get().level, points: get().points, lifetimePoints: get().lifetimePoints, globalStreak: get().globalStreak, lastWeeklyProcessDate: today }).catch(() => {});
          }
          get()._recalcGlobalStreak();
          get()._pushNotification('weekly_review', 'Resumen semanal de hábitos procesado');
        } else {
          set({ lastWeeklyProcessDate: today });
          const uid = get()._userId;
          if (uid) saveProfile(uid, { level: get().level, points: get().points, lifetimePoints: get().lifetimePoints, globalStreak: get().globalStreak, lastWeeklyProcessDate: today }).catch(() => {});
        }
      },

      _recalcGlobalStreak() {
        const { habits, history } = get();
        set({ globalStreak: calcGlobalStreak(habits, history) });
      },

      // === SELECCIÓN ALEATORIA DE RECOMPENSAS ===
      _getItemsByRarity(rarity) {
        return Object.values(ITEMS).filter(item => item.rarity === rarity).map(item => item.id);
      },

      _selectRandomReward(rarity) {
        const POOL_CONFIG = {
          random_common:    { primary: 'common',    secondary: 'uncommon',  primaryChance: 0.7 },
          random_uncommon: { primary: 'uncommon',   secondary: 'rare',      primaryChance: 0.7 },
          random_rare:      { primary: 'rare',       secondary: 'epic',      primaryChance: 0.7 },
          random_epic:      { primary: 'epic',       secondary: 'legendary', primaryChance: 0.7 },
          random_legendary: { primary: 'legendary', secondary: null,        primaryChance: 1.0 },
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
          } catch {}
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
          if (uid) saveAchievements(uid, newlyUnlocked.map(a => a.id)).catch(() => {});

          newlyUnlocked.forEach(ach => {
            get()._pushNotification('achievement', `🏆 LOGRO: ${ach.name}`);
            if (ach.reward) {
              const rewardId = ach.reward.startsWith('random_') 
                ? get()._selectRandomReward(ach.reward)
                : ach.reward;
              if (rewardId) get().grantItem(rewardId);
            }
          });
        }
      },

      _pushNotification(type, msg) {
        const id = Date.now() + Math.random();
        set(state => ({
          notifications: [...state.notifications, { id, type, msg }],
        }));
        setTimeout(() => {
          set(state => ({
            notifications: state.notifications.filter(n => n.id !== id),
          }));
        }, 6000);
      },

      dismissNotification(id) {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id),
        }));
      },

      // ── DAILIES ───────────────────────────────────────────────────
      _checkAndGenerateDaily() {
        const state = get();
        const today = getTodayKey();
        
        // Generate new daily if it's a new day or no daily exists
        if (!state.currentDaily || state.lastDailyDate !== today) {
          const excludeIds = state.lastDailyDate === today ? [state.currentDaily?.id] : [];
          const newDaily = getRandomDaily(excludeIds);
          
          set({
            currentDaily: {
              ...newDaily,
              progress: { current: 0, target: 1, completed: false },
              completed: false,
            },
            lastDailyDate: today,
          });

          // Persistir nuevo daily en BD
          const uid = get()._userId;
          if (uid) saveDaily(uid, get().currentDaily, today).catch(() => {});
        }
        
        // Update progress of current daily
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
        if (uid) saveDaily(uid, get().currentDaily, get().lastDailyDate).catch(() => {});
        
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
        if (points) {
          set(state2 => ({
            points: state2.points + points,
            lifetimePoints: state2.lifetimePoints + points,
          }));
          // Persistir perfil con puntos del daily
          const uid = get()._userId;
          if (uid) saveProfile(uid, { level: get().level, points: get().points, lifetimePoints: get().lifetimePoints, globalStreak: get().globalStreak, lastWeeklyProcessDate: get().lastWeeklyProcessDate }).catch(() => {});
        }
        
        // Award items
        if (items && items.length > 0) {
          items.forEach(itemId => {
            get().grantItem(itemId);
          });
        }
        
        // Notify user
        const itemNames = items ? items.map(id => ITEMS[id]?.name || id).join(', ') : '';
        const message = itemNames 
          ? `🏆 Daily completado! +${points} pts, ${itemNames}`
          : `🏆 Daily completado! +${points} pts`;
        
        get()._pushNotification('daily', message);
      },
    }),
    {
      name: 'habit-quest-v1',
      partialize: (state) => ({
        habits: state.habits,
        level: state.level,
        points: state.points,
        lifetimePoints: state.lifetimePoints,
        history: state.history,
        globalStreak: state.globalStreak,
        unlockedAchievements: state.unlockedAchievements,
        inventory: state.inventory,
        activeEffects: state.activeEffects,
        currentDaily: state.currentDaily,
        lastDailyDate: state.lastDailyDate,
        lastWeeklyProcessDate: state.lastWeeklyProcessDate,
      }),
    }
  )
);

export default useGameStore;
