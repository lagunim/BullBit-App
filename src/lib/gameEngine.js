/**
 * ============================================
 * MOTOR DEL JUEGO - FUNCIONES UTILITARIAS
 * ============================================
 * Este archivo contiene funciones puras del motor de juego
 * que calculan puntos, multiplicadores, niveles y estados.
 * 
 * NOTA: Este archivo parece no estar en uso activo (reemplazado
 * por gameLogic.js), pero se mantiene por compatibilidad.
 */

import { MULTIPLIER_STEP, MULTIPLIER_PENALTY, MIN_MULTIPLIER, MAX_MULTIPLIER, LEVEL_THRESHOLDS } from './constants.js';

/**
 * Calcula los puntos ganados por completar un hábito.
 * 
 * FUNCIONAMIENTO:
 * 1. Toma los minutos del hábito y el multiplicador actual
 * 2. Aplica bonificaciones de efectos activos (double_xp, mult_boost)
 * 3. Redondea el resultado a 1 decimal
 * 
 * @param {number} minutes - Minutos asociados al hábito
 * @param {number} multiplier - Multiplicador actual del hábito
 * @param {Array} activeEffects - Lista de efectos activos del jugador
 * @returns {number} Puntos calculados
 */
export function calculatePoints(minutes, multiplier, activeEffects = []) {
  let eff = multiplier;
  if (activeEffects.find(e => e.type === 'double_xp' && !isExpired(e))) eff += 2;
  if (activeEffects.find(e => e.type === 'mult_boost' && !isExpired(e)))
    eff += (activeEffects.find(e => e.type === 'mult_boost').value || 1);
  return Math.round(minutes * eff * 10) / 10;
}

/**
 * Aplica las consecuencias de completar un hábito exitosamente.
 * 
 * FUNCIONAMIENTO:
 * 1. Calcula los puntos ganados
 * 2. Aplica bonificación de "lucky coin" (x2 puntos)
 * 3. Incrementa el multiplicador en MULTIPLIER_STEP (0.2)
 * 4. Retorna los nuevos valores
 * 
 * @param {Object} habit - Objeto del hábito completado
 * @param {Array} activeEffects - Efectos activos del jugador
 * @returns {Object} { points, newMultiplier }
 */
export function applyCompletion(habit, activeEffects = []) {
  let points = calculatePoints(habit.minutes, habit.multiplier, activeEffects);
  // Lucky coin dobla los puntos
  if (activeEffects.find(e => e.type === 'lucky_coin' && !isExpired(e))) points *= 2;
  const newMultiplier = Math.min(MAX_MULTIPLIER, Math.round((habit.multiplier + MULTIPLIER_STEP) * 10) / 10);
  return { points: Math.round(points * 10) / 10, newMultiplier };
}

/**
 * Aplica las consecuencias de fallar un hábito.
 * 
 * FUNCIONAMIENTO:
 * 1. Si existe un escudo activo, protege el multiplicador
 * 2. Si existe "iron_will", reduce la penalización de 0.4 a 0.2
 * 3. Resta la penalización del multiplicador actual
 * 4. El multiplicador no puede bajar de MIN_MULTIPLIER
 * 
 * @param {Object} habit - Objeto del hábito fallado
 * @param {Array} activeEffects - Efectos activos del jugador
 * @returns {Object} { newMultiplier, shieldUsed }
 */
export function applyMiss(habit, activeEffects = []) {
  if (activeEffects.find(e => e.type === 'shield' && !isExpired(e)))
    return { newMultiplier: habit.multiplier, shieldUsed: true };
  const penalty = activeEffects.find(e => e.type === 'iron_will' && !isExpired(e)) ? 0.2 : MULTIPLIER_PENALTY;
  return { newMultiplier: Math.max(MIN_MULTIPLIER, Math.round((habit.multiplier - penalty) * 10) / 10), shieldUsed: false };
}

/**
 * Verifica si un efecto ha expirado.
 * @param {Object} e - Objeto efecto con campo expiresAt
 * @returns {boolean} true si la fecha actual es posterior a expiresAt
 */
export function isExpired(e) { return new Date() > new Date(e.expiresAt); }

/**
 * Obtiene información del nivel actual del jugador.
 * 
 * FUNCIONAMIENTO:
 * 1. Obtiene el umbral de puntos para el nivel actual
 * 2. Calcula el progreso como porcentaje (0-1)
 * 3. Calcula los puntos faltantes para el siguiente nivel
 * 
 * @param {number} totalPoints - Puntos totales del jugador
 * @param {number} currentLevel - Nivel actual
 * @returns {Object} { threshold, progress, pointsNeeded }
 */
export function getLevelInfo(totalPoints, currentLevel) {
  const threshold = LEVEL_THRESHOLDS[currentLevel] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  return { threshold, progress: Math.min(totalPoints / threshold, 1), pointsNeeded: Math.max(0, threshold - totalPoints) };
}

/**
 * Verifica si el jugador debe subir de nivel.
 * 
 * FUNCIONAMIENTO:
 * Compara los puntos totales con el umbral del nivel actual.
 * 
 * @param {number} totalPoints - Puntos totales del jugador
 * @param {number} currentLevel - Nivel actual
 * @returns {Object} { leveled, newLevel, remainingPoints }
 */
export function checkLevelUp(totalPoints, currentLevel) {
  const threshold = LEVEL_THRESHOLDS[currentLevel] ?? Infinity;
  if (totalPoints >= threshold) return { leveled: true, newLevel: currentLevel + 1, remainingPoints: 0 };
  return { leveled: false, newLevel: currentLevel, remainingPoints: totalPoints };
}

/**
 * Convierte una fecha a formato YYYY-MM-DD (formato ISO de fecha).
 * @param {Date} date - Fecha a formatear (por defecto, hoy)
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export function formatDate(date = new Date()) { return date.toISOString().split('T')[0]; }

/**
 * Obtiene la fecha de ayer en formato YYYY-MM-DD.
 * @returns {string} Fecha de ayer
 */
export function getYesterday() { const d = new Date(); d.setDate(d.getDate() - 1); return formatDate(d); }

/**
 * Calcula la racha actual de un hábito.
 * 
 * FUNCIONAMIENTO:
 * 1. Comienza desde hoy (o ayer si hoy ya está completado)
 * 2. Cuenta hacia atrás hasta 365 días
 * 3. Se detiene al primer día sin completación
 * 
 * @param {string} habitId - ID del hábito
 * @param {Object} completions - Mapa de completaciones { habitId: fecha: status }
 * @returns {number} Días consecutivos de completación
 */
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

/**
 * Obtiene el color CSS para mostrar el multiplicador.
 * Proporciona feedback visual según el valor del multiplicador.
 * 
 * @param {number} v - Valor del multiplicador
 * @returns {string} Clase CSS para el color
 */
export function getMultiplierColor(v) {
  if (v >= 3.0) return 'glow-text-gold';      // Excelente (oro)
  if (v >= 2.0) return 'glow-text-green';    // Bueno (verde)
  if (v >= 1.4) return 'glow-text-cyan';     // Normal-alto (cian)
  if (v <= 0.6) return 'glow-text-red';      // Bajo (rojo)
  return 'text-quest-textDim';                // Normal (gris)
}
