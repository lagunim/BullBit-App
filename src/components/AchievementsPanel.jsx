import useGameStore from '../store/gameStore.js';
import { ACHIEVEMENTS, RARITY_COLORS } from '../data/achievements.js';

export default function AchievementsPanel() {
  const unlocked = useGameStore(s => s.unlockedAchievements ?? []);
  const unlockedSet = new Set(unlocked);

  const sortedAchs = [...ACHIEVEMENTS].sort((a, b) => {
    const aU = unlockedSet.has(a.id) ? 1 : 0;
    const bU = unlockedSet.has(b.id) ? 1 : 0;
    if (aU !== bU) return bU - aU;
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  });

  const unlockedCount = unlocked.length;
  const total = ACHIEVEMENTS.length;
  const progressPct = Math.round((unlockedCount / total) * 100);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="text-[10px] text-quest-gold font-pixel tracking-widest uppercase">🏆 Logros</div>
        <div className="text-[8px] text-quest-textDim font-pixel uppercase">
          <span className="text-quest-gold">{unlockedCount}</span> / {total} <span className="hidden sm:inline">completados</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar mb-2 !h-[12px]">
        <div className="progress-bar-fill" style={{ width: `${progressPct}%`, color: '#ffd700' }} />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedAchs.map(ach => {
          const isUnlocked = unlockedSet.has(ach.id);
          const rarity = RARITY_COLORS[ach.rarity];

          return (
            <div
              key={ach.id}
              className={`card-pixel transition-all duration-300 ${isUnlocked ? 'border-quest-gold shadow-[3px_3px_0_theme(colors.quest.goldDark)]' : 'opacity-40 grayscale saturate-50 border-quest-border'}`}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className={`text-3xl transition-transform ${isUnlocked ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,215,0,0.4)]' : ''}`}>
                  {ach.icon}
                </div>
                <div className="min-w-0">
                  <div className={`text-[9px] font-pixel mb-1 truncate ${isUnlocked ? 'text-quest-text' : 'text-quest-textDim'}`}>
                    {ach.name}
                  </div>
                  <div className="inline-block text-[6px] px-2 py-0.5 border" 
                       style={{ borderColor: rarity.color, color: rarity.color, background: `${rarity.color}11` }}>
                    {rarity.label}
                  </div>
                </div>
              </div>
              
              <div className="text-[7px] text-quest-textDim leading-relaxed uppercase tracking-tighter mb-2">
                {ach.desc}
              </div>

              {ach.reward && (
                <div className={`mt-auto pt-2 border-t border-quest-border/40 text-[6px] font-pixel flex items-center gap-2 ${isUnlocked ? 'text-quest-gold' : 'text-quest-textMuted'}`}>
                  <span>🎁</span>
                  <span>{isUnlocked ? 'RECOMPENSA RECLAMADA' : 'RECOMPENSA AL DESBLOQUEAR'}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
