/**
 * ============================================
 * CAPA DE PERSISTENCIA - SUPABASE
 * ============================================
 * Este módulo maneja toda la comunicación con la base de datos Supabase.
 * Proporciona funciones para CRUD (Create, Read, Update, Delete) de cada entidad.
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * - Todas las funciones son "fire-and-forget": capturan errores internamente
 *   para no interrumpir la UI en caso de fallo de red.
 * - La fuente de verdad es Supabase.
 * - El estado local (Zustand) solo actúa como memoria de UI.
 * - Formato de datos: camelCase en el store, snake_case en la BD.
 * 
 * ESTRUCTURA DE TABLAS:
 * - profiles: Datos del usuario (nivel, puntos, racha global)
 * - habits: Hábitos del usuario
 * - habit_history: Historial de completaciones/fallos por fecha
 * - user_inventory: Inventario de objetos
 * - active_effects: Efectos activos temporales
 * - user_achievements: Logros desbloqueados
 * - user_daily_progress: Progreso del reto diario
 * - user_stories: Historias desbloqueadas
 */

import { supabase } from './supabase.js';
import { attachThemeToHabit } from '../data/habitThemes.js';

/**
 * ID de placeholder usado cuando no se tiene un ID válido de servidor.
 * Se usa para identificar hábitos que aún no se han persistido.
 */
const SERVER_ID_PLACEHOLDER = '00000000-0000-0000-0000-000000000000';

// ════════════════════════════════════════════════════════════════════════
// FUNCIONES AUXILIARES (HELPERS)
// ════════════════════════════════════════════════════════════════════════

/**
 * Convierte un hábito del formato del store (camelCase) al formato de la tabla de Supabase (snake_case).
 * 
 * Esta conversión es necesaria porque JavaScript usa camelCase pero
 * PostgreSQL (y por extensión Supabase) típicamente usa snake_case.
 * 
 * @param {string} userId - ID del usuario propietario
 * @param {Object} habit - Objeto hábito en formato store
 * @param {boolean} includeId - Si true, incluye el ID en el resultado
 * @returns {Object} Hábito en formato de fila de base de datos
 */
function habitToRow(userId, habit, includeId = true) {
  const row = {
    user_id: userId,
    name: habit.name,
    minutes: habit.minutes,
    periodicity: habit.periodicity,
    emoji: habit.emoji ?? '🎯',
    multiplier: habit.multiplier ?? 1.0,
    base_multiplier: habit.baseMultiplier ?? 1.0,
    streak: habit.streak ?? 0,
    custom_days: habit.customDays ?? null,
    custom_interval: habit.customInterval ?? null,
    weekly_times_target: habit.weeklyTimesTarget ?? null,
    theme_id: habit.themeId ?? undefined,
    created_at: habit.createdAt ?? new Date().toISOString(),
  };

  if (includeId && habit.id && habit.id !== SERVER_ID_PLACEHOLDER) {
    row.id = habit.id;
  }

  return row;
}

/**
 * Convierte una fila de la tabla habits al formato del store (camelCase).
 * Aplica el tema del hábito usando attachThemeToHabit para enriquecer
 * los datos con información visual (icono, color, etc.)
 * 
 * @param {Object} row - Fila de la tabla habits de Supabase
 * @returns {Object} Hábito en formato del store
 */
function rowToHabit(row) {
  return attachThemeToHabit({
    id: row.id,
    name: row.name,
    minutes: row.minutes,
    periodicity: row.periodicity,
    emoji: row.emoji ?? '🎯',
    multiplier: parseFloat(row.multiplier ?? 1.0),
    baseMultiplier: parseFloat(row.base_multiplier ?? 1.0),
    streak: row.streak ?? 0,
    customDays: row.custom_days ?? undefined,
    customInterval: row.custom_interval ?? undefined,
    weeklyTimesTarget: row.weekly_times_target ?? null,
    themeId: row.theme_id ?? undefined,
    createdAt: row.created_at,
  });
}

/**
 * Convierte una fila de active_effects al formato del store.
 * Los efectos activos son modificadores temporales que afectan
 * el gameplay (multiplicadores, escudos, bonificaciones).
 * 
 * @param {Object} row - Fila de la tabla active_effects
 * @returns {Object} Efecto en formato del store
 */
