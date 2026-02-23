import { useState } from 'react';
import { createPortal } from 'react-dom';
import useGameStore from '../store/gameStore.js';
import { getTodayKey } from '../utils/gameLogic.js';

export default function HabitCard({ habit, onEdit }) {
  const history = useGameStore(s => s.history ?? {});
  const completeHabit = useGameStore(s => s.completeHabit);
  const completeHabitPartial = useGameStore(s => s.completeHabitPartial);
  const completeHabitOvertime = useGameStore(s => s.completeHabitOvertime);
  const failHabit = useGameStore(s => s.failHabit);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionMode, setCompletionMode] = useState(null); // 'partial' | 'over'
  const [customMinutes, setCustomMinutes] = useState(habit.minutes);
  const [customError, setCustomError] = useState('');

  const today = getTodayKey();
  const todayStatus = history[today]?.[habit.id];
  const isDone = todayStatus === 'completed' || todayStatus === 'partial' || todayStatus === 'over';
  const isFailed = todayStatus === 'failed';
  const isDetermined = isDone || isFailed;

  // Multiplier color
  const multColorClass = habit.multiplier >= 3 ? 'text-quest-gold'
    : habit.multiplier >= 2  ? 'text-quest-cyan'
    : habit.multiplier >= 1.5 ? 'text-quest-green'
    : 'text-quest-text';

  const borderColorClass = isDone ? 'border-quest-green' : isFailed ? 'border-quest-red' : 'border-quest-border';
  const shadowColorClass = isDone ? 'shadow-[2px_2px_0_#004422]' : isFailed ? 'shadow-[2px_2px_0_#440011]' : 'shadow-pixel-sm';

  function openCompleteModal() {
    setShowCompleteModal(true);
    setCompletionMode(null);
    setCustomMinutes(habit.minutes);
    setCustomError('');
  }

  function closeCompleteModal() {
    setShowCompleteModal(false);
    setCompletionMode(null);
    setCustomError('');
  }

  function handleConfirmStandard() {
    completeHabit(habit.id);
    closeCompleteModal();
  }

  function handleConfirmCustom() {
    const minutes = Number(customMinutes);
    if (!Number.isFinite(minutes) || minutes <= 0) {
      setCustomError('Introduce un número de minutos válido.');
      return;
    }
    if (!completionMode) return;

    if (completionMode === 'partial') {
      completeHabitPartial(habit.id, minutes);
    } else if (completionMode === 'over') {
      completeHabitOvertime(habit.id, minutes);
    }
    closeCompleteModal();
  }

  return (
    <div
      className={`anim-slide-in card-pixel flex flex-col gap-2 !p-4 sm:!p-3 transition-all ${borderColorClass} ${shadowColorClass} ${isDetermined ? 'bg-quest-bg/60 opacity-80' : ''}`}
      onClick={onEdit}
    >
      {/* Cabecera: icono, nombre, racha, multiplicador a la derecha */}
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
        <span
          className={`ml-auto text-[10px] font-pixel ${multColorClass} shrink-0`}
        >
          ×{(habit.multiplier ?? 1).toFixed(1)}
        </span>
      </div>

      {/* Botones de acción debajo, ocupando todo el ancho */}
      <div className="mt-1 w-full">
        {!isDetermined ? (
          <div className="flex gap-2 w-full">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openCompleteModal();
              }}
              className="btn-pixel-green flex-[2] text-[12px] sm:text-[10px]"
              style={{ height: '22px', minHeight: '22px', paddingTop: '2px', paddingBottom: '2px' }}
            >
              ✔
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                failHabit(habit.id);
              }}
              className="btn-pixel-red flex-1 text-[12px] sm:text-[10px]"
              style={{ height: '22px', minHeight: '22px', paddingTop: '2px', paddingBottom: '2px' }}
            >
              ✖
            </button>
          </div>
        ) : (
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
        )}
      </div>
      {showCompleteModal && createPortal(
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[11000] p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeCompleteModal();
            }
            // Evita que los clics dentro del modal disparen el onClick de la tarjeta
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            if ((e.key === 'Escape' || e.key === 'Esc') && e.target === e.currentTarget) {
              closeCompleteModal();
            }
          }}
        >
          <div className="anim-fade-in card-pixel w-full max-w-[420px] !p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-quest-border pb-2">
              <div className="text-[10px] text-quest-cyan font-pixel uppercase tracking-widest">
                ¿Cómo fue la misión de hoy?
              </div>
              <button
                onClick={closeCompleteModal}
                className="btn-pixel-gray !py-2 !px-3 !text-[10px]"
              >
                ✕
              </button>
            </div>

            <div className="text-[9px] text-quest-textDim font-pixel leading-relaxed">
              <div className="mb-1">
                <span className="text-quest-text">{habit.emoji} {habit.name}</span>
              </div>
              <div className="text-quest-textMuted">
                Objetivo: <span className="text-quest-green">{habit.minutes} min</span> — Multiplicador actual:{' '}
                <span className={multColorClass}>×{(habit.multiplier ?? 1).toFixed(1)}</span>
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
                  onClick={handleConfirmStandard}
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
                    ? 'Indica cuántos minutos hiciste (NO cambia el multiplicador).'
                    : 'Indica cuántos minutos hiciste (se premia el extra).'}
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
                    minutos reales hoy
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
                    onClick={handleConfirmCustom}
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
