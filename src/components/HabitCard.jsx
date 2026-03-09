/**
 * HabitCard - Tarjeta individual que representa un hábito en la lista
 * 
 * Muestra la información de un hábito específico incluyendo:
 * - Nombre y emoji del hábito
 * - Multiplicador actual y efectos activos
 * - Estado de completado/fallado/expirado
 * - Progreso semanal para hábitos de tipo "weekly_times"
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.habit - Objeto con los datos del hábito
 * @param {Function} props.onEdit - Función llamada al hacer click en la tarjeta
 * @returns {JSX.Element} Tarjeta visual del hábito
 */
import useGameStore from '../store/gameStore.js';
import { getTodayKey, isHabitExpired, getWeekCompletions, PERIODICITY_LABELS } from '../utils/gameLogic.js';
import MultiplierIcons, { useHasActiveMultiplierEffect, HabitTargetedIcons } from './MultiplierIcons.jsx';

function parseCustomDays(customDays) {
  if (Array.isArray(customDays)) {
    return customDays
      .map(day => Number(day))
      .filter(day => Number.isInteger(day) && day >= 1 && day <= 7);
  }

  if (typeof customDays === 'string' && customDays.trim()) {
    return customDays
      .split(',')
      .map(day => Number(day.trim()))
      .filter(day => Number.isInteger(day) && day >= 1 && day <= 7);
  }

  return [];
}

function getPeriodicityLabel(habit) {
  if (habit.weeklyTimesTarget) {
    return `${habit.weeklyTimesTarget} veces/semana`;
  }
  if (habit.periodicity === 'custom') {
    const customDays = parseCustomDays(habit.customDays);
    if (customDays.length) {
      const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      return customDays.map(day => dayNames[day - 1]).join(', ');
    }
    if (habit.customInterval) {
      return `Cada ${habit.customInterval} días`;
    }
    return null;
  }
  return PERIODICITY_LABELS[habit.periodicity] || null;
}

