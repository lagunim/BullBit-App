/**
 * db.js — Capa de persistencia contra Supabase.
 *
 * Todas las funciones son fire-and-forget seguras: capturan errores
 * internamente para no interrumpir la UI en caso de fallo de red.
 * La fuente de verdad es Supabase. El estado local solo actúa como
 * memoria de UI y no persiste en localStorage.
 */

import { supabase } from './supabase.js';
import { attachThemeToHabit } from '../data/habitThemes.js';

const SERVER_ID_PLACEHOLDER = '00000000-0000-0000-0000-000000000000';

// ── HELPERS ────────────────────────────────────────────────────────────────

/** Convierte un hábito del store (camelCase) al formato de la tabla (snake_case). */
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

/** Convierte una fila de la tabla habits al formato del store. */
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

/** Convierte una fila de active_effects al formato del store. */
function rowToEffect(row) {
  return {
    key: row.effect_key,
    value: row.value !== null ? parseFloat(row.value) : undefined,
    expiresAt: row.expires_at ?? undefined,
    itemName: row.item_name ?? undefined,
    targetHabitId: row.target_habit_id ?? undefined,
  };
}

// ── CARGA INICIAL ──────────────────────────────────────────────────────────

/**
 * Carga todo el estado del usuario desde Supabase.
 * Devuelve null si no hay datos (usuario nuevo) o lanza un error en caso de fallo.
 */
export async function loadUserData(userId) {
  const [
    profileRes,
    habitsRes,
    historyRes,
    inventoryRes,
    effectsRes,
    achievementsRes,
    dailyRes,
    storiesRes,
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('habits').select('*').eq('user_id', userId),
    supabase.from('habit_history').select('*').eq('user_id', userId),
    supabase.from('user_inventory').select('*').eq('user_id', userId),
    supabase.from('active_effects').select('*').eq('user_id', userId),
    supabase.from('user_achievements').select('achievement_id, unlocked_at').eq('user_id', userId),
    supabase.from('user_daily_progress').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(1),
    supabase.from('user_stories').select('journey_id, story_id, unlocked_at').eq('user_id', userId).order('journey_id', { ascending: true }),
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

  // Daily challenge
  let currentDaily = null;
  let lastDailyDate = null;
  const dailyRow = dailyRes.data?.[0];
  if (dailyRow) {
    lastDailyDate = dailyRow.date;
    currentDaily = {
      ...(dailyRow.daily_data ?? {}),
      progress: {
        current: dailyRow.progress_current,
        target: dailyRow.progress_target,
        completed: dailyRow.completed,
      },
      completed: dailyRow.completed,
    };
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
    lastDailyDate,
  };
}

// ── PERFIL ─────────────────────────────────────────────────────────────────

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

// ── HÁBITOS ────────────────────────────────────────────────────────────────

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

export async function deleteHabit(habitId) {
  // Borrar el historial asociado primero (ON DELETE CASCADE no siempre está activo)
  await supabase.from('habit_history').delete().eq('habit_id', habitId);
  const { error } = await supabase.from('habits').delete().eq('id', habitId);
  if (error) console.error('[db] deleteHabit:', error.message);
}

// ── HISTORIAL ──────────────────────────────────────────────────────────────

export async function saveHabitEntry(userId, habitId, date, status) {
  const { error } = await supabase.from('habit_history').upsert(
    { user_id: userId, habit_id: habitId, date, status },
    { onConflict: 'user_id,habit_id,date' }
  );
  if (error) console.error('[db] saveHabitEntry:', error.message);
}

/**
 * Guarda múltiples entradas de historial a la vez.
 * entries = [{ habitId, date, status }]
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

// ── INVENTARIO ─────────────────────────────────────────────────────────────

/**
 * Reemplaza todo el inventario del usuario con el array actual del store.
 * inventory = [{ itemId, qty }]
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

// ── EFECTOS ACTIVOS ────────────────────────────────────────────────────────

/**
 * Guarda la lista de efectos activos del usuario.
 * effects = [{ key, value, expiresAt?, itemName?, targetHabitId? }]
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

// ── LOGROS ─────────────────────────────────────────────────────────────────

/**
 * Inserta solo los logros nuevos (ignora duplicados).
 * newIds = string[]
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

// ── RETO DIARIO ────────────────────────────────────────────────────────────

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
    completed: currentDaily.completed ?? false,
    progress_current: currentDaily.progress?.current ?? 0,
    progress_target: currentDaily.progress?.target ?? 1,
  }, { onConflict: 'user_id,date' });
  if (error) console.error('[db] saveDaily:', error.message);
}

// ── HISTORIAS DE VIAJE ─────────────────────────────────────────────────────

/**
 * Guarda una historia desbloqueada al completar un viaje.
 * @param {string} userId
 * @param {number} journeyId - Número del viaje completado
 * @param {string} storyId   - ID de la historia asignada
 * @param {number} [journeyId] - ID del viaje (0 o negativo para logros épicos/legendarios)
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

// ── FIN DEL ARCHIVO ────────────────────────────────────────────────────────
