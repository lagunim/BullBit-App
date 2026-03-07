import { useState } from 'react';
import useGameStore from '../store/gameStore.js';
import CreatePlanModal from './CreatePlanModal.jsx';
import PlanDetailModal from './PlanDetailModal.jsx';

export default function PlanCard() {
  const { plans } = useGameStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const todayPlan = plans[today];

  if (!todayPlan) return null;

  const activeTasks = todayPlan.tasks.filter(t => !t.deleted);
  const completedTasks = activeTasks.filter(t => t.completed);
  const progressPercent = activeTasks.length > 0 
    ? Math.round((completedTasks.length / activeTasks.length) * 100) 
    : 0;
  const totalMinutes = activeTasks.reduce((sum, t) => sum + t.durationMinutes, 0);
  const earnedMinutes = completedTasks.reduce((sum, t) => sum + t.durationMinutes, 0);

  const isComplete = progressPercent === 100;

  return (
    <>
      <div className="mb-2">
        <h2 className="text-[10px] sm:text-xs font-pixel text-quest-gold uppercase tracking-wider">📋 Plan de Hoy</h2>
      </div>
      
      <div
        className={`mb-6 p-3 sm:p-4 border bg-gradient-to-r from-purple-500/20 to-purple-600/20 backdrop-blur-sm card-pixel cursor-pointer hover:scale-[1.02] transition-transform ${isComplete ? 'border-quest-green/50' : 'border-purple-500/30'}`}
        onClick={() => setShowDetailModal(true)}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">📋</span>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-[10px] sm:text-[12px] font-pixel truncate uppercase tracking-tight">
                {todayPlan.name || 'Mi Plan'}
              </h3>
              <div className="mt-0.5">
                <span className="text-[8px] sm:text-[10px] font-pixel font-semibold px-1.5 py-0.5 rounded border bg-purple-500/20 border-purple-500/30 text-purple-300">
                  PLAN
                </span>
              </div>
            </div>
          </div>
          {isComplete && (
            <div className="flex items-center gap-1 text-quest-green">
              <span className="text-sm sm:text-base">✓</span>
              <span className="text-[8px] sm:text-[10px] font-pixel font-medium">COMPLETADO</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-2 sm:mb-3">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <span className="text-[8px] sm:text-[10px] font-pixel text-gray-500">PROGRESO</span>
            <span className="text-[8px] sm:text-[10px] font-pixel text-white font-bold">
              <span className="sm:hidden">{progressPercent}%</span>
              <span className="hidden sm:inline">{completedTasks.length} / {activeTasks.length} tareas</span>
            </span>
          </div>
          <div className="progress-bar !h-[10px]">
            <div
              className="progress-bar-fill"
              style={{
                width: `${progressPercent}%`,
                color: isComplete ? '#10b981' : '#a855f7'
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="text-gray-500 text-[8px] sm:text-[10px] font-pixel">
            <span className="text-purple-400 font-medium">⏱️ +{earnedMinutes} pts</span>
            {!todayPlan.tripleApplied && activeTasks.length > 0 && (
              <span className="text-quest-gold ml-2">⚡ ×3 si completas todo</span>
            )}
            {todayPlan.tripleApplied && (
              <span className="text-quest-green ml-2">✓×3</span>
            )}
          </div>
          {isComplete && (
            <div className="text-quest-green text-[8px] sm:text-[10px] font-pixel font-medium hidden sm:block">
              ¡OBTENIDO! 🎉
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreatePlanModal 
          onClose={() => setShowCreateModal(false)} 
          editDate={today}
        />
      )}

      {showDetailModal && (
        <PlanDetailModal 
          date={today} 
          onClose={() => setShowDetailModal(false)} 
        />
      )}
    </>
  );
}
