/**
 * ============================================
 * LÓGICA DEL JUEGO - FUNCIONES UTILITARIAS
 * ============================================
 * Este archivo contiene las funciones centrales del motor de juego
 * que calculan puntos, verifican estados de hábitos, manejan fechas
 * y gestionan la lógica de rachas y progresión.
 * 
 * Este archivo ES EL PRINCIPAL motor de lógica (reemplaza a gameEngine.js).
 * 
 * FUNCIONES PRINCIPALES:
 * - Cálculo de puntos y multiplicadores
 * - Verificación de vencimiento de hábitos
 * - Gestión de fechas y períodos (semanal, mensual)
 * - Cálculo de rachas (streaks)
 * - Progressión de niveles
 */

// ════════════════════════════════════════════════════════════════════════
// UMBRALES DE NIVEL
// ════════════════════════════════════════════════════════════════════════

// Nivel thresholds (puntos necesarios para SUBIR DE NIVEL)
// Ejemplo: LEVEL_THRESHOLDS[0] = 627 significa 627 puntos para pasar del nivel 0 al 1
// La progresión es exponencial, creando mayor dificultad en niveles altos
export const LEVEL_THRESHOLDS = [627, 2268, 4872, 9072, 15552, 25194, 39366, 59049];

export function getLevelThreshold(level) {
  return LEVEL_THRESHOLDS[level]
    ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] * (level - LEVEL_THRESHOLDS.length + 2);
}

/**
 * Interpola entre dos colores hexadecimales.
 * Útil para crear gradientes de color dinámicos.
 * 
 * @param {string} color1 - Color inicio en formato hex (#RRGGBB)
 * @param {string} color2 - Color final en formato hex (#RRGGBB)
 * @param {number} factor - Factor de interpolación (0 = color1, 1 = color2)
 * @returns {string} Color interpolado en hex
 */
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

/**
 * Obtiene el color para la barra de progreso según el porcentaje.
 * 
 * FUNCIONAMIENTO:
 * - 100%: Verde (completado)
 * - 0%: Rojo (sin progreso)
 * - Entre 0-100%: Gradiente de rojo a verde
 * 
 * @param {number} pct - Porcentaje de progreso (0-100)
 * @returns {string} Color en formato hex
 */
export function getProgressColor(pct) {
  if (pct >= 100) return '#22c55e';
  if (pct <= 0) return '#ef4444';
  const factor = pct / 100;
  return interpolateColor('#ef4444', '#22c55e', factor);
}

/**
 * Obtiene información del nivel actual del jugador.
 * 
 * @param {number} level - Nivel actual
 * @param {number} points - Puntos actuales
 * @returns {Object} { threshold, pct, remaining }
 */
export function getLevelInfo(level, points) {
  const threshold = getLevelThreshold(level);
  const pct = Math.min(100, Math.round((points / threshold) * 100));
  return { threshold, pct, remaining: threshold - points };
}

/**
 * Obtiene la fecha de hoy en formato YYYY-MM-DD.
 * Utiliza la fecha ISO para consistencia entre zonas horarias.
 * 
 * @returns {string} Fecha de hoy
 */
export function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Obtiene la fecha de ayer en formato YYYY-MM-DD.
 * Útil para comparaciones y cálculos de rachas.
 * 
 * @returns {string} Fecha de ayer
 */
export function getYesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

/**
 * Obtiene una fecha relativa a hoy.
 * 
 * @param {number} daysAgo - Días hacia atrás (0 = hoy, 1 = ayer, etc.)
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export function getDateKey(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

/**
 * Verifica si un hábito está "debido" (pendiente de completar) en una fecha específica.
 * 
 * FUNCIONAMIENTO:
 * Determina si el usuario debe completar el hábito en la fecha dada,
 * basándose en la periodicidad configurada:
 * 
 * - daily: Siempre está debido
 * - weekly: Está debido si no se ha completado en la semana
 * - monthly: Está debido si no se ha completado en el mes
 * - custom: Verifica configuración personalizada
 * - weekly_times: Siempre está debido (se gestiona por cantidad semanal)
 * 
 * @param {Object} habit - Objeto del hábito
 * @param {string} dateStr - Fecha a verificar en formato YYYY-MM-DD
 * @param {Object} history - Historial de completaciones
 * @returns {boolean} true si el hábito está debido
 */
