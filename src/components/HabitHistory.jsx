import { useState } from 'react';
import { createPortal } from 'react-dom';
import useGameStore from '../store/gameStore.js';
import { getDateKey } from '../utils/gameLogic.js';
import EditHabitModal from './EditHabitModal.jsx';

const STATUS_STYLE = {
  completed: { bg: 'bg-[#003322]', border: 'border-quest-green', symbol: '✔', text: 'text-quest-green' },
  // Menos tiempo: azul apagado
  partial:   { bg: 'bg-[#001933]', border: 'border-quest-blue',  symbol: '✔', text: 'text-quest-blue' },
  // Más tiempo: dorado (tick “especial”)
  over:      { bg: 'bg-[#332800]', border: 'border-quest-gold',  symbol: '✔', text: 'text-quest-gold' },
  failed:    { bg: 'bg-[#330011]', border: 'border-quest-red',   symbol: '✖', text: 'text-quest-red' },
  none:      { bg: 'bg-quest-bg', border: 'border-quest-border', symbol: '·', text: 'text-quest-textMuted' },
};

export default function HabitHistory() {
  const habits = useGameStore(s => s.habits ?? []);
  const history = useGameStore(s => s.history ?? {});
  const retroCompleteYesterday = useGameStore(s => s.retroCompleteYesterday);
  const removeHabit = useGameStore(s => s.removeHabit);

  const DAYS = 14; // Showing 14 días para mejor encaje en móvil
  const dates = Array.from({ length: DAYS }, (_, i) => getDateKey(DAYS - 1 - i));
  const todayKey = getDateKey(0);
  const yesterdayKey = getDateKey(1);

  const [retroHabit, setRetroHabit] = useState(null);
  const [completionMode, setCompletionMode] = useState(null); // 'partial' | 'over'
  const [customMinutes, setCustomMinutes] = useState('');
  const [customError, setCustomError] = useState('');
  const [detailHabit, setDetailHabit] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  const isCompletedStatus = (status) =>
    status === 'completed' || status === 'partial' || status === 'over';

  function getCreatedKey(habit) {
    const direct = (habit.createdAt || '').slice(0, 10);
    if (direct) return direct;

    // Si no hay createdAt (hábitos antiguos), inferimos la primera fecha
    // en la que aparece en el historial.
    let firstKey = null;
    for (const dateKey of Object.keys(history)) {
      const day = history[dateKey];
      if (day && day[habit.id]) {
        if (!firstKey || dateKey < firstKey) {
          firstKey = dateKey;
        }
      }
    }
    return firstKey;
  }

  const deriveStatus = (date, habit) => {
    const habitId = habit.id;
    const rawStatus = history[date]?.[habitId] ?? 'none';
    const isToday = date === todayKey;
    const isFuture = date > todayKey;
    const createdKey = getCreatedKey(habit);
    const isBeforeCreation = createdKey && date < createdKey;

    if (isBeforeCreation) {
      // El hábito no existía aún en esta fecha: se muestra vacío/neutro.
      return 'none';
    }

    if (rawStatus === 'none' && !isToday && !isFuture) {
      // Pasado sin registro explícito = fallo automático
      return 'failed';
    }
    return rawStatus;
  };

  function closeDetailModal() {
    setDetailHabit(null);
    setDeleteConfirm(false);
  }

  function openRetroModal(habit) {
    setRetroHabit(habit);
    setCompletionMode(null);
    setCustomMinutes(habit.minutes);
    setCustomError('');
  }

  function closeRetroModal() {
    setRetroHabit(null);
    setCompletionMode(null);
    setCustomError('');
  }

  function handleRetroStandard() {
    if (!retroHabit) return;
    retroCompleteYesterday(retroHabit.id, 'standard', retroHabit.minutes);
    closeRetroModal();
  }

  function handleRetroCustom() {
    if (!retroHabit || !completionMode) return;
    const minutes = Number(customMinutes);
    if (!Number.isFinite(minutes) || minutes <= 0) {
      setCustomError('Introduce un número de minutos válido.');
      return;
    }
    const mode = completionMode === 'partial' ? 'partial' : 'over';
    retroCompleteYesterday(retroHabit.id, mode, minutes);
    closeRetroModal();
  }

  const retroMultColorClass = retroHabit
    ? retroHabit.multiplier >= 3
      ? 'text-quest-gold'
      : retroHabit.multiplier >= 2
      ? 'text-quest-cyan'
      : retroHabit.multiplier >= 1.5
      ? 'text-quest-green'
      : 'text-quest-text'
    : 'text-quest-text';

  const detailCompleted = detailHabit
    ? dates.filter(d => isCompletedStatus(deriveStatus(d, detailHabit))).length
    : 0;
  const detailFailed = detailHabit
    ? dates.filter(d => deriveStatus(d, detailHabit) === 'failed').length
    : 0;
  const detailRate =
    detailCompleted + detailFailed > 0
      ? Math.round((detailCompleted / (detailCompleted + detailFailed)) * 100)
      : 0;

  const canRetroYesterdayForDetail = detailHabit
    ? (() => {
        const rawStatus = history[yesterdayKey]?.[detailHabit.id] ?? 'none';
        return !(
          rawStatus === 'completed' ||
          rawStatus === 'partial' ||
          rawStatus === 'over'
        );
      })()
    : false;

  if (habits.length === 0) {
    return (
      <div className="text-center py-10 text-quest-textMuted font-pixel text-[8px] uppercase tracking-widest border-2 border-dashed border-quest-border">
        SIN HÁBITOS — CREA UNO PRIMERO ⚔️
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-quest-border pb-3">
        <div className="text-[10px] text-quest-cyan font-pixel mb-2 tracking-widest uppercase">📅 Historial</div>
        <div className="text-[7px] text-quest-textDim leading-relaxed uppercase">
          Registro de los últimos {DAYS} días. Mantén el ritmo para evitar penalizaciones en el multiplicador.
        </div>
      </div>

      {/* Legend (sin “VACÍO”, solo estados reales) */}
      <div className="flex gap-4 flex-wrap">
        {Object.entries(STATUS_STYLE)
          .filter(([key]) => key !== 'none')
          .map(([key, s]) => {
            const label =
              key === 'completed'
                ? 'HECHO'
                : key === 'partial'
                ? 'MENOS TIEMPO'
                : key === 'over'
                ? 'MÁS TIEMPO'
                : 'FALLO';
            return (
              <div key={key} className={`flex items-center gap-2 text-[7px] font-pixel ${s.text}`}>
                <div className={`w-3 h-3 ${s.bg} border ${s.border}`} />
                <span className="uppercase tracking-tighter">{label}</span>
              </div>
            );
          })}
      </div>

      {/* Grid-based History Table */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[480px]">
          <div className="flex border-b-2 border-quest-border pb-2 mb-2">
            <div className="w-32 shrink-0 text-[7px] text-quest-textMuted font-pixel tracking-tighter uppercase self-end">Hábito</div>
            <div className="flex-1 flex justify-around">
              {dates.map(d => {
                const short = d.slice(8); // DD only
                const isToday = d === todayKey;
                return (
                  <div key={d} className={`text-[6px] font-pixel text-center ${isToday ? 'text-quest-cyan underline decoration-2' : 'text-quest-textMuted'}`}>
                    {short}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            {habits.map(habit => {
              const createdKey = getCreatedKey(habit);
              return (
                <div key={habit.id} className="flex items-center">
                  <div className="w-32 shrink-0 text-[8px] truncate pr-2 uppercase font-pixel tracking-tighter leading-none">
                    {habit.emoji} {habit.name}
                  </div>
                  <div className="flex-1 flex justify-around">
                    {dates.map(d => {
                      const rawStatus = history[d]?.[habit.id] ?? 'none';
                      const status = deriveStatus(d, habit);
                      const s = STATUS_STYLE[status] ?? STATUS_STYLE.none;
                      const isToday = d === todayKey;
                      const isFuture = d > todayKey;
                      const isBeforeCreation = createdKey && d < createdKey;
                      const isEditableYesterday =
                        d === yesterdayKey &&
                        !isFuture &&
                        !isBeforeCreation &&
                        !(rawStatus === 'completed' || rawStatus === 'partial' || rawStatus === 'over');

                      return (
                        <div
                          key={d}
                          onClick={() => {
                            if (isEditableYesterday) {
                              openRetroModal(habit);
                            }
                          }}
                          className={`w-5 h-5 flex items-center justify-center text-[9px] border transition-all ${s.bg} ${s.border} ${s.text} ${
                            isToday && status === 'none' ? 'animate-pulse scale-110 border-quest-cyan' : ''
                          } ${isEditableYesterday ? 'cursor-pointer hover:scale-110 hover:border-quest-gold' : ''}`}
                        >
                          {s.symbol}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
        {habits.map(habit => {
          const completed = dates.filter(d => isCompletedStatus(deriveStatus(d, habit))).length;
          const failed = dates.filter(d => deriveStatus(d, habit) === 'failed').length;
          const rate = completed + failed > 0 ? Math.round((completed / (completed + failed)) * 100) : 0;
          return (
            <div
              key={habit.id}
              className="card-pixel !p-3 cursor-pointer hover:border-quest-gold hover:shadow-[2px_2px_0_#b8860b] transition-all"
              onClick={() => {
                setDetailHabit(habit);
                setDeleteConfirm(false);
              }}
            >
              <div className="text-[8px] font-pixel mb-3 flex items-center gap-2 uppercase tracking-tighter border-b border-quest-border pb-2">
                <span>{habit.emoji}</span>
                <span className="truncate">{habit.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-[7px] font-pixel uppercase tracking-tighter">
                <div className="text-quest-textDim">COMPLETADOS:</div>
                <div className="text-quest-green text-right">{completed}</div>
                <div className="text-quest-textDim">FALLADOS:</div>
                <div className="text-quest-red text-right">{failed}</div>
                <div className="text-quest-textDim pt-2 border-t border-quest-border">TASA ÉXITO:</div>
                <div className="text-quest-gold text-right pt-2 border-t border-quest-border">{rate}%</div>
              </div>
            </div>
          );
        })}
      </div>
      {detailHabit && createPortal(
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[11000] p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          onClick={(e) => e.target === e.currentTarget && closeDetailModal()}
        >
          <div className="anim-fade-in card-pixel w-full max-w-[420px] !p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-quest-border pb-2">
              <div className="text-[10px] text-quest-cyan font-pixel uppercase tracking-widest flex items-center gap-2">
                <span>{detailHabit.emoji}</span>
                <span className="truncate">{detailHabit.name}</span>
              </div>
              <button
                onClick={closeDetailModal}
                className="btn-pixel-gray !py-2 !px-3 !text-[10px]"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-y-2 text-[7px] font-pixel uppercase tracking-tighter">
              <div className="text-quest-textDim">COMPLETADOS (últimos {DAYS} días):</div>
              <div className="text-quest-green text-right">{detailCompleted}</div>
              <div className="text-quest-textDim">FALLADOS:</div>
              <div className="text-quest-red text-right">{detailFailed}</div>
              <div className="text-quest-textDim pt-2 border-t border-quest-border">TASA ÉXITO:</div>
              <div className="text-quest-gold text-right pt-2 border-t border-quest-border">{detailRate}%</div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              {canRetroYesterdayForDetail && (
                <button
                  onClick={() => {
                    openRetroModal(detailHabit);
                    closeDetailModal();
                  }}
                  className="btn-pixel-blue w-full text-[9px] py-3"
                >
                  ⏪ Corregir día de ayer
                </button>
              )}
              <button
                onClick={() => {
                  setEditingHabit(detailHabit);
                  closeDetailModal();
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
                      removeHabit(detailHabit.id);
                      closeDetailModal();
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
      {retroHabit && createPortal(
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[11000] p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          onClick={(e) => e.target === e.currentTarget && closeRetroModal()}
          onKeyDown={(e) => {
            if ((e.key === 'Escape' || e.key === 'Esc') && e.target === e.currentTarget) {
              closeRetroModal();
            }
          }}
        >
          <div className="anim-fade-in card-pixel w-full max-w-[420px] !p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-quest-border pb-2">
              <div className="text-[10px] text-quest-cyan font-pixel uppercase tracking-widest">
                ¿Cómo fue la misión de ayer?
              </div>
              <button
                onClick={closeRetroModal}
                className="btn-pixel-gray !py-2 !px-3 !text-[10px]"
              >
                ✕
              </button>
            </div>

            <div className="text-[9px] text-quest-textDim font-pixel leading-relaxed">
              <div className="mb-1">
                <span className="text-quest-text">{retroHabit?.emoji} {retroHabit?.name}</span>
              </div>
              <div className="text-quest-textMuted">
                Objetivo: <span className="text-quest-green">{retroHabit?.minutes} min</span> — Multiplicador actual:{' '}
                <span className={retroMultColorClass}>×{(retroHabit?.multiplier ?? 1).toFixed(1)}</span>
              </div>
            </div>

            {!completionMode && (
              <div className="space-y-2">
                <button
                  onClick={() => setCompletionMode('partial')}
                  className="btn-pixel-blue w-full text-[9px] py-3"
                >
                  Hecho, pero por un tiempo menor
                </button>
                <button
                  onClick={() => setCompletionMode('over')}
                  className="btn-pixel-gold w-full text-[9px] py-3 text-quest-bg"
                >
                  Completado por más tiempo
                </button>
                <button
                  onClick={handleRetroStandard}
                  className="btn-pixel-green w-full text-[9px] py-3"
                >
                  Hábito completado
                </button>
              </div>
            )}

            {completionMode && (
              <div className="space-y-3">
                <div className="text-[8px] text-quest-textDim font-pixel uppercase tracking-widest">
                  {completionMode === 'partial'
                    ? 'Indica cuántos minutos hiciste ayer (NO añade extra al multiplicador, solo corrige el fallo).'
                    : 'Indica cuántos minutos hiciste ayer (se premia el extra y se corrige el fallo).'}
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={480}
                    className="input-pixel !w-24 text-center"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                  />
                  <span className="text-[8px] text-quest-textMuted font-pixel uppercase">
                    minutos reales ayer
                  </span>
                </div>
                {customError && (
                  <div className="text-quest-red text-[7px] font-pixel bg-quest-red/10 px-2 py-1 border border-quest-red">
                    {customError}
                  </div>
                )}
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => {
                      setCompletionMode(null);
                      setCustomError('');
                    }}
                    className="btn-pixel-gray flex-1 text-[9px]"
                  >
                    Volver
                  </button>
                  <button
                    onClick={handleRetroCustom}
                    className="btn-pixel-green flex-[1.5] text-[9px]"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
