/**
 * LevelProgress - Componente de progreso de nivel/viaje
 * 
 * Muestra información sobre el viaje actual del jugador:
 * - Número de viaje (nivel) actual
 * - Porcentaje de progreso hacia el siguiente viaje
 * - Puntos restantes para el siguiente nivel
 * - Puntos totales acumulados en la cuenta
 * - Racha global actual
 * - Puntos del viaje actual
 * 
 * Es un botón interactivo que abre el panel de historias al hacer click.
 * 
 * @component
 * @param {Object} props
 * @param {Function} props.onOpenStories - Función para abrir el panel de historias
 * @returns {JSX.Element} Tarjeta de progreso de nivel
 */
import useGameStore from '../store/gameStore.js';
import { getLevelInfo, getProgressColor } from '../utils/gameLogic.js';

export default function LevelProgress({ onOpenStories }) {
  const level = useGameStore(s => s.level ?? 0);
  const points = useGameStore(s => s.points ?? 0);
  const lifetimePoints = useGameStore(s => s.lifetimePoints ?? 0);
  const globalStreak = useGameStore(s => s.globalStreak ?? 0);
  const unlockedStories = useGameStore(s => s.unlockedStories ?? []);

  const { pct, remaining } = getLevelInfo(level, points);
  const journeyStories = unlockedStories.filter(story => story.journeyId > 0);

  return (
    <button
      type="button"
      onClick={onOpenStories}
      className="card-pixel level-progress-card mb-3 flex flex-col gap-2 w-full text-left cursor-pointer hover:border-quest-gold transition-colors duration-150 focus:outline-none focus:border-quest-gold"
      title="Ver historias desbloqueadas"
    >
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[12px] text-quest-gold font-pixel drop-shadow-[0_0_4px_theme(colors.quest.gold)]">VIAJE {level}</span>
          <span className="text-[10px] text-quest-textDim">{pct}%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-quest-green font-pixel">-{remaining.toLocaleString()} PTS</div>
        </div>
      </div>

      <div className="border level-progress-bar !h-[10px]">
        <div
          className="progress-bar-fill level-progress-bar-fill"
          style={{
            width: `${pct}%`,
            color: getProgressColor(pct)
          }}
        />
      </div>

      <div className="flex justify-between border-t border-quest-border pt-2 mt-1">
        <div className="text-center flex-1">
          <div className="text-xs text-quest-textDim mb-0.5">PUNTOS</div>
          <div className="text-xs text-quest-cyan font-pixel">{points.toLocaleString()}</div>
        </div>
        <div className="w-[1px] h-4 bg-quest-border self-center" />
        <div className="text-center flex-1">
          <div className="text-xs text-quest-textDim mb-0.5">TOTAL</div>
          <div className="text-xs text-quest-purple font-pixel">{lifetimePoints.toLocaleString()}</div>
        </div>
        <div className="w-[1px] h-4 bg-quest-border self-center" />
        <div className="text-center flex-1">
          <div className="text-xs text-quest-textDim mb-0.5">RACHA</div>
          <div className="text-xs text-quest-red font-pixel">{globalStreak > 0 ? `🔥${globalStreak}d` : '---'}</div>
        </div>
      </div>
    </button>
  );
}
