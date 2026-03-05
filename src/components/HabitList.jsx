import { useState } from 'react';
import { createPortal } from 'react-dom';
import useGameStore from '../store/gameStore.js';
import HabitCard from './HabitCard.jsx';
import AddHabitModal from './AddHabitModal.jsx';
import EditHabitModal from './EditHabitModal.jsx';
import MultiplierIcons, { useHasActiveMultiplierEffect } from './MultiplierIcons.jsx';
import { getTodayKey, isHabitDueOnDate, getWeekCompletions } from '../utils/gameLogic.js';

export default function HabitList() {
  const habits = useGameStore(s => s.habits ?? []);
  const history = useGameStore(s => s.history ?? {});
  const removeHabit = useGameStore(s => s.removeHabit);
  const completeHabit = useGameStore(s => s.completeHabit);
  const completeHabitPartial = useGameStore(s => s.completeHabitPartial);
  const completeHabitOvertime = useGameStore(s => s.completeHabitOvertime);
  
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const [customError, setCustomError] = useState('');

  const today = getTodayKey();
  const todayData = history[today] ?? {};
  const isCompletedStatus = (status) =>
    status === 'completed' || status === 'partial' || status === 'over';

  // Filtrar solo hábitos que corresponden al día actual
  const todayHabits = habits.filter(habit => isHabitDueOnDate(habit, today));

  const isWeeklyTargetMet = (habit) => {
    if (habit.periodicity === 'weekly_times' && habit.weeklyTimesTarget) {
      const completions = getWeekCompletions(habit.id, history, today);
      return completions >= habit.weeklyTimesTarget;
    }
    return false;
  };
  
  const completedToday = todayHabits.filter(h => isCompletedStatus(todayData[h.id]) || isWeeklyTargetMet(h)).length;
  const pendingToday = todayHabits.filter(h => !todayData[h.id] && !isWeeklyTargetMet(h)).length;

  const dayNames = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
  const todayName = dayNames[new Date().getDay()];

  function closeSelected() {
    setSelectedHabit(null);
    setDeleteConfirm(false);
    setCustomMinutes('');
    setCustomError('');
  }

  function handleComplete() {
    if (!selectedHabit) return;
    const trimmed = String(customMinutes).trim();
    if (!trimmed) {
      completeHabit(selectedHabit.id);
      closeSelected();
      return;
    }
    const minutes = Number(trimmed);
    if (!Number.isFinite(minutes) || minutes <= 0) {
      setCustomError('Introduce un número válido.');
      return;
    }
    if (minutes < selectedHabit.minutes) {
      completeHabitPartial(selectedHabit.id, minutes);
    } else {
      completeHabitOvertime(selectedHabit.id, minutes);
    }
    closeSelected();
  }

  const hasActiveEffect = useHasActiveMultiplierEffect();

  function getMultColor(mult) {
    return hasActiveEffect
      ? 'text-yellow-400'
      : mult >= 3 ? 'text-quest-gold'
      : mult >= 2  ? 'text-quest-cyan'
      : mult >= 1.5 ? 'text-quest-green'
      : 'text-quest-text';
  }

  return (
    <div>
      {/* Today header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div>
          <div className="text-[7px] text-quest-textDim uppercase tracking-wide">HOY — {todayName} {today}</div>
          <div className="text-[10px] text-quest-text mt-1 font-pixel">
            {completedToday}/{todayHabits.length} <span className="text-quest-green">COMPLETADOS</span>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-pixel-cyan text-white border-quest-cyan bg-quest-bg/20 hover:bg-quest-cyan px-4 py-3 sm:py-2 text-[10px] sm:text-[8px] font-pixel border-2 shadow-pixel active:translate-y-0.5 transition-all">
          ✚ NUEVO HÁBITO
        </button>
      </div>

      {/* Daily progress bar */}
      {todayHabits.length > 0 && (
        <div className="progress-bar mb-4 !h-[12px]">
          <div className="progress-bar-fill" style={{
            width: `${Math.round((completedToday / todayHabits.length) * 100)}%`,
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
      ) : todayHabits.length === 0 ? (
        <div className="text-center py-10 px-5 border-2 border-dashed border-quest-border text-quest-borderLight font-pixel bg-quest-bg/10">
          <div className="text-3xl mb-4 grayscale opacity-40">📅</div>
          <div className="text-[8px] leading-6">NO HAY HÁBITOS PROGRAMADOS PARA HOY</div>
          <div className="text-[7px] mt-2 opacity-60">¡DESCANSA O CREA UN HÁBITO DIARIO!</div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {[
            // Primero los pendientes de hoy (incluye weekly_times sin objetivo cumplido)
            ...todayHabits.filter(h => !todayData[h.id] && !isWeeklyTargetMet(h)),
            // Después los que ya tienen estado hoy (completados / parciales / extra / fallados / weekly target met)
            ...todayHabits.filter(h => todayData[h.id] || isWeeklyTargetMet(h)),
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

      {pendingToday > 0 && todayHabits.length > 0 && (
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
              closeSelected();
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
                onClick={closeSelected}
                className="btn-pixel-gray !py-2 !px-3 !text-[10px]"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-y-2 text-[7px] font-pixel uppercase tracking-tighter">
              <div className="text-quest-textDim">Duración:</div>
              <div className="text-quest-green text-right">{selectedHabit.minutes} min</div>
              <div className="text-quest-textDim">Multiplicador actual:</div>
              <div className="text-right flex items-center justify-end gap-1">
                <MultiplierIcons />
                <span className={getMultColor(selectedHabit.multiplier)}>×{(selectedHabit.multiplier ?? 1).toFixed(1)}</span>
              </div>
              {selectedHabit.streak > 0 && (
                <>
                  <div className="text-quest-textDim">Racha:</div>
                  <div className="text-quest-orange text-right">🔥 {selectedHabit.streak}</div>
                </>
              )}
              {selectedHabit.periodicity === 'weekly_times' && selectedHabit.weeklyTimesTarget && (
                <>
                  <div className="text-quest-textDim">Esta semana:</div>
                  <div className="text-right text-quest-cyan">
                    {getWeekCompletions(selectedHabit.id, history, today)}/{selectedHabit.weeklyTimesTarget}
                  </div>
                </>
              )}
            </div>

            {/* Sección completar hábito - si no está completado hoy y objetivo semanal no alcanzado */}
            {(() => {
              const weeklyTargetMet = isWeeklyTargetMet(selectedHabit);
              if (weeklyTargetMet) {
                return (
                  <div className="mt-2 text-center px-3 py-3 border border-quest-green bg-[#003322] text-quest-green text-[9px] font-pixel">
                    ✔ Objetivo semanal cumplido
                  </div>
                );
              }
              if (!todayData[selectedHabit.id]) {
                return (
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={480}
                        placeholder={String(selectedHabit.minutes)}
                        className="input-pixel !w-20 text-center text-[9px]"
                        value={customMinutes}
                        onChange={(e) => {
                          setCustomMinutes(e.target.value);
                          setCustomError('');
                        }}
                      />
                      <span className="text-[7px] text-quest-textMuted font-pixel">min (opcional)</span>
                    </div>
                    {customError && (
                      <div className="text-quest-red text-[7px] font-pixel bg-quest-red/10 px-2 py-1 border border-quest-red">
                        {customError}
                      </div>
                    )}
                    <button
                      onClick={handleComplete}
                      className="btn-pixel-green w-full text-[9px] py-3 font-bold"
                    >
                      ✔ Completar
                    </button>
                  </div>
                );
              }
              return (
                <div className="mt-2 text-center px-3 py-3 border border-quest-green bg-[#003322] text-quest-green text-[9px] font-pixel">
                  ✔ Hábito completado hoy
                </div>
              );
            })()}

            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={() => {
                  setEditingHabit(selectedHabit);
                  closeSelected();
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
                      closeSelected();
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