export default function HabitCard({ habit, onEdit, isAvailableToday = true }) {
  const history = useGameStore(s => s.history ?? {});
  const hasActiveEffect = useHasActiveMultiplierEffect();

  const today = getTodayKey();
  // Obtiene el estado del hábito para el día de hoy desde el historial
  const todayStatus = history[today]?.[habit.id];
  // Determina si el hábito está marcado como hecho (completo, parcial o extra)
  const isDone = todayStatus === 'completed' || todayStatus === 'partial' || todayStatus === 'over';
  // Determina si el hábito está fallado
  const isFailed = todayStatus === 'failed';
  // El hábito está "determinado" si tiene cualquier estado (hecho o fallado)
  const isDetermined = isDone || isFailed;
  // Verifica si el hábito ha expirado (pasó la hora límite)
  const isExpired = isAvailableToday && isHabitExpired(habit, today, history);

  // Verifica si es un hábito de tipo "veces por semana"
  const isWeeklyTimes = Boolean(habit.weeklyTimesTarget);
  // Obtiene las completaciones de la semana actual
  const weeklyCompletions = isWeeklyTimes ? getWeekCompletions(habit.id, history, today) : 0;
  // Determina si se alcanzó el objetivo semanal
  const weeklyTargetMet = isWeeklyTimes && weeklyCompletions >= habit.weeklyTimesTarget;
  const isWeeklyDone = isWeeklyTimes && weeklyTargetMet;

  const multColorClass = !isAvailableToday
    ? 'text-quest-textMuted'
    : hasActiveEffect
    ? 'text-yellow-400'
    : habit.multiplier >= 3 ? 'text-quest-gold'
      : habit.multiplier >= 2 ? 'text-quest-cyan'
        : habit.multiplier >= 1.5 ? 'text-quest-green'
          : 'text-quest-text';

  // Selecciona el color del borde según el estado del hábito
  const borderColorClass = isDone ? 'border-quest-green'
    : isFailed ? 'border-quest-red'
      : isExpired ? 'border-orange-500'
        : !isAvailableToday ? 'border-slate-500/70'
        : 'border-quest-border';

  // Selecciona el color de la sombra según el estado
  const shadowColorClass = isDone ? 'shadow-[2px_2px_0_#004422]'
    : isFailed ? 'shadow-[2px_2px_0_#440011]'
      : isExpired ? 'shadow-[2px_2px_0_#ff8800]'
        : !isAvailableToday ? 'shadow-[2px_2px_0_#334155]'
        : 'shadow-pixel-sm';

  return (
    <div
      className={`anim-slide-in card-pixel flex flex-col gap-2 !p-4 sm:!p-3 transition-all ${borderColorClass} ${shadowColorClass} ${isDetermined ? 'bg-quest-bg/60 opacity-80' : ''} ${isExpired ? 'animate-pulse' : ''}`}
      onClick={onEdit}
    >
      <div className="flex items-center gap-2 w-full">
        <div className="text-2xl shrink-0 grayscale-[0.5] hover:grayscale-0 transition-all">
          {habit.emoji}
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <div className={`text-[10px] truncate uppercase tracking-tight ${isAvailableToday ? 'text-quest-text' : 'text-quest-textMuted'}`}>
            {habit.name}
          </div>
          {getPeriodicityLabel(habit) && (
            <span className={`text-[8px] shrink-0 ${isAvailableToday ? 'text-quest-cyan/70' : 'text-quest-textMuted/80'}`}>
              · {getPeriodicityLabel(habit)}
            </span>
          )}
          {habit.streak > 0 && (
            <span className="text-[9px] text-quest-orange flex items-center gap-0.5 font-pixel shrink-0">
              🔥{habit.streak}
            </span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-1 shrink-0">
          {isExpired && !isDetermined && (
            <span className="text-[9px] text-orange-500" title="Hábito expirado">
              ⚠️
            </span>
          )}
          <MultiplierIcons />
          <HabitTargetedIcons habitId={habit.id} />
          <span className={`text-[10px] font-pixel ${multColorClass}`}>
            ×{(habit.multiplier ?? 1).toFixed(1)}
          </span>
        </div>
      </div>

      <div className="mt-1 w-full">
        {isWeeklyTimes ? (
          <div className="w-full flex justify-center">
            {weeklyTargetMet ? (
              <div className="px-3 py-2 text-[8px] font-pixel border text-quest-green border-quest-green bg-[#003322] shadow-pixel-sm">
                ✔ Objetivo semanal cumplido
              </div>
            ) : (
              <div className="px-3 py-2 text-[8px] font-pixel border text-quest-cyan border-quest-cyan/50 bg-quest-cyan/10">
                {weeklyCompletions}/{habit.weeklyTimesTarget} ESTA SEMANA
              </div>
            )}
          </div>
        ) : !isAvailableToday && !isDetermined ? (
          <div className="w-full flex justify-center">
            <div className="px-3 py-2 text-[8px] font-pixel border border-slate-500/60 text-slate-300 bg-slate-700/20">
              No disponible hoy
            </div>
          </div>
        ) : isDetermined ? (
          <div className="w-full flex justify-center">
            <div
              className={`px-3 py-2 text-[8px] font-pixel border shadow-pixel-sm ${isDone
                ? 'text-quest-green border-quest-green bg-[#003322]'
                : 'text-quest-red border-quest-red bg-[#330011]'
                }`}
            >
              {isDone ? '✔ Hábito resuelto' : '✖ Hábito fallado'}
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className={`px-3 py-2 text-[8px] font-pixel border ${isExpired
              ? 'text-orange-500 border-orange-500/50 bg-orange-500/10'
              : 'text-quest-textMuted border-quest-border/50'
              }`}>
              {isExpired ? '⚠️ Hábito expirado' : 'Toca para abrir opciones'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
