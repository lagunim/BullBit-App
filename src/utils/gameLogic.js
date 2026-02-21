// Level thresholds (points needed to level up AT each level)
// Level 0 → 1: 627 pts,  1 → 2: 2268 pts,  2 → 3: 4872 pts
// Pattern continues with increasing requirements
export const LEVEL_THRESHOLDS = [627, 2268, 4872, 9072, 15552, 25194, 39366, 59049];

export function getLevelInfo(level, points) {
  const threshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] * (level - LEVEL_THRESHOLDS.length + 2);
  const pct = Math.min(100, Math.round((points / threshold) * 100));
  return { threshold, pct, remaining: threshold - points };
}

export function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

export function getYesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export function getDateKey(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

export function isHabitDueOnDate(habit, dateStr) {
  const date = new Date(dateStr + 'T12:00:00');
  if (habit.periodicity === 'daily') return true;
  if (habit.periodicity === 'weekly') return date.getDay() === 1; // Monday
  if (habit.periodicity === 'monthly') return date.getDate() === 1;
  return true;
}

/** Calculate points earned for completing a habit */
export function calcPoints(habit, activeEffects = []) {
  const basePoints = habit.minutes * habit.multiplier;

  let multiplier = 1;
  if (activeEffects.some(e => e.key === 'double_points')) multiplier *= 2;
  if (activeEffects.some(e => e.key === 'next_triple')) multiplier *= 3;

  return Math.round(basePoints * multiplier);
}

/** Calculate new multiplier after completing a habit */
export function calcMultiplierOnComplete(habit, activeEffects = []) {
  const boostEffect = activeEffects.find(e => e.key === 'global_mult_boost');
  const boost = boostEffect ? boostEffect.value : 0;
  return parseFloat((habit.multiplier + 0.2 + boost).toFixed(1));
}

/** Calculate new multiplier after failing a habit */
export function calcMultiplierOnFail(habit, activeEffects = []) {
  // Check for shield (passive protection)
  if (activeEffects.some(e => e.key === 'streak_shield')) return habit.multiplier;
  if (activeEffects.some(e => e.key === 'golden_shield')) return parseFloat((habit.multiplier + 0.2).toFixed(1));

  const penaltyEffect = activeEffects.find(e => e.key === 'reduced_penalty');
  const penalty = penaltyEffect ? penaltyEffect.value : 0.4;

  // Multiplier cannot go below 1.0
  return Math.max(1.0, parseFloat((habit.multiplier - penalty).toFixed(1)));
}

/** Compute the last N days of history for a habit */
export function getHabitRecentHistory(habitId, history, days = 14) {
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = getDateKey(i);
    const dayData = history[key] ?? {};
    result.push({ date: key, status: dayData[habitId] ?? 'none' });
  }
  return result;
}

/** Compute global streak (all habits completed every day they were due) */
export function calcGlobalStreak(habits, history) {
  if (habits.length === 0) return 0;
  let streak = 0;
  for (let i = 1; i <= 365; i++) {
    const key = getDateKey(i);
    const day = history[key];
    if (!day) break;

    const dueHabits = habits.filter(h => isHabitDueOnDate(h, key));
    if (dueHabits.length === 0) continue;

    const allCompleted = dueHabits.every(h => day[h.id] === 'completed');
    if (allCompleted) streak++;
    else break;
  }
  return streak;
}

export const PERIODICITY_LABELS = {
  daily:   'Diaria',
  weekly:  'Semanal',
  monthly: 'Mensual',
  custom:  'Personalizado',
};

export const HABIT_EMOJIS = ['📚', '🏃', '💧', '🧘', '🎸', '✍️', '🥗', '😴', '🧹', '💪', '🎯', '🧠', '🎨', '🌿', '🏋️'];
