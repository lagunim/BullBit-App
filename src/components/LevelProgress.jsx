import useGameStore from '../store/gameStore.js';
import { getLevelInfo } from '../utils/gameLogic.js';

export default function LevelProgress() {
  const level = useGameStore(s => s.level ?? 0);
  const points = useGameStore(s => s.points ?? 0);
  const lifetimePoints = useGameStore(s => s.lifetimePoints ?? 0);
  const globalStreak = useGameStore(s => s.globalStreak ?? 0);

  const { threshold, pct, remaining } = getLevelInfo(level, points);

  return (
    <div className="card-pixel mb-3 flex flex-col gap-2">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[12px] text-quest-gold font-pixel drop-shadow-[0_0_4px_theme(colors.quest.gold)]">LV.{level}</span>
          <span className="text-[7px] text-quest-textDim">{pct}%</span>
        </div>
        <div className="text-[8px] text-quest-green font-pixel">+{remaining.toLocaleString()} PTS</div>
      </div>

      <div className="progress-bar !h-[10px]">
        <div 
          className="progress-bar-fill" 
          style={{ 
            width: `${pct}%`,
            color: pct > 80 ? '#00e676' : pct > 40 ? '#00e5ff' : '#448aff'
          }} 
        />
      </div>

      <div className="flex justify-between border-t border-quest-border pt-2 mt-1">
        <div className="text-center flex-1">
          <div className="text-[6px] text-quest-textDim mb-0.5">TOTAL</div>
          <div className="text-[8px] text-quest-purple font-pixel">{lifetimePoints.toLocaleString()}</div>
        </div>
        <div className="w-[1px] h-4 bg-quest-border self-center" />
        <div className="text-center flex-1">
          <div className="text-[6px] text-quest-textDim mb-0.5">RACHA</div>
          <div className="text-[8px] text-quest-red font-pixel">{globalStreak > 0 ? `🔥${globalStreak}d` : '---'}</div>
        </div>
      </div>
    </div>
  );
}
