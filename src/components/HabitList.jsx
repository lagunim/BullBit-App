import { useState } from 'react';
import useGameStore from '../store/gameStore.js';
import HabitCard from './HabitCard.jsx';
import AddHabitModal from './AddHabitModal.jsx';
import EditHabitModal from './EditHabitModal.jsx';
import { getTodayKey } from '../utils/gameLogic.js';

export default function HabitList() {
  const habits = useGameStore(s => s.habits ?? []);
  const history = useGameStore(s => s.history ?? {});
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  const today = getTodayKey();
  const todayData = history[today] ?? {};
  const completedToday = habits.filter(h => todayData[h.id] === 'completed').length;
  const pendingToday = habits.filter(h => !todayData[h.id]).length;

  const dayNames = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
  const todayName = dayNames[new Date().getDay()];

  return (
    <div>
      {/* Today header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div>
          <div className="text-[7px] text-quest-textDim uppercase tracking-wide">HOY — {todayName} {today}</div>
          <div className="text-[10px] text-quest-text mt-1 font-pixel">
            {completedToday}/{habits.length} <span className="text-quest-green">COMPLETADOS</span>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-pixel-cyan text-white border-quest-cyan bg-quest-bg/20 hover:bg-quest-cyan px-4 py-2 text-[8px] font-pixel border-2 shadow-pixel active:translate-y-0.5 transition-all">
          ✚ NUEVO HÁBITO
        </button>
      </div>

      {/* Daily progress bar */}
      {habits.length > 0 && (
        <div className="progress-bar mb-4 !h-[12px]">
          <div className="progress-bar-fill" style={{
            width: `${Math.round((completedToday / habits.length) * 100)}%`,
            color: '#00e676',
          }} />
        </div>
      )}

      {/* Habits */}
      {habits.length === 0 ? (
        <div className="text-center py-10 px-5 border-2 border-dashed border-quest-border text-quest-borderLight font-pixel bg-quest-bg/10">
          <div className="text-3xl mb-4 grayscale opacity-40">🌱</div>
          <div className="text-[8px] leading-6">NO TIENES HÁBITOS AÚN</div>
          <div className="text-[7px] mt-2 opacity-60">CREA TU PRIMER HÁBITO PARA COMENZAR</div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {habits.map(habit => (
            <HabitCard 
              key={habit.id} 
              habit={habit} 
              onEdit={() => setEditingHabit(habit)}
            />
          ))}
        </div>
      )}

      {pendingToday > 0 && habits.length > 0 && (
        <div className="text-center text-[7px] text-quest-textDim mt-4 uppercase">
          <span className="animate-blink text-quest-cyan">▶</span> {pendingToday} HÁBITO{pendingToday !== 1 ? 'S' : ''} PENDIENTE{pendingToday !== 1 ? 'S' : ''}
        </div>
      )}

      {showModal && <AddHabitModal onClose={() => setShowModal(false)} />}
      
      {editingHabit && (
        <EditHabitModal 
          habit={editingHabit} 
          onClose={() => setEditingHabit(null)} 
        />
      )}
    </div>
  );
}
