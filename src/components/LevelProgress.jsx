import useGameStore from '../store/gameStore.js';
import { getLevelInfo } from '../utils/gameLogic.js';

export default function LevelProgress({ onOpenStories }) {
  const level = useGameStore(s => s.level ?? 0);
  const points = useGameStore(s => s.points ?? 0);
  const lifetimePoints = useGameStore(s => s.lifetimePoints ?? 0);
  const globalStreak = useGameStore(s => s.globalStreak ?? 0);
  const unlockedStories = useGameStore(s => s.unlockedStories ?? []);

  const { threshold, pct, remaining } = getLevelInfo(level, points);
  const storiesCount = unlockedStories.length;

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
          {storiesCount > 0 && (
            <span className="text-[10px] text-quest-purple font-pixel">📜 {storiesCount}</span>
          )}
          <div className="text-xs text-quest-green font-pixel">-{remaining.toLocaleString()} PTS</div>
        </div>
      </div>

      <div className="border level-progress-bar !h-[10px]">
        <div
          className="progress-bar-fill level-progress-bar-fill"
          style={{
            width: `${pct}%`,
            color: pct > 80 ? '#ffd36a' : pct > 40 ? '#f1b64a' : '#d28a1e'
          }}
        />
      </div>

      <div className="flex justify-between border-t border-quest-border pt-2 mt-1">
        <div className="text-center flex-1">
          <div className="text-xs text-quest-textDim mb-0.5">TOTAL</div>
          <div className="text-xs text-quest-purple font-pixel">{lifetimePoints.toLocaleString()}</div>
        </div>
        <div className="w-[1px] h-4 bg-quest-border self-center" />
        <div className="text-center flex-1">
          <div className="text-xs text-quest-textDim mb-0.5">RACHA</div>
          <div className="text-xs text-quest-red font-pixel">{globalStreak > 0 ? `🔥${globalStreak}d` : '---'}</div>
        </div>
        <div className="w-[1px] h-4 bg-quest-border self-center" />
        <div className="text-center flex-1">
          <div className="text-xs text-quest-textDim mb-0.5">HISTORIAS</div>
          <div className="text-xs text-quest-gold font-pixel">{storiesCount > 0 ? `📜 ${storiesCount}` : '---'}</div>
        </div>
      </div>
    </button>
  );
}
