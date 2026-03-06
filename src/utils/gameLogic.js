// Level thresholds (points needed to level up AT each level)
// Level 0 → 1: 627 pts,  1 → 2: 2268 pts,  2 → 3: 4872 pts
// Pattern continues with increasing requirements
export const LEVEL_THRESHOLDS = [627, 2268, 4872, 9072, 15552, 25194, 39366, 59049];

function interpolateColor(color1, color2, factor) {
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);
  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function getProgressColor(pct) {
  if (pct >= 100) return '#3b82f6';
  if (pct <= 0) return '#ef4444';
  const factor = pct / 100;
  return interpolateColor('#ef4444', '#22c55e', factor);
}

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
  if (habit.weeklyTimesTarget) return true;
  const date = new Date(dateStr + 'T12:00:00');
  
  switch (habit.periodicity) {
    case 'daily':
      return true;
      
    case 'weekly':
      return date.getDay() === 1; // Monday
      
    case 'monthly':
      return date.getDate() === 1;
      
    case 'custom':
      return _checkCustomPeriodicity(habit, date);
      
    default:
      return true; // Fallback para retrocompatibilidad
  }
}

/** Helper function to check custom periodicity */
function _checkCustomPeriodicity(habit, date) {
  // Manejo de customDays (ej: "1,3,5" = Lun,Mié,Vie)
  if (habit.customDays && habit.customDays.trim()) {
    return _isCustomDaysDue(habit.customDays, date);
  }
  
  // Manejo de customInterval (ej: "3" = cada 3 días desde creación)
  if (habit.customInterval && habit.customInterval.trim()) {
    return _isCustomIntervalDue(habit.customInterval, habit.createdAt, date);
  }
  
  return false; // Sin configuración válida
}

/** Check if today matches any of the custom days (1-7 = Lun-Dom) */
function _isCustomDaysDue(customDays, date) {
  try {
    const validDays = _parseCustomDays(customDays);
    const todayDay = date.getDay(); // 0=Dom, 1=Lun, 2=Mar, ... 6=Sáb
    // Convertir de getDay() (0=Dom) a nuestro sistema (1=Lun, 7=Dom)
    const adjustedDay = todayDay === 0 ? 7 : todayDay;
    return validDays.includes(adjustedDay);
  } catch (error) {
    console.error('Error parsing custom days:', customDays, error);
    return false;
  }
}

