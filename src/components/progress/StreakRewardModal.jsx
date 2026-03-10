/**
 * StreakRewardModal - Modal de recompensa por racha
 * 
 * Se muestra cuando el usuario alcanza una racha múltiplo de 3.
 * Muestra el objeto recibido según la racha:
 * - 3 → Common
 * - 6 → Rare
 * - 9 → Epic
 * - 12+ → Legendary
 * 
 * @component
 * @returns {JSX.Element|null} Modal de recompensa por racha
 */
import { createPortal } from 'react-dom';
import { useState } from 'react';
import useGameStore from '../../store/gameStore.js';
import { RARITY_COLORS } from '../../data/items.js';

const rarityLabel = {
  common: 'COMÚN',
  rare: 'RARO',
  epic: 'ÉPICO',
  legendary: 'LEGENDARIO',
};

export default function StreakRewardModal() {
  const streakReward = useGameStore(s => s.streakReward);
  const globalStreak = useGameStore(s => s.globalStreak);
  const clearStreakReward = useGameStore(s => s.clearStreakReward);
  const grantItem = useGameStore(s => s.grantItem);
  
  const [claiming, setClaiming] = useState(false);

  if (!streakReward) return null;

  const rarity = streakReward.rarity || 'common';
  const rarityStyle = RARITY_COLORS[rarity] || RARITY_COLORS.common;

  function handleClaim() {
    if (claiming) return;
    setClaiming(true);
    
    grantItem(streakReward.id);
    
    setTimeout(() => {
      clearStreakReward();
    }, 300);
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[10000] p-4 backdrop-blur-sm">
      <div className="card-pixel w-full max-w-[400px] flex flex-col gap-5 !p-6 border-quest-gold shadow-[4px_4px_0_theme(colors.quest.goldDark)] animate-in fade-in zoom-in duration-300">
        <div className="text-center border-b border-quest-border pb-4">
          <h2 className="text-sm sm:text-xs text-quest-gold font-pixel uppercase tracking-widest flex items-center justify-center gap-2 mb-2">
            <span className="animate-pulse">🔥</span> ¡Racha múltiple de 3!
          </h2>
          <p className="text-gray-400 text-[10px] sm:text-xs font-pixel">
            Has alcanzado {globalStreak} días de racha
          </p>
        </div>

        <div className="flex flex-col items-center py-4">
          <div 
            className="relative w-24 h-24 flex items-center justify-center mb-4 rounded-full"
            style={{ 
              background: `radial-gradient(circle, ${rarityStyle.color}22 0%, transparent 70%)`,
              boxShadow: rarityStyle.glow
            }}
          >
            <span className="text-5xl animate-bounce">{streakReward.icon}</span>
          </div>

          <h3 className="font-bold text-white text-lg font-pixel mb-2" style={{ color: rarityStyle.color, textShadow: rarityStyle.glow }}>
            {streakReward.name}
          </h3>

          <span 
            className="text-[10px] font-semibold px-3 py-1 rounded-full border mb-4"
            style={{ 
              color: rarityStyle.color, 
              borderColor: rarityStyle.color + '66',
              background: rarityStyle.color + '11'
            }}
          >
            {rarityLabel[rarity] || rarity.toUpperCase()}
          </span>

          <p className="text-gray-300 text-xs text-center leading-relaxed px-2">
            {streakReward.desc}
          </p>
        </div>

        <div className="flex items-center justify-center">
          <button
            onClick={handleClaim}
            disabled={claiming}
            className={`btn-pixel text-[10px] px-6 py-3 w-full ${claiming ? 'opacity-50' : 'bg-quest-gold text-black hover:brightness-110'}`}
          >
            {claiming ? 'RECLAMANDO...' : 'RECLAMAR OBJETO'}
          </button>
        </div>

        <p className="text-center text-gray-500 text-[9px] font-pixel">
          ¡Continúa así para más recompensas!
        </p>
      </div>
    </div>,
    document.body
  );
}
