import useGameStore from '../store/gameStore.js';
import { ITEMS, RARITY_COLORS } from '../data/items.js';

export default function InventoryPanel() {
  const inventory = useGameStore(s => s.inventory ?? []);
  const rawEffects = useGameStore(s => s.activeEffects ?? []);
  const useItem = useGameStore(s => s.useItem);
  const habits = useGameStore(s => s.habits ?? []);

  const now = new Date();
  const activeEffects = rawEffects.filter(e => !e.expiresAt || new Date(e.expiresAt) > now);

  const allItems = Object.values(ITEMS);

  // Items that need a target habit (instant effects on habits)
  const habitTargetEffects = ['mult_recovery', 'perm_base_mult', 'retroactive_complete'];

  function handleUse(itemId) {
    const item = ITEMS[itemId];
    if (habitTargetEffects.includes(item?.effectKey)) {
      if (habits.length === 0) { return; }
      const target = habits[0]?.id; // simplified: apply to first habit
      useItem(itemId, target);
    } else {
      useItem(itemId);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-quest-border pb-3">
        <div className="text-[10px] text-quest-cyan font-pixel mb-2 tracking-widest uppercase">🎒 Inventario</div>
        <div className="text-[7px] text-quest-textDim leading-relaxed uppercase">
          Consigue objetos desbloqueando logros. Úsalos para potenciar tus rachas y recuperar multiplicadores.
        </div>
      </div>

      {/* Active effects */}
      {activeEffects.length > 0 && (
        <div className="anim-fade-in">
          <div className="text-[7px] text-quest-gold font-pixel mb-3 flex items-center gap-2">
            <span className="animate-pulse">★</span> EFECTOS ACTIVOS
          </div>
          <div className="flex flex-wrap gap-3">
            {activeEffects.map((eff, i) => (
              <div key={i} className="bg-quest-panel/50 border-2 border-quest-gold px-3 py-2 shadow-[2px_2px_0_theme(colors.quest.goldDark)] text-quest-gold text-[7px] font-pixel flex items-center gap-3">
                <span className="animate-blink">◆</span>
                <div>
                  <div className="mb-1 uppercase tracking-tighter">{eff.itemName ?? eff.key}</div>
                  {eff.expiresAt && (
                    <div className="text-quest-textMuted text-[6px]">
                      Expira: {new Date(eff.expiresAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {allItems.map(item => {
          const invEntry = inventory.find(i => i.itemId === item.id);
          const qty = invEntry?.qty ?? 0;
          const owned = qty > 0;
          const rarity = RARITY_COLORS[item.rarity];

          return (
            <div key={item.id} className={`card-pixel transition-all duration-300 ${
              owned ? 'border-quest-borderLight opacity-100' : 'opacity-30 grayscale saturate-50'
            }`}>
              {/* Qty badge */}
              {owned && (
                <div className="absolute -top-3 -right-3 z-10 w-6 h-6 bg-quest-bg border-2 border-quest-cyan text-quest-cyan text-[9px] font-pixel flex items-center justify-center shadow-pixel-sm">
                  {qty}
                </div>
              )}

              <div className="flex items-center gap-4 mb-3">
                <div className="text-3xl drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">{item.icon}</div>
                <div className="min-w-0">
                  <div className={`text-[9px] font-pixel mb-1 truncate ${owned ? 'text-quest-text' : 'text-quest-textMuted'}`}>
                    {item.name}
                  </div>
                  <div className="inline-block text-[6px] px-1.5 py-0.5 border uppercase tracking-wider font-bold" 
                       style={{ borderColor: rarity.color, color: rarity.color, background: `${rarity.color}11` }}>
                    {rarity.label}
                  </div>
                </div>
              </div>

              <div className="text-[7px] text-quest-textDim leading-relaxed min-h-[30px] mb-3 uppercase tracking-tighter">
                {item.desc}
              </div>

              {owned ? (
                <button
                  onClick={() => handleUse(item.id)}
                  className="btn-pixel-cyan w-full text-[8px] font-pixel bg-quest-cyan/10 border-quest-cyan text-white hover:bg-quest-cyan py-2"
                >
                  ▶ ACTIVAR
                </button>
              ) : (
                <div className="text-[5px] text-quest-textMuted text-center font-pixel border border-dashed border-quest-border py-1">
                  BLOQUEADO
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
