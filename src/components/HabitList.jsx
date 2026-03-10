/**
 * HabitList - Componente principal que gestiona la lista de hábitos del día
 * 
 * Este componente es el núcleo de la vista de hábitos. Se encarga de:
 * - Mostrar los hábitos programados para el día actual
 * - Permitir crear nuevos hábitos mediante AddHabitModal
 * - Permitir editar/borrar hábitos existentes
 * - Completar hábitos de forma parcial o total
 * - Mostrar el progreso diario con una barra de progreso
 * 
 * @component
 * @returns {JSX.Element} Lista de hábitos diarios con opciones de gestión
 */
import { useState } from 'react';
import { createPortal } from 'react-dom';
import useGameStore from '../store/gameStore.js';
import HabitCard from './HabitCard.jsx';
import AddHabitModal from './AddHabitModal.jsx';
import EditHabitModal from './EditHabitModal.jsx';
import MultiplierIcons, { useHasActiveMultiplierEffect, HabitTargetedIcons } from './MultiplierIcons.jsx';
import CreatePlanModal from './CreatePlanModal.jsx';
import { ITEMS } from '../data/items.js';
import { getTodayKey, isHabitDueOnDate, getWeekCompletions, getProgressColor, PERIODICITY_LABELS } from '../utils/gameLogic.js';

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
    return 'Sin configurar';
  }
  return PERIODICITY_LABELS[habit.periodicity] || null;
}

