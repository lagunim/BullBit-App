import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import useGameStore from '../store/gameStore.js';
import { ITEMS, RARITY_COLORS } from '../data/items.js';
import ActiveEffectModal from './ActiveEffectModal.jsx';

export default function InventoryPanel() {
  const inventory = useGameStore(s => s.inventory ?? []);
  const rawEffects = useGameStore(s => s.activeEffects ?? []);
  const useItem = useGameStore(s => s.useItem);
  const habits = useGameStore(s => s.habits ?? []);
  const pushNotification = useGameStore(s => s._pushNotification);
  const [selectedEffect, setSelectedEffect] = useState(null);
  const [pendingTargetItem, setPendingTargetItem] = useState(null);

  const now = new Date();
  const activeEffects = rawEffects.filter(e => !e.expiresAt || new Date(e.expiresAt) > now);

  const allItems = Object.values(ITEMS).sort((a, b) => {
    const invA = inventory.find(i => i.itemId === a.id);
    const invB = inventory.find(i => i.itemId === b.id);
    const qtyA = invA?.qty ?? 0;
    const qtyB = invB?.qty ?? 0;
    if (qtyA > 0 && qtyB === 0) return -1;
    if (qtyA === 0 && qtyB > 0) return 1;
    return 0;
  });

  // Items that need a target habit (instant effects on habits)
  const habitTargetEffects = ['mult_recovery', 'perm_base_mult'];

  function handleUse(itemId) {
    const item = ITEMS[itemId];
    if (habitTargetEffects.includes(item?.effectKey)) {
      const eligible = habits.filter(h => (h?.multiplier ?? 1) < 3);
      if (eligible.length === 0) {
        pushNotification?.('item', 'Todos tus hábitos ya tienen multiplicador máximo.');
        return;
      }
      setPendingTargetItem({ itemId, name: item?.name ?? 'Objeto', icon: item?.icon ?? '🔮' });
      return;
    }
    useItem(itemId);
  }

  const eligibleHabits = useMemo(() => {
    if (!pendingTargetItem) return [];
    return habits
      .filter(habit => (habit?.multiplier ?? 1) < 3)
      .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
  }, [habits, pendingTargetItem]);

  function handleSelectHabit(habitId) {
    if (!pendingTargetItem) return;
    useItem(pendingTargetItem.itemId, habitId);
    setPendingTargetItem(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-quest-border pb-3">
        <div className="text-xs text-quest-cyan font-pixel mb-2 tracking-widest uppercase">🎒 Inventario</div>
        <div className="text-[8px] text-quest-textDim leading-relaxed uppercase">
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
              <div
                key={i}
                onClick={() => setSelectedEffect(eff)}
                className="bg-quest-panel/50 border-2 border-quest-gold px-3 py-2 shadow-[2px_2px_0_theme(colors.quest.goldDark)] text-quest-gold text-[7px] font-pixel flex items-center gap-3 cursor-pointer hover:bg-quest-gold/10 transition-colors"
              >
                <span className="animate-blink">◆</span>
                <div>
                  <div className="mb-1 uppercase text-[10px]">{eff.itemName ?? eff.key}</div>
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
            <div key={item.id} className={`card-pixel transition-all duration-300 ${owned ? 'border-quest-borderLight opacity-100' : 'opacity-30 grayscale saturate-50'
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
                  <div className={`text-xs font-pixel mb-1 truncate ${owned ? 'text-quest-text' : 'text-quest-textMuted'}`}>
                    {item.name}
                  </div>
                  <div className="inline-block text-[6px] px-1.5 py-0.5 border uppercase tracking-wider font-bold"
                    style={{ borderColor: rarity.color, color: rarity.color, background: `${rarity.color}11` }}>
                    {rarity.label}
                  </div>
                </div>
              </div>

              <div className="text-[8px] text-quest-textDim leading-relaxed min-h-[30px] mb-3 uppercase">
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

      {pendingTargetItem && createPortal(
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[12000] p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setPendingTargetItem(null); }}
        >
          <div className="card-pixel w-full max-w-[520px] bg-quest-bg border border-quest-border relative p-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-xs text-quest-cyan uppercase font-pixel tracking-widest">
                  {pendingTargetItem.icon} Recuperar multiplicador
                </div>
                <div className="text-[10px] text-quest-textDim font-pixel uppercase">
                  Elige un hábito para aplicar el tótem
                </div>
              </div>
              <button
                onClick={() => setPendingTargetItem(null)}
                className="btn-pixel-gray py-1 px-3 text-[10px]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              {eligibleHabits.map(habit => (
                <button
                  key={habit.id}
                  onClick={() => handleSelectHabit(habit.id)}
                  className="w-full flex items-center gap-3 p-3 border border-quest-border text-left text-[10px] font-pixel uppercase rounded-md hover:border-quest-cyan hover:bg-quest-cyan/5 transition-colors"
                >
                  <span className="text-xl">{habit.emoji}</span>
                  <div className="flex-1 truncate">
                    <div className="truncate text-quest-text">{habit.name}</div>
                    <div className="text-[8px] text-quest-textDim">×{(habit.multiplier ?? 1).toFixed(1)}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setPendingTargetItem(null)}
                className="btn-pixel-gray text-[8px] py-2 uppercase"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {selectedEffect && (
        <ActiveEffectModal effect={selectedEffect} onClose={() => setSelectedEffect(null)} />
      )}
    </div>
  );
}
