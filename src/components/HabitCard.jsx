import useGameStore from '../store/gameStore.js';
import { getTodayKey, isHabitExpired } from '../utils/gameLogic.js';

export default function HabitCard({ habit, onEdit }) {
  const history = useGameStore(s => s.history ?? {});

  const today = getTodayKey();
  const todayStatus = history[today]?.[habit.id];
  const isDone = todayStatus === 'completed' || todayStatus === 'partial' || todayStatus === 'over';
  const isFailed = todayStatus === 'failed';
  const isDetermined = isDone || isFailed;
  const isExpired = isHabitExpired(habit, today, history);

  const multColorClass = habit.multiplier >= 3 ? 'text-quest-gold'
    : habit.multiplier >= 2  ? 'text-quest-cyan'
    : habit.multiplier >= 1.5 ? 'text-quest-green'
    : 'text-quest-text';

  const borderColorClass = isDone ? 'border-quest-green' 
    : isFailed ? 'border-quest-red' 
    : isExpired ? 'border-orange-500' 
    : 'border-quest-border';
  
  const shadowColorClass = isDone ? 'shadow-[2px_2px_0_#004422]' 
    : isFailed ? 'shadow-[2px_2px_0_#440011]' 
    : isExpired ? 'shadow-[2px_2px_0_#ff8800]' 
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
          <div className="text-[10px] text-quest-text truncate uppercase tracking-tight">
            {habit.name}
          </div>
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
          <span className={`text-[10px] font-pixel ${multColorClass}`}>
            ×{(habit.multiplier ?? 1).toFixed(1)}
          </span>
        </div>
      </div>

      <div className="mt-1 w-full">
        {isDetermined ? (
          <div className="w-full flex justify-center">
            <div
              className={`px-3 py-2 text-[8px] font-pixel border shadow-pixel-sm ${
                isDone
                  ? 'text-quest-green border-quest-green bg-[#003322]'
                  : 'text-quest-red border-quest-red bg-[#330011]'
              }`}
            >
              {isDone ? '✔ Hábito resuelto' : '✖ Hábito fallado'}
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className={`px-3 py-2 text-[8px] font-pixel border ${
              isExpired 
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