export default function HabitList() {
  const habits = useGameStore(s => s.habits ?? []);
  const history = useGameStore(s => s.history ?? {});
  const activeEffects = useGameStore(s => s.activeEffects ?? []);
  const removeHabit = useGameStore(s => s.removeHabit);
  const completeHabit = useGameStore(s => s.completeHabit);
  const completeHabitPartial = useGameStore(s => s.completeHabitPartial);
  const completeHabitOvertime = useGameStore(s => s.completeHabitOvertime);

  const [showModal, setShowModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const [customError, setCustomError] = useState('');

  const today = getTodayKey();
  // Obtiene los datos del historial para el día de hoy
  const todayData = history[today] ?? {};
  // Función auxiliar para verificar si un estado representa completado
  const isCompletedStatus = (status) =>
    status === 'completed' || status === 'partial' || status === 'over';

  // Hábitos disponibles hoy según periodicidad
  const todayHabits = habits.filter(habit => isHabitDueOnDate(habit, today, history));
  // Hábitos de días concretos de semana que NO tocan hoy, pero se muestran en gris al final
  const notAvailableTodayHabits = habits.filter((habit) => {
    const hasCustomDays = habit.periodicity === 'custom' && parseCustomDays(habit.customDays).length > 0;
    return hasCustomDays && !isHabitDueOnDate(habit, today, history);
  });

  // Calcula si se ha alcanzado el objetivo semanal para hábitos de tipo "weekly_times"
  const isWeeklyTargetMet = (habit) => {
    if (habit.weeklyTimesTarget) {
      const completions = getWeekCompletions(habit.id, history, today);
      return completions >= habit.weeklyTimesTarget;
    }
    return false;
  };

  // Cuenta hábitos completados y pendientes para el día de hoy
  const completedToday = todayHabits.filter(h => isCompletedStatus(todayData[h.id]) || isWeeklyTargetMet(h)).length;
  const pendingToday = todayHabits.filter(h => !todayData[h.id] && !isWeeklyTargetMet(h)).length;
  const hasAnyVisibleHabits = todayHabits.length > 0 || notAvailableTodayHabits.length > 0;

  const dayNames = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
  const todayName = dayNames[new Date().getDay()];

  function closeSelected() {
    setSelectedHabit(null);
    setDeleteConfirm(false);
    setCustomMinutes('');
    setCustomError('');
  }

const isSelectedHabitAvailableToday = selectedHabit
    ? isHabitDueOnDate(selectedHabit, today, history)
    : false;

  const hasActiveEffect = useHasActiveMultiplierEffect();

  function getMultColor(mult) {
    return hasActiveEffect
      ? 'text-yellow-400'
      : mult >= 3 ? 'text-quest-gold'
        : mult >= 2 ? 'text-quest-cyan'
          : mult >= 1.5 ? 'text-quest-green'
            : 'text-quest-text';
  }

  const habitEffects = activeEffects.filter(e => 
    !e.targetHabitId || e.targetHabitId === selectedHabit?.id
  );

  return (
    <div>
      {/* New buttons row */}
      <div className="flex justify-center gap-2 mt-2 mb-5">
        <button onClick={() => setShowModal(true)} className="btn-pixel-cyan text-white border-quest-cyan bg-quest-bg/20 hover:bg-quest-cyan px-4 py-3 sm:py-2 text-xs sm:text-[8px] font-pixel border-2 shadow-pixel active:translate-y-0.5 transition-all">
          ✚ HÁBITO
        </button>
        <button onClick={() => setShowPlanModal(true)} className="btn-pixel-gold text-white border-quest-gold bg-quest-bg/20 hover:bg-quest-gold px-4 py-3 sm:py-2 text-xs sm:text-[8px] font-pixel border-2 shadow-pixel active:translate-y-0.5 transition-all">
          📋 PLAN
        </button>
      </div>
      {/* Today header */}
      <div className="mb-4">
        <h2 className="text-[10px] sm:text-xs font-pixel text-quest-cyan uppercase tracking-wider mb-2">📋 Hábitos de Hoy</h2>

        <div className="flex justify-between items-center flex-wrap gap-2">
          <div>
            <div className="text-xs text-quest-textDim uppercase tracking-wide">HOY — {todayName} {today}</div>
            <div className="text-xs text-quest-text mt-1 font-pixel">
              {completedToday}/{todayHabits.length} <span className="text-quest-green">COMPLETADOS</span>
            </div>
          </div>

        </div>
      </div>

      {/* Daily progress bar */}
      {todayHabits.length > 0 && (
        <div className="progress-bar mb-4 !h-xs">
          <div className="progress-bar-fill" style={{
            width: `${Math.round((completedToday / todayHabits.length) * 100)}%`,
            color: getProgressColor(Math.round((completedToday / todayHabits.length) * 100)),
          }} />
        </div>
      )}

      {/* Pending habits */}
      {pendingToday > 0 && todayHabits.length > 0 && (
        <div className="text-center text-xs text-quest-textDim mt-4 uppercase mb-2">
          <span className="animate-blink text-quest-cyan">▶</span> {pendingToday} HÁBITO{pendingToday !== 1 ? 'S' : ''} PENDIENTE{pendingToday !== 1 ? 'S' : ''}
        </div>
      )}

      {/* Habits */}
      {habits.length === 0 ? (
        <div className="text-center py-10 px-5 border-2 border-dashed border-quest-border text-quest-borderLight font-pixel bg-quest-bg/10">
          <div className="text-3xl mb-4 grayscale opacity-40">🌱</div>
          <div className="text-[8px] leading-6">NO TIENES HÁBITOS AÚN</div>
          <div className="text-xs mt-2 opacity-60">CREA TU PRIMER HÁBITO PARA COMENZAR</div>
        </div>
      ) : !hasAnyVisibleHabits ? (
        <div className="text-center py-10 px-5 border-2 border-dashed border-quest-border text-quest-borderLight font-pixel bg-quest-bg/10">
          <div className="text-3xl mb-4 grayscale opacity-40">📅</div>
          <div className="text-[8px] leading-6">NO HAY HÁBITOS PROGRAMADOS PARA HOY</div>
          <div className="text-xs mt-2 opacity-60">¡DESCANSA O CREA UN HÁBITO DIARIO!</div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {[
            // Primero los pendientes de hoy (incluye weekly_times sin objetivo cumplido)
            ...todayHabits.filter(h => !todayData[h.id] && !isWeeklyTargetMet(h)),
            // Después los que ya tienen estado hoy (completados / parciales / extra / fallados / weekly target met)
            ...todayHabits.filter(h => todayData[h.id] || isWeeklyTargetMet(h)),
            // Al final, hábitos visibles pero no disponibles hoy (solo customDays)
            ...notAvailableTodayHabits,
          ].map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              isAvailableToday={isHabitDueOnDate(habit, today, history)}
              onEdit={() => {
                setSelectedHabit(habit);
                setDeleteConfirm(false);
              }}
            />
          ))}
        </div>
      )}



      {showModal && <AddHabitModal onClose={() => setShowModal(false)} />}

      {showPlanModal && <CreatePlanModal onClose={() => setShowPlanModal(false)} />}

      {selectedHabit && createPortal(
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[11000] p-4 backdrop-blur-sm shadow-[inset_0_0_80px_rgba(0,0,0,0.8)]"
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeSelected();
            }
          }}
        >
          <div className="anim-fade-in card-pixel w-full max-w-[420px] !p-5 flex flex-col gap-5">
            <div className="flex justify-between items-center border-b border-quest-border pb-2">
              <div className="flex flex-col gap-1">
                <div className="text-sm text-quest-cyan font-pixel uppercase flex items-center gap-2">
                  <span>{selectedHabit.emoji}</span>
                  <span className="truncate">{selectedHabit.name}</span>
                </div>
              </div>
              <button
                onClick={closeSelected}
                className="btn-pixel-gray !py-2 !px-3 !text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {getPeriodicityLabel(selectedHabit) && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-quest-textDim uppercase">Periodicidad</span>
                  <span className="text-sm font-bold text-quest-cyan">{getPeriodicityLabel(selectedHabit)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-quest-textDim uppercase">Duración</span>
                <span className="text-sm font-bold text-quest-green">{selectedHabit.minutes} min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-quest-textDim uppercase ">Multiplicador actual</span>
                <div className="flex items-center gap-2">
                  <MultiplierIcons />
                  <HabitTargetedIcons habitId={selectedHabit.id} />
                  <span className={`text-sm font-bold ${getMultColor(selectedHabit.multiplier)}`}>
                    ×{(selectedHabit.multiplier ?? 1).toFixed(1)}
                  </span>
                </div>
              </div>
              {selectedHabit.streak > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-quest-textDim uppercase ">Racha</span>
                  <span className="text-base font-bold text-quest-orange">🔥 {selectedHabit.streak}</span>
                </div>
              )}
              {selectedHabit.weeklyTimesTarget && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-quest-textDim uppercase ">Esta semana</span>
                  <span className="text-base font-bold text-quest-cyan">
                    {getWeekCompletions(selectedHabit.id, history, today)}/{selectedHabit.weeklyTimesTarget}
                  </span>
                </div>
              )}

              {/* Sección de Efectos Activos */}
              {habitEffects.length > 0 && (
                <div className="mt-4 pt-3 border-t border-quest-border/30 space-y-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] text-quest-textDim uppercase font-black tracking-wider">
                      Efectos Activos
                    </span>
                    <div className="h-[1px] flex-1 bg-quest-border/20" />
                  </div>
                  
                  <div className="grid gap-2">
                    {habitEffects.map((effect, idx) => {
                      // Buscar el item original para obtener metadatos (icono, desc, rareza)
                      const item = Object.values(ITEMS).find(i => 
                        i.effectKey === effect.key || 
                        i.name === effect.itemName ||
                        (i.effectKey + '_target') === effect.key ||
                        (i.effectKey === 'phoenix_restore' && effect.key === 'phoenix_bonus')
                      );

                      return (
                        <div key={idx} className="bg-black/40 border border-white/5 p-2 rounded flex gap-3 items-start group hover:border-quest-gold/30 transition-colors">
                          <span className="text-xl drop-shadow-pixel">{item?.icon || '✨'}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="text-[11px] font-bold text-quest-gold truncate">
                                {item?.name || effect.itemName || 'Efecto Mágico'}
                              </span>
                              <div className="flex gap-1.5 items-center">
                                {effect.usesRemaining !== undefined && (
                                  <span className="text-[9px] px-1 bg-quest-blue/20 text-quest-blue font-bold border border-quest-blue/30 rounded-sm">
                                    {effect.usesRemaining} usos
                                  </span>
                                )}
                                {effect.expiresAt && (
                                  <span className="text-[9px] text-quest-textDim italic">
                                    Temporal
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-[10px] text-quest-text/80 leading-snug">
                              {item?.desc || 'Efecto especial activo.'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sección completar hábito - si no está completado hoy y objetivo semanal no alcanzado */}
            {(() => {
              const weeklyTargetMet = isWeeklyTargetMet(selectedHabit);
              if (!isSelectedHabitAvailableToday) {
                return (
                  <div className="mt-2 text-center px-3 py-3 border border-slate-500/70 bg-slate-700/20 text-slate-300 text-[11px] font-pixel uppercase ">
                    No disponible hoy
                  </div>
                );
              }
              if (weeklyTargetMet) {
                return (
                  <div className="mt-2 text-center px-3 py-3 border border-quest-green bg-[#003322] text-quest-green text-[11px] font-pixel uppercase ">
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
                        className="input-pixel !w-20 text-center text-md"
                        value={customMinutes}
                        onChange={(e) => {
                          setCustomMinutes(e.target.value);
                          setCustomError('');
                        }}
                      />
                      <span className="text-xs text-quest-textMuted font-pixel">min (opcional)</span>
                    </div>
                    {customError && (
                      <div className="text-quest-red text-xs font-pixel bg-quest-red/10 px-2 py-1 border border-quest-red">
                        {customError}
                      </div>
                    )}
                    <button
                      onClick={handleComplete}
                      className="btn-pixel-green w-full text-xs py-3 font-bold uppercase "
                    >
                      ✔ Completar
                    </button>
                  </div>
                );
              }
              return (
                <div className="mt-2 text-center px-3 py-3 border border-quest-green bg-[#003322] text-quest-green text-[11px] font-pixel uppercase ">
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
                className="btn-pixel-gold w-full text-xs py-3 font-bold uppercase "
              >
                ✎ Editar hábito
              </button>
              <button
                onClick={() => setDeleteConfirm(true)}
                className="btn-pixel-red w-full text-xs py-3 font-bold uppercase "
              >
                🗑 Borrar hábito
              </button>
            </div>

            {deleteConfirm && (
              <div className="mt-2 p-3 border border-quest-red bg-quest-red/10 text-xs font-pixel">
                <div className="mb-2">
                  ¿Seguro que quieres borrar este hábito? Esta acción no se puede deshacer.
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="btn-pixel-gray flex-1 text-xs uppercase "
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      removeHabit(selectedHabit.id);
                      closeSelected();
                    }}
                    className="btn-pixel-red flex-1 text-xs uppercase "
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