function rowToEffect(row) {
  return {
    key: row.effect_key,
    value: row.value !== null ? parseFloat(row.value) : undefined,
    expiresAt: row.expires_at ?? undefined,
    itemName: row.item_name ?? undefined,
    targetHabitId: row.target_habit_id ?? undefined,
  };
}

// ════════════════════════════════════════════════════════════════════════
// CARGA INICIAL DE DATOS
// ════════════════════════════════════════════════════════════════════════

/**
 * Carga TODO el estado del usuario desde Supabase en una sola operación.
 * Utiliza Promise.all para paralelizar las consultas y mejorar rendimiento.
 * 
 * PROCESO:
 * 1. Carga el perfil del usuario (nivel, puntos, rachas)
 * 2. Carga todos los hábitos del usuario
 * 3. Carga el historial de completaciones por fecha
 * 4. Carga el inventario de objetos
 * 5. Carga los efectos activos
 * 6. Carga los logros desbloqueados
 * 7. Carga el progreso del daily challenge
 * 8. Carga las historias desbloqueadas
 * 
 * @param {string} userId - ID del usuario en Supabase
 * @returns {Object|null} Objeto con todos los datos o null si es usuario nuevo
 */
export async function loadUserData(userId) {
  const [
    profileRes,
    habitsRes,
    historyRes,
    inventoryRes,
    effectsRes,
    achievementsRes,
    storiesRes,
    plansRes,
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('habits').select('*').eq('user_id', userId),
    supabase.from('habit_history').select('*').eq('user_id', userId),
    supabase.from('user_inventory').select('*').eq('user_id', userId),
    supabase.from('active_effects').select('*').eq('user_id', userId),
    supabase.from('user_achievements').select('achievement_id, unlocked_at').eq('user_id', userId),
    supabase.from('user_stories').select('journey_id, story_id, unlocked_at').eq('user_id', userId).order('journey_id', { ascending: true }),
    supabase.from('user_plans').select('*').eq('user_id', userId),
  ]);

  // Si el perfil no existe → usuario nuevo, sin datos en BD
  if (profileRes.error || !profileRes.data) return null;

  const profile = profileRes.data;
  const habits = (habitsRes.data ?? []).map(rowToHabit);

  // Reconstruir history: { 'YYYY-MM-DD': { [habitId]: status } }
  const history = {};
  for (const row of (historyRes.data ?? [])) {
    if (!history[row.date]) history[row.date] = {};
    history[row.date][row.habit_id] = row.status;
  }

  const inventory = (inventoryRes.data ?? []).map(row => ({
    itemId: row.item_id,
    qty: row.quantity,
  }));

  const activeEffects = (effectsRes.data ?? []).map(rowToEffect);
  const unlockedAchievements = (achievementsRes.data ?? []).map(r => r.achievement_id);

  const unlockedStories = (storiesRes.data ?? []).map(row => ({
    journeyId: row.journey_id,
    storyId: row.story_id,
    unlockedAt: row.unlocked_at,
  }));

  // Daily challenge - ahora se maneja completamente en _checkAndGenerateDaily
  // Solo retornamos valores null para mantener la compatibilidad
  const currentDaily = null;
  const dailyOptions = null;
  const dailySelectionMade = false;
  const lastDailyDate = null;

  // Plans - load tasks for each plan
  const plans = {};
  if (plansRes.data && plansRes.data.length > 0) {
    const planIds = plansRes.data.map(p => p.id);
    const { data: tasksData } = await supabase
      .from('plan_tasks')
      .select('*')
      .in('plan_id', planIds);

    const tasksByPlanId = {};
    if (tasksData) {
      for (const task of tasksData) {
        if (!tasksByPlanId[task.plan_id]) {
          tasksByPlanId[task.plan_id] = [];
        }
        tasksByPlanId[task.plan_id].push({
          id: task.id,
          name: task.name,
          durationMinutes: task.duration_minutes,
          completed: task.completed,
          completedAt: task.completed_at,
          deleted: task.deleted ?? false,
        });
      }
    }

    for (const plan of plansRes.data) {
      plans[plan.date] = {
        id: plan.id,
        date: plan.date,
        name: plan.name,
        tripleApplied: plan.triple_bonus_applied ?? false,
        tasks: tasksByPlanId[plan.id] ?? [],
      };
    }
  }

  return {
    level: profile.level ?? 0,
    points: profile.points ?? 0,
    lifetimePoints: profile.lifetime_points ?? 0,
    globalStreak: profile.global_streak ?? 0,
    lastWeeklyProcessDate: profile.last_weekly_process_date ?? null,
    habits,
    history,
    inventory,
    activeEffects,
    unlockedAchievements,
    unlockedStories,
    currentDaily,
    dailyOptions,
    dailySelectionMade,
    lastDailyDate,
    plans,
  };
}