export function isHabitDueOnDate(habit, dateStr, history = {}) {
  // Los hábitos weekly_times siempre se muestran (la lógica de objetivo está en otro lugar)
  if (habit.weeklyTimesTarget) return true;
  const date = new Date(dateStr + 'T12:00:00');
  
  switch (habit.periodicity) {
    case 'daily':
      return true;
      
    case 'weekly':
      // Solo está debido si NO se ha completado en la semana actual
      return !isHabitCompletedThisPeriod(habit, dateStr, history);
      
    case 'monthly':
      // Solo está debido si NO se ha completado en el mes actual
      return !isHabitCompletedThisPeriod(habit, dateStr, history);
      
    case 'custom':
      return _checkCustomPeriodicity(habit, date);
      
    default:
      return true; // Fallback para retrocompatibilidad
  }
}

/**
 * Función auxiliar que verifica la periodicidad personalizada.
 * 
 * TIPOS DE PERSONALIZACIÓN:
 * 1. customDays: Días específicos de la semana (ej: "1,3,5" = Lun, Mie, Vie)
 * 2. customInterval: Intervalo de días desde creación (ej: "3" = cada 3 días)
 * 
 * @param {Object} habit - Objeto del hábito
 * @param {Date} date - Fecha a verificar
 * @returns {boolean}
 */
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

/**
 * Verifica si el día actual coincide con los días personalizados.
 * 
 * SISTEMA DE DÍAS:
 * - 1 = Lunes
 * - 2 = Martes
 * - 3 = Miércoles
 * - 4 = Jueves
 * - 5 = Viernes
 * - 6 = Sábado
 * - 7 = Domingo
 * 
 * @param {string} customDays - Cadena con días separados por coma (ej: "1,3,5")
 * @param {Date} date - Fecha a verificar
 * @returns {boolean}
 */
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

/**
 * Verifica si la fecha actual coincide con el intervalo personalizado.
 * 
 * FUNCIONAMIENTO:
 * Calcula los días transcurridos desde la creación del hábito.
 * El hábito es debido si el resultado es múltiplo del intervalo.
 * 
 * @param {string} customInterval - Intervalo en días (ej: "3")
 * @param {string} createdAt - Fecha de creación del hábito
 * @param {Date} date - Fecha a verificar
 * @returns {boolean}
 */
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

/**
 * Parsea y valida una cadena de días personalizados.
 * 
 * EJEMPLOS:
 * - "1,3,5" -> [1, 3, 5] (Lunes, Miércoles, Viernes)
 * - "1,2,3,4,5" -> [1, 2, 3, 4, 5] (Días laborales)
 * - "7" -> [7] (Solo domingos)
 * 
 * @param {string} customDays - Cadena con días separados por coma
 * @returns {Array<number>} Array de días válidos (sin duplicados)
 * @throws Error si el formato es inválido
 */
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
  
  return [...new Set(validDays)]; // Elimina duplicados
}

/**
 * Verifica si un hábito ha expirado (ya no se puede completar).
 * 
 * FUNCIONAMIENTO:
 * - daily/custom: Expira después de las 23:59:59 del día
 * - weekly: Expira después del domingo de la semana
 * - monthly: Expira después del último día del mes
 * - weekly_times: No expira (se gestiona por cantidad)
 * 
 * @param {Object} habit - Objeto del hábito
 * @param {string} today - Fecha actual en formato YYYY-MM-DD
 * @param {Object} history - Historial de completaciones
 * @returns {boolean} true si el hábito ha expirado
 */
export function isHabitExpired(habit, today, history) {
  if (habit.weeklyTimesTarget) return false;
  
  // For weekly and monthly, check if the period has ended
  if (habit.periodicity === 'weekly') {
    const weekEnd = getWeekEnd(today);
    const todayDate = new Date(today + 'T12:00:00');
    const weekEndDate = new Date(weekEnd + 'T12:00:00');
    const now = new Date();
    
    // Only expired if we're past the week end AND not completed in this period
    if (now > weekEndDate && !isHabitCompletedThisPeriod(habit, today, history)) {
      return true;
    }
    return false;
  }
  
  if (habit.periodicity === 'monthly') {
    const monthEnd = getMonthEnd(today);
    const todayDate = new Date(today + 'T12:00:00');
    const monthEndDate = new Date(monthEnd + 'T12:00:00');
    const now = new Date();
    
    // Only expired if we're past the month end AND not completed in this period
    if (now > monthEndDate && !isHabitCompletedThisPeriod(habit, today, history)) {
      return true;
    }
    return false;
  }
  
  // Daily and custom: original logic
  const todayStatus = history[today]?.[habit.id];
  if (todayStatus) return false;
  
  if (!isHabitDueOnDate(habit, today, history)) return false;
  
  const now = new Date();
  const todayEnd = new Date(today + 'T23:59:59');
  
  return now > todayEnd;
}

