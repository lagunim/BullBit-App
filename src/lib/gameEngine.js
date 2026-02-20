import { MULTIPLIER_STEP, MULTIPLIER_PENALTY, MIN_MULTIPLIER, MAX_MULTIPLIER, LEVEL_THRESHOLDS } from './constants.js';

export function calculatePoints(minutes, multiplier, activeEffects = []) {
  let eff = multiplier;
  if (activeEffects.find(e => e.type === 'double_xp' && !isExpired(e))) eff += 2;
  if (activeEffects.find(e => e.type === 'mult_boost' && !isExpired(e)))
    eff += (activeEffects.find(e => e.type === 'mult_boost').value || 1);
  return Math.round(minutes * eff * 10) / 10;
}

export function applyCompletion(habit, activeEffects = []) {
  let points = calculatePoints(habit.minutes, habit.multiplier, activeEffects);
  // Lucky coin doubles points
  if (activeEffects.find(e => e.type === 'lucky_coin' && !isExpired(e))) points *= 2;
  const newMultiplier = Math.min(MAX_MULTIPLIER, Math.round((habit.multiplier + MULTIPLIER_STEP) * 10) / 10);
  return { points: Math.round(points * 10) / 10, newMultiplier };
}

export function applyMiss(habit, activeEffects = []) {
  if (activeEffects.find(e => e.type === 'shield' && !isExpired(e)))
    return { newMultiplier: habit.multiplier, shieldUsed: true };
  const penalty = activeEffects.find(e => e.type === 'iron_will' && !isExpired(e)) ? 0.2 : MULTIPLIER_PENALTY;
  return { newMultiplier: Math.max(MIN_MULTIPLIER, Math.round((habit.multiplier - penalty) * 10) / 10), shieldUsed: false };
}

export function isExpired(e) { return new Date() > new Date(e.expiresAt); }

export function getLevelInfo(totalPoints, currentLevel) {
  const threshold = LEVEL_THRESHOLDS[currentLevel] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  return { threshold, progress: Math.min(totalPoints / threshold, 1), pointsNeeded: Math.max(0, threshold - totalPoints) };
}

export function checkLevelUp(totalPoints, currentLevel) {
  const threshold = LEVEL_THRESHOLDS[currentLevel] ?? Infinity;
  if (totalPoints >= threshold) return { leveled: true, newLevel: currentLevel + 1, remainingPoints: 0 };
  return { leveled: false, newLevel: currentLevel, remainingPoints: totalPoints };
}

export function formatDate(date = new Date()) { return date.toISOString().split('T')[0]; }

export function getYesterday() { const d = new Date(); d.setDate(d.getDate() - 1); return formatDate(d); }

export function getStreak(habitId, completions) {
  let streak = 0;
  const today = formatDate();
  const startDay = completions[`${habitId}:${today}`] ? 0 : 1;
  for (let i = startDay; i < 365; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    if (completions[`${habitId}:${formatDate(d)}`]) streak++;
    else break;
  }
  return streak;
}

export function getMultiplierColor(v) {
  if (v >= 3.0) return 'glow-text-gold';
  if (v >= 2.0) return 'glow-text-green';
  if (v >= 1.4) return 'glow-text-cyan';
  if (v <= 0.6) return 'glow-text-red';
  return 'text-quest-textDim';
}