// ════════════════════════════════════════════════════════════════════════
// PERFIL DEL USUARIO
// ════════════════════════════════════════════════════════════════════════

/**
 * Guarda o actualiza el perfil del usuario.
 * El perfil contiene estadísticas globales:
 * - level: Nivel actual del jugador
 * - points: Puntos de la sesión actual
 * - lifetimePoints: Puntos acumulados en total
 * - globalStreak: Días consecutivos completando todos los hábitos
 * - lastWeeklyProcessDate: Fecha del último procesamiento de hábitos semanales
 * 
 * @param {string} userId - ID del usuario
 * @param {Object} data - Datos del perfil a guardar
 */
export async function saveProfile(userId, { level, points, lifetimePoints, globalStreak, lastWeeklyProcessDate }) {
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    level: level ?? 0,
    points: points ?? 0,
    lifetime_points: lifetimePoints ?? 0,
    global_streak: globalStreak ?? 0,
    last_weekly_process_date: lastWeeklyProcessDate ?? null,
    updated_at: new Date().toISOString(),
  });
  if (error) console.error('[db] saveProfile:', error.message);
}

// ════════════════════════════════════════════════════════════════════════
// HÁBITOS
// ════════════════════════════════════════════════════════════════════════

/**
 * Guarda un solo hábito en la base de datos.
 * 
 * FUNCIONAMIENTO:
 * - Si el hábito ya tiene ID válido: hace upsert (actualiza o inserta)
 * - Si no tiene ID: inserta y retorna el hábito con el nuevo ID asignado por Supabase
 * 
 * @param {string} userId - ID del usuario
 * @param {Object} habit - Objeto hábito a guardar
 * @returns {Object|null} Hábito guardado con ID de Supabase, o null si falló
 */
export async function saveHabit(userId, habit) {
  if (!habit) return null;
  const hasValidId = Boolean(habit.id && habit.id !== SERVER_ID_PLACEHOLDER);
  if (hasValidId) {
    const { error } = await supabase.from('habits').upsert(habitToRow(userId, habit));
    if (error) console.error('[db] saveHabit:', error.message);
    return habit;
  }

  const { data, error } = await supabase
    .from('habits')
    .insert(habitToRow(userId, habit, false))
    .select('*');

  if (error) {
    console.error('[db] saveHabit:', error.message);
    return null;
  }

  const row = Array.isArray(data) ? data[0] : data;
  return row ? rowToHabit(row) : null;
}

/**
 * Guarda múltiples hábitos a la vez.
 * 
 * FUNCIONAMIENTO:
 * - Separa hábitos con ID de los sin ID
 * - Actualiza los que ya tienen ID mediante upsert
 * - Inserta los nuevos y obtiene sus IDs de Supabase
 * 
 * @param {string} userId - ID del usuario
 * @param {Array} habits - Array de hábitos
 * @returns {Array} Hábitos actualizados
 */