/**
 * Calcula los puntos ganados al completar un hábito.
 * 
 * FUNCIONAMIENTO:
 * 1. Toma los minutos del hábito y multiplicador actual
 * 2. Aplica bonificaciones globales (global_mult_boost)
 * 3. Aplica bonificaciones dirigidas a este hábito específico
 * 4. Aplica bonificadores de puntos (double_points, triple)
 * 5. Retorna el total de puntos (redondeado)
 * 
 * EFECTOS CONSIDERADOS:
 * - global_mult_boost: +X a TODOS los multiplicadores
 * - habit_mult_boost: +X solo a un hábito específico
 * - double_points: dobla los puntos
 * - next_triple: triplica los puntos (global o dirigido)
 * 
 * @param {Object} habit - Objeto del hábito completado
 * @param {Array} activeEffects - Lista de efectos activos del jugador
 * @returns {number} Puntos ganados
 */
export function calcPoints(habit, activeEffects = []) {
  // Aplicar bonificaciones temporales al multiplicador base
  let effectiveMultiplier = habit.multiplier;
  
  // Bonificaciones globales (afectan a todos los hábitos)
  const globalBoostEffect = activeEffects.find(e => e.key === 'global_mult_boost');
  if (globalBoostEffect) {
    effectiveMultiplier += globalBoostEffect.value;
  }
  
  // Bonificaciones dirigidas (solo a un hábito específico)
  const habitBoostEffect = activeEffects.find(e => 
    e.key === 'habit_mult_boost' && 
    (!e.targetHabitId || e.targetHabitId === habit.id)
  );
  if (habitBoostEffect) {
    effectiveMultiplier += habitBoostEffect.value;
  }
  
  // Puntos base = minutos * multiplicador (máx 3.0)
  const basePoints = habit.minutes * Math.min(3.0, effectiveMultiplier);

  // Aplicar bonificadores de puntos
  let multiplier = 1;
  if (activeEffects.some(e => e.key === 'double_points')) multiplier *= 2;
  // Verificar efecto next_triple dirigido a este hábito
  if (activeEffects.some(e => e.key === 'next_triple' && e.targetHabitId === habit.id)) multiplier *= 3;
  // Verificar efecto next_triple global (legacy)
  if (activeEffects.some(e => e.key === 'next_triple' && !e.targetHabitId)) multiplier *= 3;

  return Math.round(basePoints * multiplier);
}

/**
 * Calcula el nuevo multiplicador después de completar un hábito.
 * 
 * FUNCIONAMIENTO:
 * - Aumenta el multiplicador en 0.2 (MULTIPLIER_STEP)
 * - Aplica bonificaciones de efectos activos
 * - El multiplicador no puede exceder 3.0
 * 
 * @param {Object} habit - Objeto del hábito completado
 * @param {Array} activeEffects - Lista de efectos activos
 * @returns {number} Nuevo valor del multiplicador
 */
export function calcMultiplierOnComplete(habit, activeEffects = []) {
  const globalBoostEffect = activeEffects.find(e => e.key === 'global_mult_boost');
  const globalBoost = globalBoostEffect ? globalBoostEffect.value : 0;
  
  // Verificar bonificaciones dirigidas al hábito
  const habitBoostEffect = activeEffects.find(e => 
    e.key === 'habit_mult_boost' && 
    (!e.targetHabitId || e.targetHabitId === habit.id)
  );
  const habitBoost = habitBoostEffect ? habitBoostEffect.value : 0;
  
  // Nuevo multiplicador = actual + 0.2 + bonificaciones, máx 3.0
  return Math.min(3.0, parseFloat((habit.multiplier + 0.2 + globalBoost + habitBoost).toFixed(1)));
}

