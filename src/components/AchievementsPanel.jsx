import { useState } from 'react';
import { createPortal } from 'react-dom';
import useGameStore from '../store/gameStore.js';
import { ACHIEVEMENTS, RARITY_COLORS } from '../data/achievements.js';
import { getProgressColor } from '../utils/gameLogic.js';
import { getStoryById } from '../data/stories.js';

function StoryModal({ story, onClose }) {
  if (!story) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 anim-fade-in" onClick={onClose}>
      <div
        className="bg-quest-card border-2 border-quest-gold shadow-[0_0_50px_rgba(255,215,0,0.15)] max-w-lg w-full max-h-[85vh] flex flex-col relative p-6 sm:p-8 anim-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-quest-textDim hover:text-quest-gold transition-colors text-xl"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="text-4xl mb-4">📜</div>
          <h2 className="text-xl sm:text-2xl font-pixel text-quest-gold uppercase tracking-wider mb-2">
            {story.title}
          </h2>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-quest-gold to-transparent mx-auto opacity-50" />
        </div>

        <div className="prose prose-invert prose-sm max-w-none text-quest-text font-serif leading-relaxed text-justify flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {story.content.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="mb-4 last:mb-0 text-base opacity-90">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="btn-pixel text-[10px] py-2 px-6"
          >
            CERRAR LIBRO
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function AchievementsPanel() {
  const [selectedStory, setSelectedStory] = useState(null);
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

  const handleAchievementClick = (ach) => {
    if (!unlockedSet.has(ach.id)) return;
    if (ach.storyId) {
      const story = getStoryById(ach.storyId);
      if (story) {
        setSelectedStory(story);
      }
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex text-xs justify-between items-center flex-wrap gap-2">
        <div className="text-quest-gold font-pixel tracking-widest uppercase">🏆 Logros</div>
        <div className="text-quest-textDim font-pixel uppercase">
          <span className="text-quest-gold">{unlockedCount}</span> / {total} <span className="hidden sm:inline">completados</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar mb-2 !h-[12px]">
        <div className="progress-bar-fill" style={{ width: `${progressPct}%`, color: getProgressColor(progressPct) }} />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedAchs.map(ach => {
          const isUnlocked = unlockedSet.has(ach.id);
          const rarity = RARITY_COLORS[ach.rarity];
          const hasStory = !!ach.storyId;

          return (
            <div
              key={ach.id}
              onClick={() => handleAchievementClick(ach)}
              className={`card-pixel transition-all duration-300 relative group
                ${isUnlocked
                  ? 'border-quest-gold shadow-[3px_3px_0_theme(colors.quest.goldDark)] cursor-pointer hover:translate-y-[-2px] hover:shadow-[4px_4px_0_theme(colors.quest.goldDark)] active:translate-y-[1px] active:shadow-none'
                  : 'opacity-40 grayscale saturate-50 border-quest-border cursor-not-allowed'}`}
            >
              {isUnlocked && hasStory && (
                <div className="absolute top-2 right-2 text-xs opacity-50 group-hover:opacity-100 transition-opacity animate-pulse text-quest-gold" title="Click para leer historia">
                  📖
                </div>
              )}

              <div className="flex items-center gap-4 mb-3">
                <div className={`text-3xl transition-transform ${isUnlocked ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,215,0,0.4)] group-hover:scale-125' : ''}`}>
                  {ach.icon}
                </div>
                <div className="min-w-0">
                  <div className={`text-xs font-pixel mb-1 truncate ${isUnlocked ? 'text-quest-text group-hover:text-quest-gold transition-colors' : 'text-quest-textDim'}`}>
                    {ach.name}
                  </div>
                  <div className="inline-block text-[8px] px-2 py-0.5 border"
                    style={{ borderColor: rarity.color, color: rarity.color, background: `${rarity.color}11` }}>
                    {rarity.label}
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-quest-textDim leading-relaxed uppercase tracking-tighter mb-2">
                {ach.desc}
              </div>

              {ach.reward && (
                <div className={`mt-auto pt-2 border-t border-quest-border/40 text-[8px] font-pixel flex items-center gap-2 ${isUnlocked ? 'text-quest-gold' : 'text-quest-textMuted'}`}>
                  <span>🎁</span>
                  <span>{isUnlocked ? 'RECOMPENSA RECLAMADA' : 'RECOMPENSA AL DESBLOQUEAR'}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedStory && (
        <StoryModal
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      )}
    </div>
  );
}