export async function saveHabits(userId, habits) {
  if (!habits.length) return [];
  const withId = habits.filter(h => h?.id && h.id !== SERVER_ID_PLACEHOLDER);
  const withoutId = habits.filter(h => !h?.id || h.id === SERVER_ID_PLACEHOLDER);
  const updated = [];

  if (withId.length) {
    const { error } = await supabase.from('habits').upsert(withId.map(h => habitToRow(userId, h)));
    if (error) console.error('[db] saveHabits:', error.message);
    updated.push(...withId);
  }

  if (withoutId.length) {
    const { data, error } = await supabase
      .from('habits')
      .insert(withoutId.map(h => habitToRow(userId, h, false)))
      .select('*');
    if (error) console.error('[db] saveHabits:', error.message);
    else updated.push(...(data ?? []).map(rowToHabit));
  }

  return updated;
}

/**
 * Elimina un hábito y todo su historial asociado.
 * 
 * NOTA: Se borra primero el historial manualmente porque
 * ON DELETE CASCADE no siempre está activo en Supabase.
 * 
 * @param {string} habitId - ID del hábito a eliminar
 */
export async function deleteHabit(habitId) {
  await supabase.from('habit_history').delete().eq('habit_id', habitId);
  const { error } = await supabase.from('habits').delete().eq('id', habitId);
  if (error) console.error('[db] deleteHabit:', error.message);
}

// ════════════════════════════════════════════════════════════════════════
// HISTORIAL DE HÁBITOS
// ════════════════════════════════════════════════════════════════════════

/**
 * Guarda una sola entrada de historial (completado/fallado) para un hábito.
 * Usa upsert para actualizar si ya existe registro para esa fecha.
 * 
 * @param {string} userId - ID del usuario
 * @param {string} habitId - ID del hábito
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @param {string} status - Estado: 'completed', 'failed', 'partial', 'over'
 */
export async function saveHabitEntry(userId, habitId, date, status) {
  const { error } = await supabase.from('habit_history').upsert(
    { user_id: userId, habit_id: habitId, date, status },
    { onConflict: 'user_id,habit_id,date' }
  );
  if (error) console.error('[db] saveHabitEntry:', error.message);
}

/**
 * Guarda múltiples entradas de historial a la vez (optimizado para operaciones batch).
 * Útil cuando se procesan muchos hábitos a la vez (ej: al migrar datos).
 * 
 * @param {string} userId - ID del usuario
 * @param {Array} entries - Array de objetos { habitId, date, status }
 */
export async function saveHabitEntries(userId, entries) {
  if (!entries.length) return;
  const rows = entries.map(e => ({
    user_id: userId,
    habit_id: e.habitId,
    date: e.date,
    status: e.status,
  }));
  const { error } = await supabase.from('habit_history').upsert(rows, { onConflict: 'user_id,habit_id,date' });
  if (error) console.error('[db] saveHabitEntries:', error.message);
}

// ════════════════════════════════════════════════════════════════════════
// INVENTARIO
// ════════════════════════════════════════════════════════════════════════

/**
 * Reemplaza TODO el inventario del usuario.
 * 
 * ESTRATEGIA: Delete + Insert en lugar de update.
 * Se usa esta estrategia porque el inventario es pequeño (< 20 items)
 * y es más simple que gestionar actualizaciones individuales.
 * 
 * @param {string} userId - ID del usuario
 * @param {Array} inventory - Array de objetos { itemId, qty }
 */