/**
 * Calcula el nuevo multiplicador después de fallar un hábito.
 * 
 * FUNCIONAMIENTO:
 * - Si hay escudo de racha: protege el multiplicador
 * - Si hay escudo dorado: no solo protege, sino que aumenta +0.2
 * - Si hay reducción de penalización: reduce la pérdida
 * - Por defecto: -0.4 al multiplicador
 * - El multiplicador no puede bajar de 1.0
 * 
 * @param {Object} habit - Objeto del hábito fallado
 * @param {Array} activeEffects - Lista de efectos activos
 * @returns {number} Nuevo valor del multiplicador
 */
export function calcMultiplierOnFail(habit, activeEffects = []) {
  // Verificar si hay escudo (protege el multiplicador)
  if (activeEffects.some(e => e.key === 'streak_shield')) return habit.multiplier;
  // Escudo dorado: protege Y aumenta +0.2
  if (activeEffects.some(e => e.key === 'golden_shield')) return parseFloat((habit.multiplier + 0.2).toFixed(1));

  // Verificar reducción de penalización
  const penaltyEffect = activeEffects.find(e => e.key === 'reduced_penalty');
  const penalty = penaltyEffect ? penaltyEffect.value : 0.4;

  // El multiplicador no puede bajar de 1.0
  return Math.max(1.0, parseFloat((habit.multiplier - penalty).toFixed(1)));
}

/**
 * Obtiene el historial de los últimos N días para un hábito específico.
 * Útil para mostrar gráficos o estadísticas de progreso.
 * 
 * @param {string} habitId - ID del hábito
 * @param {Object} history - Historial completo { fecha: { hábito: estado } }
 * @param {number} days - Número de días hacia atrás (por defecto 14)
 * @returns {Array} Array de { date, status } para cada día
 */
export function getHabitRecentHistory(habitId, history, days = 14) {
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = getDateKey(i);
    const dayData = history[key] ?? {};
    result.push({ date: key, status: dayData[habitId] ?? 'none' });
  }
  return result;
}

/**
 * Calcula la racha global del jugador.
 * 
 * FUNCIONAMIENTO:
 * Una racha global cuenta los días consecutivos donde el jugador
 * ha completado TODOS los hábitos que le correspondían.
 * 
 * ESTADOS CONSIDERADOS COMO "COMPLETADOS":
 * - completed: Completado normalmente
 * - partial: Completado parcialmente (menos tiempo del requerido)
 * - over: Completado de más (más tiempo del requerido)
 * 
 * @param {Array} habits - Lista de hábitos del jugador
 * @param {Object} history - Historial de completaciones
 * @returns {number} Días consecutivos de racha global
 */
export function calcGlobalStreak(habits, history) {
  if (habits.length === 0) return 0;
  let streak = 0;

  const isCompletedStatus = (status) =>
    status === 'completed' || status === 'partial' || status === 'over';

  // Recorrer hasta 365 días hacia atrás
  for (let i = 1; i <= 365; i++) {
    const key = getDateKey(i);
    const day = history[key];
    if (!day) break; // No hay más datos, terminar

    // Obtener hábitos que correspondían ese día
    const dueHabits = habits.filter(h => isHabitDueOnDate(h, key, history));
    if (dueHabits.length === 0) continue; // No había hábitos, continuar

    // Verificar si TODOS fueron completados
    const allCompleted = dueHabits.every(h => isCompletedStatus(day[h.id]));
    if (allCompleted) streak++;
    else break; // Un día sin completar todo, terminar racha
  }
  return streak;
}

/**
 * Obtiene el lunes de la semana para una fecha dada.
 * Utilizado para cálculos de hábitos semanales y mensuales.
 * 
 * @param {string} dateStr - Fecha en formato YYYY-MM-DD
 * @returns {string} Fecha del lunes en formato YYYY-MM-DD
 */
export function getWeekStart(dateStr) {
  const date = new Date(dateStr + 'T12:00:00');
  const day = date.getDay();
  // Ajuste: si es domingo (0), ir al lunes anterior (-6 días)
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  return monday.toISOString().split('T')[0];
}

