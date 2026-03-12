/**
 * DailyChallengeModal - Modal detallado de misión diaria
 * 
 * Muestra información completa sobre la misión diaria seleccionada:
 * - Nombre, icono y descripción
 * - Dificultad (easy/medium/hard/epic)
 * - Progreso actual vs objetivo
 * - Estado de completitud
 * - Recompensas disponibles (puntos y objetos)
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.daily - Objeto con los datos de la misión diaria
 * @param {Function} props.onClose - Función para cerrar el modal
 * @returns {JSX.Element|null} Modal de misión diaria o null si no hay misión
 */
import { createPortal } from 'react-dom';
import useGameStore from '../../store/gameStore.js';
import { getItemById } from '../../lib/itemsCatalog.js';
import { getProgressColor } from '../../utils/gameLogic.js';

export default function DailyChallengeModal({ daily, onClose }) {
  if (!daily) return null;
  const itemsCatalog = useGameStore(s => s.itemsCatalog ?? {});

  const { name, description, icon, progress, completed, difficulty, rewards } = daily;
  const progressPercentage = Math.min(100, Math.round((progress.current / progress.target) * 100));

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      case 'epic': return 'text-fuchsia-400';
      default: return 'text-gray-400';
    }
  };

  const getDifficultyBg = (diff) => {
    switch (diff) {
      case 'easy': return 'from-green-500/20 to-green-600/20 border-green-500/30';
      case 'medium': return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
      case 'hard': return 'from-red-500/20 to-red-600/20 border-red-500/30';
      case 'epic': return 'from-fuchsia-500/20 to-violet-600/20 border-fuchsia-500/30';
      default: return 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4 backdrop-blur-sm shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="anim-fade-in card-pixel w-full max-w-[420px] max-h-[calc(100dvh-60px)] overflow-y-auto flex flex-col gap-5 !p-6 border-quest-gold shadow-[4px_4px_0_theme(colors.quest.goldDark)]">
        {/* Title */}
        <div className="flex justify-between items-center border-b border-quest-border pb-3">
          <h2 className="text-sm sm:text-xs text-quest-gold font-pixel uppercase tracking-widest flex items-center gap-2">
            <span className="animate-pulse">📜</span> Misión Diaria
          </h2>
          <button onClick={onClose} className="btn-pixel-gray !py-3 !px-4 sm:!py-1 sm:!px-2 !text-sm sm:!text-xs">✕</button>
        </div>

        {/* Icon & Name */}
        <div className="flex items-center gap-4">
          <div className={`text-4xl p-4 border bg-gradient-to-r ${getDifficultyBg(difficulty)}`}>
            {icon}
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-white">{name}</h2>
            <span className={`text-[8px] font-semibold px-2 py-1 inline-block mt-2 rounded-full border ${getDifficultyColor(difficulty)} ${getDifficultyBg(difficulty)}`}>
              {difficulty.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="bg-quest-bg/50 p-4 border border-quest-border">
          <p className="text-gray-300 text-xs">{description}</p>
        </div>

        {/* Progress */}
        <div>
          <div className="flex text-[10px] items-center justify-between mb-2">
            <span className="text-gray-400">Progreso</span>
            <span className="text-white font-bold">
              {progress.current} / {progress.target} ({progressPercentage}%)
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{
                width: `${progressPercentage}%`,
                color: getProgressColor(completed ? 100 : progressPercentage),
              }}
            />
          </div>
        </div>

        {/* Status */}
        {completed && (
          <div className="flex items-center justify-center gap-2 py-3 bg-green-500/20 border border-green-500/30 ">
            <span className="text-green-400 text-2xl">✓</span>
            <span className="text-green-400 text-[10px] font-bold">MISIÓN COMPLETADA</span>
          </div>
        )}

        {/* Rewards */}
        <div className="border-t border-quest-border pt-4">
          <h3 className="text-xs text-gray-400 uppercase mb-3 font-pixel">Recompensas</h3>
          <div className="flex items-stretch justify-around gap-4">
            <div className="flex  text-[10px] items-center gap-2 bg-yellow-500/20 px-4 py-2 border border-yellow-500/30">
              <span className="text-yellow-400 font-bold">+{rewards.points}</span>
              <span className="text-yellow-400 ">pts</span>
            </div>
            {rewards.items && rewards.items.length > 0 && (
              <div className="flex items-center gap-2">
                {rewards.items.map((itemId, idx) => {
                  const item = getItemById(itemsCatalog, itemId);
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-1 px-3 py-2 border ${completed
                        ? 'bg-purple-500/20 border-purple-500/30'
                        : 'bg-purple-900/30 border-purple-500/50 animate-pulse'
                        }`}
                    >
                      <span>{completed ? (item?.icon || '📦') : '🎁'}</span>
                      <span className={`text-[10px] ${completed ? 'text-purple-400' : 'text-purple-300'}`}>
                        {completed ? item?.name : 'Item'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {completed && rewards.items && rewards.items.length > 0 && (
            <p className="text-green-400 text-xs mt-2 text-center">¡Recompensa obtenida!</p>
          )}
        </div>

        {/* Close button */}
        <button onClick={onClose} className="btn-pixel-gold w-full uppercase font-bold tracking-widest mt-2 text-xs">
          Cerrar
        </button>
      </div>
    </div>,
    document.body
  );
}
