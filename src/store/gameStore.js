import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { ITEMS } from '../data/items.js';
import {
  LEVEL_THRESHOLDS,
  getTodayKey,
  getYesterdayKey,
  calcPoints,
  calcMultiplierOnComplete,
  calcMultiplierOnFail,
  calcGlobalStreak,
} from '../utils/gameLogic.js';

const useGameStore = create(
  persist(
    (set, get) => ({
      // Core
      habits: [],
      level: 0,
      points: 0,
      lifetimePoints: 0,
      history: {},          // { 'YYYY-MM-DD': { [habitId]: 'completed' | 'failed' | 'skipped' } }
      globalStreak: 0,

      // Gamification
      unlockedAchievements: [],
      inventory: [],        // [{ itemId, qty }]
      activeEffects: [],    // [{ key, value, expiresAt (ISO date) }]

      // UI notifications queue
      notifications: [],

      // ── HABITS ────────────────────────────────────────────────────
      addHabit(habit) {
        set(state => ({
          habits: [...state.habits, {
            id: Date.now().toString(),
            name: habit.name,
            minutes: habit.minutes,
            periodicity: habit.periodicity,
            emoji: habit.emoji ?? '🎯',
            multiplier: 1.0,
            baseMultiplier: 1.0,
            streak: 0,
            createdAt: new Date().toISOString(),
          }]
        }));
        get()._checkAchievements();
      },

      removeHabit(id) {
        set(state => ({ habits: state.habits.filter(h => h.id !== id) }));
      },

      updateHabit(id, updates) {
        set(state => ({
          habits: state.habits.map(h =>
            h.id === id ? { ...h, ...updates } : h
          )
        }));
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

        get()._pushNotification('complete', `+${earned} pts — ×${newMult.toFixed(1)}`);
        get()._recalcGlobalStreak();
        get()._checkAchievements();
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

        get()._pushNotification('fail', `Penalización: ×${newMult.toFixed(1)}`);
        get()._recalcGlobalStreak();
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
          get()._pushNotification('item', `${item.icon} ${item.name} equipado!`);
        }
        else if (item.effectType === 'instant') {
          if (item.effectKey === 'mult_recovery' && targetHabitId) {
            set(state2 => ({
              inventory: newInventory,
              habits: state2.habits.map(h =>
                h.id === targetHabitId
                  ? { ...h, multiplier: parseFloat((h.multiplier + item.effectValue).toFixed(1)) }
                  : h
              ),
            }));
          } else if (item.effectKey === 'perm_base_mult' && targetHabitId) {
            set(state2 => ({
              inventory: newInventory,
              habits: state2.habits.map(h =>
                h.id === targetHabitId
                  ? { ...h, baseMultiplier: parseFloat(((h.baseMultiplier ?? 1.0) + item.effectValue).toFixed(1)),
                          multiplier: parseFloat((h.multiplier + item.effectValue).toFixed(1)) }
                  : h
              ),
            }));
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
            } else {
              set({ inventory: newInventory });
            }
          } else {
            set({ inventory: newInventory });
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

      _recalcGlobalStreak() {
        const { habits, history } = get();
        set({ globalStreak: calcGlobalStreak(habits, history) });
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
          newlyUnlocked.forEach(ach => {
            get()._pushNotification('achievement', `🏆 LOGRO: ${ach.name}`);
            if (ach.reward) get().grantItem(ach.reward);
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
        }, 3500);
      },

      dismissNotification(id) {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id),
        }));
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
      }),
    }
  )
);

export default useGameStore;
