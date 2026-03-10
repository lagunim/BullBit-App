import { RARITY_COLORS } from '../../data/items.js';

export default function ItemCard({ item, qty, onUse, actionText = "▶ USAR" }) {
  const rarityKey = item.rarity === 'uncommon' ? 'rare' : item.rarity;
  const rarity = RARITY_COLORS[rarityKey] || RARITY_COLORS.common;

  return (
    <div className="card-pixel transition-all duration-300 border-quest-borderLight opacity-100 p-4">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl flex-shrink-0 drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">
          {item.icon}
        </span>
        <div className="flex-1 min-w-0">
          <div 
            className="font-pixel text-[9px] mb-1 truncate"
            style={{ color: rarity.color, textShadow: rarity.glow !== 'none' ? rarity.glow : 'none' }}
          >
            {item.name}
          </div>
          <div className="font-pixel text-[7px] text-quest-textDim mt-1 leading-relaxed uppercase">
            {item.desc || item.description}
          </div>
          <div className="flex gap-2 mt-2 items-center">
            {qty > 0 && (
              <span className="font-pixel text-[8px] bg-quest-bg border border-quest-cyan text-quest-cyan px-1.5 py-0.5">
                x{qty}
              </span>
            )}
            <span 
              className="inline-block text-[6px] px-1.5 py-0.5 border uppercase tracking-wider font-bold"
              style={{ borderColor: rarity.color, color: rarity.color, background: `${rarity.color}11` }}
            >
              {rarity.label}
            </span>
          </div>
        </div>
      </div>
      {onUse && (
        <button 
          onClick={() => onUse(item.id)} 
          className="btn-pixel-cyan w-full text-[8px] font-pixel bg-quest-cyan/10 border-quest-cyan text-white hover:bg-quest-cyan py-2 mt-2"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
