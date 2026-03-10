import { useState } from 'react';
import { createPortal } from 'react-dom';
import useGameStore from '../../store/gameStore.js';

export default function PlanDetailModal({ date, onClose }) {
  const { plans, completePlanTask, deletePlanTask, removePlan } = useGameStore();
  const plan = plans[date];

  const [selectedTask, setSelectedTask] = useState(null);
  const [actualMinutes, setActualMinutes] = useState(30);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!plan) {
    onClose();
    return null;
  }

  const activeTasks = plan.tasks.filter(t => !t.deleted);
  const completedTasks = activeTasks.filter(t => t.completed);
  const progressPercent = activeTasks.length > 0 ? Math.round((completedTasks.length / activeTasks.length) * 100) : 0;
  const totalMinutes = activeTasks.reduce((sum, t) => sum + t.durationMinutes, 0);
  const earnedMinutes = completedTasks.reduce((sum, t) => sum + t.durationMinutes, 0);

  function handleTaskSelect(task) {
    setSelectedTask(task);
    setActualMinutes(task.durationMinutes); // Set initial value when task is selected
  }

  function handleCompleteTask() {
    if (selectedTask) {
      completePlanTask(date, selectedTask.id, actualMinutes);
      setSelectedTask(null);
    }
  }

  function handleDeleteTask(taskId) {
    deletePlanTask(date, taskId);
  }

  function handleDeletePlan() {
    removePlan(date);
    onClose();
  }

  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="anim-fade-in card-pixel w-full max-w-[420px] max-h-[calc(100dvh-60px)] overflow-y-auto flex flex-col gap-4 !p-5">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-quest-border pb-3">
          <div>
            <h2 className="text-sm sm:text-xs text-quest-gold font-pixel uppercase tracking-widest flex items-center gap-2">
              📋 {plan.name || 'Mi Plan'}
            </h2>
            <div className="text-[10px] text-quest-textMuted mt-1 font-pixel">
              📅 {formattedDate}
            </div>
          </div>
          <button onClick={onClose} className="btn-pixel-gray !py-3 !px-4 sm:!py-1 sm:!px-2 !text-sm sm:!text-xs">✕</button>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-pixel text-quest-textDim">PROGRESO</span>
            <span className="text-xs font-pixel text-white">{completedTasks.length} / {activeTasks.length} tareas</span>
          </div>
          <div className="progress-bar !h-3">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%`, color: progressPercent === 100 ? '#10b981' : '#f59e0b' }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-quest-textMuted">
            <span>⏱️ {earnedMinutes} / {totalMinutes} min</span>
            {plan.tripleApplied && (
              <span className="text-quest-gold font-bold">×3 ¡COMPLETADO!</span>
            )}
          </div>
        </div>

        {/* Tasks List */}
        <div>
          <label className="text-sm sm:text-[9px] text-quest-textDim block mb-2 font-pixel">TAREAS</label>
          <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto">
            {activeTasks.map(task => (
              <div
                key={task.id}
                className={`
                  flex items-center gap-3 p-3 rounded border transition-all cursor-pointer
                  ${task.completed
                    ? 'bg-quest-green/10 border-quest-green/30 opacity-60'
                    : 'bg-quest-bg border-quest-border hover:border-quest-cyan'
                  }
                `}
                onClick={() => !task.completed && handleTaskSelect(task)}
              >
                <div className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center text-xs
                  ${task.completed
                    ? 'bg-quest-green border-quest-green text-black'
                    : 'border-quest-textMuted'
                  }
                `}>
                  {task.completed && '✓'}
                </div>
                <div className="flex-1">
                  <div className={`text-xs font-pixel ${task.completed ? 'line-through text-quest-textMuted' : 'text-white'}`}>
                    {task.name}
                  </div>
                  <div className="text-[10px] text-quest-textMuted">
                    {task.durationMinutes} min
                    {task.completed && task.completedAt && (
                      <span className="ml-2 text-quest-green">✓ Completada</span>
                    )}
                  </div>
                </div>
                {!task.completed && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                    className="text-quest-red hover:text-red-400 text-xs p-1"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Triple Bonus Info */}
        {!plan.tripleApplied && activeTasks.length > 0 && (
          <div className="p-3 bg-quest-gold/10 border border-quest-gold/30 rounded">
            <div className="text-xs text-quest-gold font-pixel text-center">
              ⚡ ¡Completa todas las tareas para triplicar tus puntos!
            </div>
          </div>
        )}

        {/* Delete Plan Button */}
        <button
          onClick={() => setShowConfirmDelete(true)}
          className="btn-pixel-red w-full uppercase text-xs py-2"
        >
          🗑️ Eliminar Plan
        </button>

        {/* Confirm Delete Modal */}
        {showConfirmDelete && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[11000] p-4"
            onClick={(e) => e.target === e.currentTarget && setShowConfirmDelete(false)}>
            <div className="bg-quest-panel border border-quest-red p-4 rounded max-w-sm">
              <h2 className="text-sm text-quest-red font-pixel mb-4 text-center">
                ¿Estás seguro de que quieres eliminar este plan?
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="btn-pixel-gray flex-1 uppercase text-xs"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeletePlan}
                  className="btn-pixel-red flex-1 uppercase text-xs"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Complete Task Modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[11000] p-4"
            onClick={(e) => e.target === e.currentTarget && setSelectedTask(null)}>
            <div className="bg-quest-panel border border-quest-cyan p-4 rounded max-w-sm w-full">
              <h2 className="text-sm text-quest-cyan font-pixel mb-4 text-center">
                ✓ Completar: {selectedTask.name}
              </h2>

              <div className="mb-4">
                <label className="text-xs text-quest-textDim block mb-2 font-pixel">
                  DURACIÓN REAL (MIN)
                </label>
                <input
                  className="input-pixel w-full text-center text-lg"
                  type="number"
                  min={1}
                  max={480}
                  value={actualMinutes}
                  onChange={e => setActualMinutes(parseInt(e.target.value) || selectedTask.durationMinutes)}
                />
                <div className="text-center text-xs text-quest-textMuted mt-2">
                  Puntos: +{actualMinutes} pts
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="btn-pixel-gray flex-1 uppercase text-xs"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCompleteTask}
                  className="btn-pixel-green flex-[2] uppercase text-xs font-bold"
                >
                  ✓ Completar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