/** Check if today matches the custom interval (every N days since creation) */
function _isCustomIntervalDue(customInterval, createdAt, date) {
  try {
    const interval = parseInt(customInterval, 10);
    if (!Number.isInteger(interval) || interval <= 0) {
      throw new Error('Invalid interval');
    }
    
    const creationDate = new Date(createdAt);
    const creationDateKey = creationDate.toISOString().split('T')[0];
    const creationDateNormalized = new Date(creationDateKey + 'T12:00:00');
    
    // Calcular días desde la creación
    const daysSinceCreation = Math.floor(
      (date.getTime() - creationDateNormalized.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // El hábito es debido si han pasado múltiplos exactos del intervalo
    return daysSinceCreation >= 0 && daysSinceCreation % interval === 0;
  } catch (error) {
    console.error('Error parsing custom interval:', customInterval, error);
    return false;
  }
}

/** Parse and validate custom days string (ej: "1,3,5" -> [1,3,5]) */
function _parseCustomDays(customDays) {
  const parts = customDays.split(',').map(s => s.trim());
  const validDays = [];
  
  for (const part of parts) {
    const day = parseInt(part, 10);
    if (Number.isInteger(day) && day >= 1 && day <= 7) {
      validDays.push(day);
    } else {
      throw new Error(`Invalid day: ${part}`);
    }
  }
  
  if (validDays.length === 0) {
    throw new Error('No valid days found');
  }
  
  return [...new Set(validDays)]; // Remove duplicates
}

/** Check if a habit is currently expired (past its due time today) */
export function isHabitExpired(habit, today, history) {
  if (habit.weeklyTimesTarget) return false;
  
  // Si ya tiene un estado para hoy, no está vencido
  const todayStatus = history[today]?.[habit.id];
  if (todayStatus) return false;
  
  // Solo puede estar vencido si era debido hoy
  if (!isHabitDueOnDate(habit, today)) return false;
  
  // Verificar si ya pasó la medianoche (00:00)
  const now = new Date();
  const todayEnd = new Date(today + 'T23:59:59');
  
  return now > todayEnd;
}

/** Calculate points earned for completing a habit */
export function calcPoints(habit, activeEffects = []) {
  // Apply temporary multiplier boosts to base multiplier for calculation
  let effectiveMultiplier = habit.multiplier;
  
  // Global boosts
  const globalBoostEffect = activeEffects.find(e => e.key === 'global_mult_boost');
  if (globalBoostEffect) {
    effectiveMultiplier += globalBoostEffect.value;
  }
  
  // Targeted habit boosts
  const habitBoostEffect = activeEffects.find(e => 
    e.key === 'habit_mult_boost' && 
    (!e.targetHabitId || e.targetHabitId === habit.id)
  );
  if (habitBoostEffect) {
    effectiveMultiplier += habitBoostEffect.value;
  }
  
  const basePoints = habit.minutes * Math.min(3.0, effectiveMultiplier);

  let multiplier = 1;
  if (activeEffects.some(e => e.key === 'double_points')) multiplier *= 2;
  // Check for targeted next_triple effect
  if (activeEffects.some(e => e.key === 'next_triple' && e.targetHabitId === habit.id)) multiplier *= 3;
  // Check for global next_triple effect (legacy)
  if (activeEffects.some(e => e.key === 'next_triple' && !e.targetHabitId)) multiplier *= 3;

  return Math.round(basePoints * multiplier);
}

/** Calculate new multiplier after completing a habit */
export function calcMultiplierOnComplete(habit, activeEffects = []) {
  const globalBoostEffect = activeEffects.find(e => e.key === 'global_mult_boost');
  const globalBoost = globalBoostEffect ? globalBoostEffect.value : 0;
  
  // Check for targeted habit boosts
  const habitBoostEffect = activeEffects.find(e => 
    e.key === 'habit_mult_boost' && 
    (!e.targetHabitId || e.targetHabitId === habit.id)
  );
  const habitBoost = habitBoostEffect ? habitBoostEffect.value : 0;
  
  return Math.min(3.0, parseFloat((habit.multiplier + 0.2 + globalBoost + habitBoost).toFixed(1)));
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

  const isCompletedStatus = (status) =>
    status === 'completed' || status === 'partial' || status === 'over';

  for (let i = 1; i <= 365; i++) {
    const key = getDateKey(i);
    const day = history[key];
    if (!day) break;

    const dueHabits = habits.filter(h => isHabitDueOnDate(h, key));
    if (dueHabits.length === 0) continue;

    const allCompleted = dueHabits.every(h => isCompletedStatus(day[h.id]));
    if (allCompleted) streak++;
    else break;
  }
  return streak;
}

/** Get the Monday of the week for a given date */
export function getWeekStart(dateStr) {
  const date = new Date(dateStr + 'T12:00:00');
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Adjust when day is Sunday
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  return monday.toISOString().split('T')[0];
}

/** Get completions count for a weekly_times habit in a given week (Mon-Sun) */
export function getWeekCompletions(habitId, history, dateStr) {
  const weekStart = getWeekStart(dateStr);
  const weekStartDate = new Date(weekStart + 'T12:00:00');
  
  const isCompletedStatus = (status) =>
    status === 'completed' || status === 'partial' || status === 'over';
  
  let completions = 0;
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(weekStartDate);
    currentDate.setDate(weekStartDate.getDate() + i);
    const dateKey = currentDate.toISOString().split('T')[0];
    const dayData = history[dateKey] ?? {};
    const status = dayData[habitId];
    if (isCompletedStatus(status)) {
      completions++;
    }
  }
  return completions;
}

export const PERIODICITY_LABELS = {
  daily:        'Diaria',
  weekly:       'Semanal',
  monthly:      'Mensual',
  custom:       'Personalizado',
};