export async function saveInventory(userId, inventory) {
  // Borrar todo e insertar de nuevo (inventario suele ser pequeño, < 20 items)
  await supabase.from('user_inventory').delete().eq('user_id', userId);
  if (!inventory.length) return;
  const rows = inventory.map(i => ({
    user_id: userId,
    item_id: i.itemId,
    quantity: i.qty,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabase.from('user_inventory').insert(rows);
  if (error) console.error('[db] saveInventory:', error.message);
}

// ════════════════════════════════════════════════════════════════════════
// EFECTOS ACTIVOS
// ════════════════════════════════════════════════════════════════════════

/**
 * Guarda la lista de efectos activos del usuario.
 * Los efectos activos son modificadores temporales del juego.
 * 
 * ESTRUCTURA DEL EFECTO:
 * - key: Identificador del efecto (ej: 'streak_shield', 'double_points')
 * - value: Valor numérico del efecto
 * - expiresAt: Fecha de expiración (opcional, para efectos temporales)
 * - itemName: Nombre del objeto que creó el efecto
 * - targetHabitId: ID del hábito objetivo (para efectos dirigidos)
 * 
 * @param {string} userId - ID del usuario
 * @param {Array} effects - Array de efectos activos
 */
export async function saveActiveEffects(userId, effects) {
  await supabase.from('active_effects').delete().eq('user_id', userId);
  if (!effects.length) return;
  const rows = effects.map(e => ({
    user_id: userId,
    effect_key: e.key,
    value: e.value ?? null,
    expires_at: e.expiresAt ?? null,
    item_name: e.itemName ?? null,
    target_habit_id: e.targetHabitId ?? null,
  }));
  const { error } = await supabase.from('active_effects').insert(rows);
  if (error) console.error('[db] saveActiveEffects:', error.message);
}

// ════════════════════════════════════════════════════════════════════════
// LOGROS (ACHIEVEMENTS)
// ════════════════════════════════════════════════════════════════════════

/**
 * Inserta solo los logros nuevos (ignora duplicados).
 * 
 * FUNCIONAMIENTO:
 * Usa upsert con ignoreDuplicates para evitar errores cuando
 * un logro ya está registrado. Solo se insertan los que
 * realmente son nuevos.
 * 
 * @param {string} userId - ID del usuario
 * @param {Array} newIds - Array de IDs de logros a guardar
 */
export async function saveAchievements(userId, newIds) {
  if (!newIds.length) return;
  const rows = newIds.map(id => ({
    user_id: userId,
    achievement_id: id,
    unlocked_at: new Date().toISOString(),
  }));
  const { error } = await supabase.from('user_achievements').upsert(rows, { onConflict: 'user_id,achievement_id', ignoreDuplicates: true });
  if (error) console.error('[db] saveAchievements:', error.message);
}

// ════════════════════════════════════════════════════════════════════════
// RETO DIARIO (DAILY CHALLENGE)
// ════════════════════════════════════════════════════════════════════════

/**
 * Guarda el progreso del reto diario del usuario.
 * 
 * DATOS GUARDADOS:
 * - daily_id: Identificador del daily
 * - daily_data: Objeto con configuración del daily (serializado)
 * - progress_current: Progreso actual (ej: número de hábitos completados)
 * - progress_target: Meta de progreso
 * - completed: Si se ha completado el daily
 * 
 * NOTA: Se elimina la función 'condition' del objeto porque
 * no es serializable (no se puede convertir a JSON).
 * 
 * @param {string} userId - ID del usuario
 * @param {Object} currentDaily - Objeto del daily actual
 * @param {string} lastDailyDate - Fecha del daily
 */
export async function saveDaily(userId, currentDaily, lastDailyDate) {
  if (!currentDaily || !lastDailyDate) return;

  // Serializar: eliminar la función `condition` que no es serializable
  // eslint-disable-next-line no-unused-vars
  const { condition, check, ...serializableDaily } = currentDaily;

  const { error } = await supabase.from('user_daily_progress').upsert({
    user_id: userId,
    date: lastDailyDate,
    daily_id: currentDaily.id ?? 'unknown',
    daily_data: serializableDaily,
    daily_selection_made: true,
    completed: currentDaily.completed ?? false,
    progress_current: currentDaily.progress?.current ?? 0,
    progress_target: currentDaily.progress?.target ?? 1,
  }, { onConflict: 'user_id,date' });
  if (error) console.error('[db] saveDaily:', error.message);
}

/**
 * Verifica si existe una misión diaria para hoy y la retorna.
 * Si no existe, retorna null para indicar que se debe mostrar el modal de selección.
 * 
 * @param {string} userId - ID del usuario
 * @param {string} today - Fecha de hoy en formato 'YYYY-MM-DD'
 * @returns {Object|null} - Objeto con datos de la misión diaria o null
 */
export async function checkDailyForToday(userId, today) {
  const { data, error } = await supabase
    .from('user_daily_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  if (error) {
    console.error('[db] checkDailyForToday:', error.message);
    return null;
  }

  if (!data || !data.daily_selection_made || !data.daily_id) {
    // Existe registro pero no se ha hecho selección o no hay daily_id
    return null;
  }

  // Hay una misión seleccionada para hoy, reconstruir el objeto
  return {
    currentDaily: {
      ...(data.daily_data ?? {}),
      id: data.daily_id,
      progress: {
        current: data.progress_current,
        target: data.progress_target,
        completed: data.completed,
      },
      completed: data.completed,
    },
    dailySelectionMade: true,
    lastDailyDate: data.date,
  };
}

// ════════════════════════════════════════════════════════════════════════
// HISTORIAS DE VIAJE (STORIES)
// ════════════════════════════════════════════════════════════════════════

/**
 * Guarda una historia desbloqueada al completar un viaje.
 * Las historias son narrativas que se desbloquean al subir de nivel
 * o al obtener logros especiales.
 * 
 * TIPOS DE HISTORIAS:
 * - Journey stories: Se desbloquean al completar viajes (subir de nivel)
 * - Achievement stories: Se desbloquean al obtener logros épicos/legendarios
 * 
 * @param {string} userId - ID del usuario
 * @param {number} journeyId - Número del viaje completado (0 para logros)
 * @param {string} storyId - ID de la historia asignada
 */
export async function saveStory(userId, journeyId, storyId) {
  const { error } = await supabase.from('user_stories').upsert(
    {
      user_id: userId,
      journey_id: journeyId ?? 0,
      story_id: storyId,
      unlocked_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,story_id', ignoreDuplicates: true }
  );
  if (error) console.error('[db] saveStory:', error.message);
}

/**
 * Carga todas las historias desbloqueadas de un usuario.
 * Las devuelve ordenadas por journeyId ascendente.
 * 
 * @param {string} userId - ID del usuario
 * @returns {Array<{ journeyId: number, storyId: string, unlockedAt: string }>}
 */
export async function loadUserStories(userId) {
  const { data, error } = await supabase
    .from('user_stories')
    .select('journey_id, story_id, unlocked_at')
    .eq('user_id', userId)
    .order('journey_id', { ascending: true });

  if (error) {
    console.error('[db] loadUserStories:', error.message);
    return [];
  }

  return (data ?? []).map(row => ({
    journeyId: row.journey_id,
    storyId: row.story_id,
    unlockedAt: row.unlocked_at,
  }));
}

// ════════════════════════════════════════════════════════════════════════
// PLANES (PLANS)
// ════════════════════════════════════════════════════════════════════════

/**
 * Carga todos los planes del usuario.
 * Devuelve un objeto indexado por fecha: { 'YYYY-MM-DD': { id, date, name, tasks, tripleApplied } }
 * 
 * @param {string} userId - ID del usuario
 * @returns {Object} Planes indexados por fecha
 */
export async function loadUserPlans(userId) {
  const { data: plansData, error: plansError } = await supabase
    .from('user_plans')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (plansError) {
    console.error('[db] loadUserPlans:', plansError.message);
    return {};
  }

  if (!plansData || plansData.length === 0) {
    return {};
  }

  // Cargar tareas para cada plan
  const planIds = plansData.map(p => p.id);
  const { data: tasksData, error: tasksError } = await supabase
    .from('plan_tasks')
    .select('*')
    .in('plan_id', planIds)
    .order('created_at', { ascending: true });

  if (tasksError) {
    console.error('[db] loadUserPlans tasks:', tasksError.message);
  }

  const tasksByPlanId = {};
  if (tasksData) {
    for (const task of tasksData) {
      if (!tasksByPlanId[task.plan_id]) {
        tasksByPlanId[task.plan_id] = [];
      }
      tasksByPlanId[task.plan_id].push({
        id: task.id,
        name: task.name,
        durationMinutes: task.duration_minutes,
        completed: task.completed,
        completedAt: task.completed_at,
        deleted: task.deleted ?? false,
      });
    }
  }

  const plans = {};
  for (const plan of plansData) {
    plans[plan.date] = {
      id: plan.id,
      date: plan.date,
      name: plan.name,
      tripleApplied: plan.triple_bonus_applied ?? false,
      tasks: tasksByPlanId[plan.id] ?? [],
    };
  }

  return plans;
}

/**
 * Carga un plan específico para una fecha.
 * 
 * @param {string} userId - ID del usuario
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @returns {Object|null} Plan o null si no existe
 */
export async function loadPlanByDate(userId, date) {
  const { data, error } = await supabase
    .from('user_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No found
    console.error('[db] loadPlanByDate:', error.message);
    return null;
  }

  // Cargar tareas
  const { data: tasksData } = await supabase
    .from('plan_tasks')
    .select('*')
    .eq('plan_id', data.id)
    .order('created_at', { ascending: true });

  return {
    id: data.id,
    date: data.date,
    name: data.name,
    tripleApplied: data.triple_bonus_applied ?? false,
    tasks: (tasksData ?? []).map(task => ({
      id: task.id,
      name: task.name,
      durationMinutes: task.duration_minutes,
      completed: task.completed,
      completedAt: task.completed_at,
      deleted: task.deleted ?? false,
    })),
  };
}

/**
 * Guarda o actualiza un plan completo (plan + tareas).
 * 
 * @param {string} userId - ID del usuario
 * @param {Object} plan - Objeto plan con name, date, tasks
 * @param {string} existingPlanId - ID del plan existente si es update (opcional)
 * @returns {Object} Plan guardado con ID
 */
export async function savePlan(userId, plan, existingPlanId = null) {
  // 1. Crear o actualizar el plan
  const planData = {
    user_id: userId,
    date: plan.date,
    name: plan.name,
    triple_bonus_applied: plan.tripleApplied ?? false,
  };

  let planId = existingPlanId;

  if (existingPlanId) {
    const { error } = await supabase
      .from('user_plans')
      .update(planData)
      .eq('id', existingPlanId);
    if (error) console.error('[db] savePlan update:', error.message);
  } else {
    const { data, error } = await supabase
      .from('user_plans')
      .insert(planData)
      .select('id')
      .single();
    if (error) {
      console.error('[db] savePlan insert:', error.message);
      return null;
    }
    planId = data.id;
  }

  // 2. Si hay ID existente, eliminar tareas anteriores y recrear
  if (existingPlanId) {
    await supabase.from('plan_tasks').delete().eq('plan_id', existingPlanId);
  }

  // 3. Insertar tareas
  if (plan.tasks && plan.tasks.length > 0) {
    const taskRows = plan.tasks.map(task => ({
      plan_id: planId,
      name: task.name,
      duration_minutes: task.durationMinutes,
      completed: task.completed ?? false,
      completed_at: task.completedAt ?? null,
      deleted: task.deleted ?? false,
    }));

    const { error } = await supabase.from('plan_tasks').insert(taskRows);
    if (error) console.error('[db] savePlan tasks:', error.message);
  }

  return { id: planId, ...plan };
}

/**
 * Actualiza una tarea específica del plan.
 * 
 * @param {string} taskId - ID de la tarea
 * @param {Object} updates - Campos a actualizar
 */
export async function updatePlanTask(taskId, updates) {
  const updateData = {};
  if (updates.completed !== undefined) updateData.completed = updates.completed;
  if (updates.completedAt !== undefined) updateData.completed_at = updates.completedAt;
  if (updates.deleted !== undefined) updateData.deleted = updates.deleted;

  const { error } = await supabase
    .from('plan_tasks')
    .update(updateData)
    .eq('id', taskId);

  if (error) console.error('[db] updatePlanTask:', error.message);
}

/**
 * Marca el bonus triple como aplicado en un plan.
 * 
 * @param {string} planId - ID del plan
 */
export async function applyTripleBonus(planId) {
  const { error } = await supabase
    .from('user_plans')
    .update({ triple_bonus_applied: true })
    .eq('id', planId);

  if (error) console.error('[db] applyTripleBonus:', error.message);
}

/**
 * Elimina un plan y todas sus tareas.
 * 
 * @param {string} planId - ID del plan a eliminar
 */
export async function deletePlan(planId) {
  const { error } = await supabase
    .from('user_plans')
    .delete()
    .eq('id', planId);

  if (error) console.error('[db] deletePlan:', error.message);
}

// ── FIN DEL ARCHIVO ────────────────────────────────────────────────────────
