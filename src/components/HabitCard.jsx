import { useState } from 'react';
import useGameStore from '../store/gameStore.js';
import { getTodayKey, calcPoints } from '../utils/gameLogic.js';
import { ITEMS } from '../data/items.js';

export default function HabitCard({ habit, onEdit }) {
  const history = useGameStore(s => s.history ?? {});
  const inventory = useGameStore(s => s.inventory ?? []);
  const completeHabit = useGameStore(s => s.completeHabit);
  const failHabit = useGameStore(s => s.failHabit);
  const removeHabit = useGameStore(s => s.removeHabit);
  const useItem = useGameStore(s => s.useItem);
  const rawEffects = useGameStore(s => s.activeEffects ?? []);

  const now = new Date();
  const activeEffects = rawEffects.filter(e => !e.expiresAt || new Date(e.expiresAt) > now);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const today = getTodayKey();
  const todayStatus = history[today]?.[habit.id];
  const isDone = todayStatus === 'completed';
  const isFailed = todayStatus === 'failed';
  const isDetermined = isDone || isFailed;

  // Multiplier color
  const multColorClass = habit.multiplier >= 3 ? 'text-quest-gold'
    : habit.multiplier >= 2  ? 'text-quest-cyan'
    : habit.multiplier >= 1.5 ? 'text-quest-green'
    : 'text-quest-text';

  const borderColorClass = isDone ? 'border-quest-green' : isFailed ? 'border-quest-red' : 'border-quest-border';
  const shadowColorClass = isDone ? 'shadow-[2px_2px_0_#004422]' : isFailed ? 'shadow-[2px_2px_0_#440011]' : 'shadow-pixel-sm';

  return (
    <div className={`anim-slide-in card-pixel flex items-center gap-3 !p-2 transition-all ${borderColorClass} ${shadowColorClass} ${isDetermined ? 'bg-quest-bg/60 opacity-80' : ''}`}>
      {/* Emoji */}
      <div className="text-2xl shrink-0 grayscale-[0.5] hover:grayscale-0 transition-all">{habit.emoji}</div>

      <div className="flex-1 min-w-0">
        <div className="text-[9px] text-quest-text mb-0.5 truncate uppercase tracking-tight">
          {habit.name}
        </div>
        <div className="flex gap-3 items-center">
            <span className={`text-[8px] font-pixel ${multColorClass}`}>×{(habit.multiplier ?? 1).toFixed(1)}</span>
            {habit.streak > 0 && <span className="text-[7px] text-quest-orange flex items-center gap-0.5 font-pixel">🔥{habit.streak}</span>}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {!isDetermined ? (
          <>
            <button onClick={() => completeHabit(habit.id)} className="btn-pixel-green !px-2.5 !py-1.5 !text-[8px]">
              ✔
            </button>
            <button onClick={() => failHabit(habit.id)} className="btn-pixel-red !px-2.5 !py-1.5 !text-[8px]">
              ✖
            </button>
          </>
        ) : (
          <div className={`px-2 py-1.5 text-[7px] font-pixel border shadow-pixel-sm ${isDone ? 'text-quest-green border-quest-green bg-[#003322]' : 'text-quest-red border-quest-red bg-[#330011]'}`}>
            {isDone ? '✔' : '✖'}
          </div>
        )}
        
        <button onClick={onEdit} className="btn-pixel-gray !p-1.5 !text-[7px]">
          ✎
        </button>

        <button onClick={() => setConfirmDelete(!confirmDelete)} className={`btn-pixel !p-1.5 !text-[7px] ${confirmDelete ? 'bg-quest-red border-quest-red text-white' : 'btn-pixel-gray'}`}>
          {confirmDelete ? '?' : '🗑'}
        </button>
        {confirmDelete && <button onClick={() => removeHabit(habit.id)} className="btn-pixel-red !p-1.5 !text-[7px] animate-pulse">SI</button>}
      </div>
    </div>
  );
}
