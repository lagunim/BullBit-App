import { useState } from 'react';
import { createPortal } from 'react-dom';
import useGameStore from '../store/gameStore.js';
import HabitCard from './HabitCard.jsx';
import AddHabitModal from './AddHabitModal.jsx';
import EditHabitModal from './EditHabitModal.jsx';
import { getTodayKey } from '../utils/gameLogic.js';

export default function HabitList() {
  const habits = useGameStore(s => s.habits ?? []);
  const history = useGameStore(s => s.history ?? {});
  const removeHabit = useGameStore(s => s.removeHabit);
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const today = getTodayKey();
  const todayData = history[today] ?? {};
  const isCompletedStatus = (status) =>
    status === 'completed' || status === 'partial' || status === 'over';

  const completedToday = habits.filter(h => isCompletedStatus(todayData[h.id])).length;
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
        <button onClick={() => setShowModal(true)} className="btn-pixel-cyan text-white border-quest-cyan bg-quest-bg/20 hover:bg-quest-cyan px-4 py-3 sm:py-2 text-[10px] sm:text-[8px] font-pixel border-2 shadow-pixel active:translate-y-0.5 transition-all">
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
          {[
            // Primero los pendientes de hoy
            ...habits.filter(h => !todayData[h.id]),
            // Después los que ya tienen estado hoy (completados / parciales / extra / fallados)
            ...habits.filter(h => todayData[h.id]),
          ].map(habit => (
            <HabitCard 
              key={habit.id} 
              habit={habit} 
              onEdit={() => {
                setSelectedHabit(habit);
                setDeleteConfirm(false);
              }}
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

      {selectedHabit && createPortal(
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[11000] p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedHabit(null);
              setDeleteConfirm(false);
            }
          }}
        >
          <div className="anim-fade-in card-pixel w-full max-w-[420px] !p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-quest-border pb-2">
              <div className="text-[10px] text-quest-cyan font-pixel uppercase tracking-widest flex items-center gap-2">
                <span>{selectedHabit.emoji}</span>
                <span className="truncate">{selectedHabit.name}</span>
              </div>
              <button
                onClick={() => {
                  setSelectedHabit(null);
                  setDeleteConfirm(false);
                }}
                className="btn-pixel-gray !py-2 !px-3 !text-[10px]"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-y-2 text-[7px] font-pixel uppercase tracking-tighter">
              <div className="text-quest-textDim">Duración:</div>
              <div className="text-quest-green text-right">{selectedHabit.minutes} min</div>
              <div className="text-quest-textDim">Multiplicador actual:</div>
              <div className="text-quest-gold text-right">×{(selectedHabit.multiplier ?? 1).toFixed(1)}</div>
              {selectedHabit.streak > 0 && (
                <>
                  <div className="text-quest-textDim">Racha:</div>
                  <div className="text-quest-orange text-right">🔥 {selectedHabit.streak}</div>
                </>
              )}
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={() => {
                  setEditingHabit(selectedHabit);
                  setSelectedHabit(null);
                  setDeleteConfirm(false);
                }}
                className="btn-pixel-gold w-full text-[9px] py-3"
              >
                ✎ Editar hábito
              </button>
              <button
                onClick={() => setDeleteConfirm(true)}
                className="btn-pixel-red w-full text-[9px] py-3"
              >
                🗑 Borrar hábito
              </button>
            </div>

            {deleteConfirm && (
              <div className="mt-2 p-2 border border-quest-red bg-quest-red/10 text-[8px] font-pixel">
                <div className="mb-2">
                  ¿Seguro que quieres borrar este hábito? Esta acción no se puede deshacer.
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="btn-pixel-gray flex-1 text-[9px]"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      removeHabit(selectedHabit.id);
                      setSelectedHabit(null);
                      setDeleteConfirm(false);
                    }}
                    className="btn-pixel-red flex-1 text-[9px]"
                  >
                    Sí, borrar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {editingHabit && (
        <EditHabitModal 
          habit={editingHabit} 
          onClose={() => setEditingHabit(null)} 
        />
      )}
    </div>
  );
}
