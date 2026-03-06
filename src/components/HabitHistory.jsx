import { useState } from 'react';
import { createPortal } from 'react-dom';
import useGameStore from '../store/gameStore.js';
import { getDateKey } from '../utils/gameLogic.js';
import EditHabitModal from './EditHabitModal.jsx';

const STATUS_STYLE = {
  completed: { bg: 'bg-[#003322]', border: 'border-quest-green', symbol: '✔', text: 'text-quest-green' },
  // Menos tiempo: azul apagado
  partial: { bg: 'bg-[#001933]', border: 'border-quest-blue', symbol: '✔', text: 'text-quest-blue' },
  // Más tiempo: dorado (tick “especial”)
  over: { bg: 'bg-[#332800]', border: 'border-quest-gold', symbol: '✔', text: 'text-quest-gold' },
  failed: { bg: 'bg-[#330011]', border: 'border-quest-red', symbol: '✖', text: 'text-quest-red' },
  none: { bg: 'bg-quest-bg', border: 'border-quest-border', symbol: '·', text: 'text-quest-textMuted' },
};

export default function HabitHistory() {
  const habits = useGameStore(s => s.habits ?? []);
  const history = useGameStore(s => s.history ?? {});
  const removeHabit = useGameStore(s => s.removeHabit);

  const DAYS = 7; // Showing 7 días para una tabla más legible
  // Día actual a la izquierda (sin scroll lateral), más antiguos a la derecha
  const dates = Array.from({ length: DAYS }, (_, i) => getDateKey(i));
  const todayKey = getDateKey(0);
  const yesterdayKey = getDateKey(1);
  const [detailHabit, setDetailHabit] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  const isCompletedStatus = (status) =>
    status === 'completed' || status === 'partial' || status === 'over';

  function getMaxStreak(habitId) {
    const sortedDates = Object.keys(history).sort();
    let maxStreak = 0;
    let currentStreak = 0;

    for (const dateKey of sortedDates) {
      const status = history[dateKey]?.[habitId];
      if (isCompletedStatus(status)) {
        currentStreak++;
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
        }
      } else {
        currentStreak = 0;
      }
    }
    return maxStreak;
  }

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
      return 'none';
    }

    if (rawStatus === 'none' && !isToday && !isFuture) {
      if (habit.periodicity === 'weekly_times') {
        return 'none';
      }
      return 'failed';
    }
    return rawStatus;
  };

  function closeDetailModal() {
    setDetailHabit(null);
    setDeleteConfirm(false);
  }


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
  const detailMaxStreak = detailHabit ? getMaxStreak(detailHabit.id) : 0;


  if (habits.length === 0) {
    return (
      <div className="text-center py-10 text-quest-textMuted font-pixel text-xs uppercase tracking-widest border-2 border-dashed border-quest-border">
        SIN HÁBITOS — CREA UNO PRIMERO ⚔️
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-quest-border pb-3">
        <div className="text-xs text-quest-cyan font-pixel mb-2 tracking-widest uppercase">📅 Historial</div>
        <div className="text-[8px] text-quest-textDim leading-relaxed uppercase">
          Registro de los últimos {DAYS} días. Mantén el ritmo para evitar penalizaciones en el multiplicador.
        </div>
      </div>

      {/* Legend (sin “VACÍO”, solo estados reales) */}
      <div className="flex gap-4 flex-wrap text-xs">
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
              <div key={key} className={`flex items-center gap-2 text-[8px] font-pixel ${s.text}`}>
                <div className={`w-3 h-3 ${s.bg} border ${s.border}`} />
                <span className="uppercase tracking-tighter">{label}</span>
              </div>
            );
          })}
      </div>

      {/* Grid-based History Table - Grid para alineación correcta día/cuadro */}
      <div className="w-full">
        <div
          className="grid border-b-2 border-quest-border pb-2 mb-2 items-end"
          style={{ gridTemplateColumns: 'minmax(0, 12rem) repeat(7, minmax(0, 1fr))' }}
        >
          <div className="text-xs text-quest-textMuted font-pixel tracking-tighter uppercase sticky left-0 z-10 bg-quest-panel px-2 text-left">
            Hábito
          </div>
          {dates.map(d => {
            const short = d.slice(8);
            const isToday = d === todayKey;
            return (
              <div
                key={d}
                className={`text-xs font-pixel text-center ${isToday ? 'text-quest-cyan underline decoration-2' : 'text-quest-textMuted'}`}
              >
                {short}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-1.5">
          {habits.map(habit => {
            const createdKey = getCreatedKey(habit);
            return (
              <div
                key={habit.id}
                className="grid items-center"
                style={{ gridTemplateColumns: 'minmax(0, 12rem) repeat(7, minmax(0, 1fr))' }}
              >
                <div
                  className="text-[10px] uppercase font-pixel tracking-tighter leading-tight sticky left-0 z-10 bg-quest-panel px-2"
                  style={{
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    display: '-webkit-box',
                    overflow: 'hidden',
                  }}
                >
                  {habit.emoji} {habit.name}
                </div>
                {dates.map(d => {
                  const status = deriveStatus(d, habit);
                  const s = STATUS_STYLE[status] ?? STATUS_STYLE.none;
                  const isToday = d === todayKey;
                  return (
                    <div key={d} className="flex items-center justify-center px-1 py-1">
                      <div
                        className={`aspect-square w-full flex items-center justify-center text-xs border transition-all ${s.bg} ${s.border} ${s.text} ${isToday && status === 'none' ? 'animate-pulse scale-110 border-quest-cyan' : ''}`}
                      >
                        {s.symbol}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mt-2">
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
              <div className="text-xs sm:text-xs font-pixel mb-3 flex items-center gap-2 uppercase tracking-tighter border-b border-quest-border pb-2">
                <span>{habit.emoji}</span>
                <span className="truncate">{habit.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-xs sm:text-[8px] font-pixel uppercase tracking-tighter">
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
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[11000] p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          onClick={(e) => e.target === e.currentTarget && closeDetailModal()}
        >
          <div className="anim-fade-in card-pixel w-full max-w-[420px] !p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-quest-border pb-2">
              <div className="text-sm text-quest-cyan font-pixel uppercase tracking-[0.3em] flex items-center gap-2">
                <span>{detailHabit.emoji}</span>
                <span className="truncate">{detailHabit.name}</span>
              </div>
              <button
                onClick={closeDetailModal}
                className="btn-pixel-gray !py-2 !px-3 !text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-quest-textDim uppercase ">Completados ({DAYS} días)</span>
                <span className="text-base font-bold text-quest-green">{detailCompleted}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-quest-textDim uppercase ">Fallados</span>
                <span className="text-base font-bold text-quest-red">{detailFailed}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-quest-border">
                <span className="text-xs text-quest-textDim uppercase ">Tasa de éxito</span>
                <span className="text-base font-bold text-quest-gold">{detailRate}%</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-quest-border">
                <span className="text-xs text-quest-textDim uppercase ">Mayor racha</span>
                <span className="text-base font-bold text-quest-orange">🔥 {detailMaxStreak}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={() => {
                  setEditingHabit(detailHabit);
                  closeDetailModal();
                }}
                className="btn-pixel-gold w-full text-xs py-3"
              >
                ✎ Editar hábito
              </button>
              <button
                onClick={() => setDeleteConfirm(true)}
                className="btn-pixel-red w-full text-xs py-3"
              >
                🗑 Borrar hábito
              </button>
            </div>

            {deleteConfirm && (
              <div className="mt-2 p-2 border border-quest-red bg-quest-red/10 text-xs font-pixel">
                <div className="mb-2">
                  <p>
                    <span className="text-quest-red text-xs">¿Seguro que quieres borrar este hábito?</span>
                    <br />
                    <span className="text-quest-textDim text-xs">Esta acción no se puede deshacer.</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="btn-pixel-gray flex-1 text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      removeHabit(detailHabit.id);
                      closeDetailModal();
                    }}
                    className="btn-pixel-red flex-1 text-xs"
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