/**
 * Obtiene el domingo de la semana para una fecha dada.
 * 
 * @param {string} dateStr - Fecha en formato YYYY-MM-DD
 * @returns {string} Fecha del domingo en formato YYYY-MM-DD
 */
export function getWeekEnd(dateStr) {
  const weekStart = getWeekStart(dateStr);
  const monday = new Date(weekStart + 'T12:00:00');
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return sunday.toISOString().split('T')[0];
}

/**
 * Obtiene el primer día del mes para una fecha dada.
 * 
 * @param {string} dateStr - Fecha en formato YYYY-MM-DD
 * @returns {string} Primer día del mes en formato YYYY-MM-DD
 */
export function getMonthStart(dateStr) {
  const date = new Date(dateStr + 'T12:00:00');
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
}

/**
 * Obtiene el último día del mes para una fecha dada.
 * 
 * @param {string} dateStr - Fecha en formato YYYY-MM-DD
 * @returns {string} Último día del mes en formato YYYY-MM-DD
 */
export function getMonthEnd(dateStr) {
  const date = new Date(dateStr + 'T12:00:00');
  // Mes + 1, día 0 = último día del mes actual
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
}

/**
 * Verifica si un hábito ha sido completado en el período actual (semana o mes).
 * 
 * FUNCIONAMIENTO:
 * Para hábitos semanales: busca cualquier completación desde el lunes hasta el domingo
 * Para hábitos mensuales: busca cualquier completación desde el día 1 hasta el último día del mes
 * 
 * @param {Object} habit - Objeto del hábito
 * @param {string} dateStr - Fecha de referencia en formato YYYY-MM-DD
 * @param {Object} history - Historial de completaciones
 * @returns {boolean} true si el hábito fue completado en el período
 */
export function isHabitCompletedThisPeriod(habit, dateStr, history) {
  if (!history || Object.keys(history).length === 0) return false;
  
  const date = new Date(dateStr + 'T12:00:00');
  const isCompletedStatus = (status) =>
    status === 'completed' || status === 'partial' || status === 'over';
  
  if (habit.periodicity === 'weekly') {
    const weekStart = getWeekStart(dateStr);
    const weekEnd = getWeekEnd(dateStr);
    const weekStartDate = new Date(weekStart + 'T12:00:00');
    
    // Buscar cualquier completación en la semana
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStartDate);
      currentDate.setDate(weekStartDate.getDate() + i);
      const dateKey = currentDate.toISOString().split('T')[0];
      const dayData = history[dateKey] ?? {};
      if (isCompletedStatus(dayData[habit.id])) {
        return true;
      }
    }
    return false;
  }
  
  if (habit.periodicity === 'monthly') {
    const monthStart = getMonthStart(dateStr);
    const monthEnd = getMonthEnd(dateStr);
    const startDate = new Date(monthStart + 'T12:00:00');
    const endDate = new Date(monthEnd + 'T12:00:00');
    
    // Calcular días en el mes
    const daysInMonth = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Buscar cualquier completación en el mes
    for (let i = 0; i < daysInMonth; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateKey = currentDate.toISOString().split('T')[0];
      const dayData = history[dateKey] ?? {};
      if (isCompletedStatus(dayData[habit.id])) {
        return true;
      }
    }
    return false;
  }
  
  return false;
}

/**
 * Cuenta las completaciones de un hábito "weekly_times" en una semana específica.
 * Útil para verificar si se alcanzó el objetivo semanal.
 * 
 * @param {string} habitId - ID del hábito
 * @param {Object} history - Historial de completaciones
 * @param {string} dateStr - Fecha de referencia (cualquier día de la semana)
 * @returns {number} Número de días completados en la semana
 */
export function getWeekCompletions(habitId, history, dateStr) {
  const weekStart = getWeekStart(dateStr);
  const weekStartDate = new Date(weekStart + 'T12:00:00');
  
  const isCompletedStatus = (status) =>
    status === 'completed' || status === 'partial' || status === 'over';
  
  let completions = 0;
  // Contar de lunes a domingo
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

/**
 * Etiquetas legible de las periodicidades disponibles.
 * Usadas para mostrar en la UI.
 */
export const PERIODICITY_LABELS = {
  daily:        'Diaria',
  weekly:       'Semanal',
  monthly:      'Mensual',
  custom:       'Personalizado',
};

