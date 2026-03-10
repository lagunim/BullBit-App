/**
 * InventoryPanel - Panel de inventario y objetos del jugador
 * 
 * Gestiona el inventario del jugador mostrando:
 * - Efectos activos actualmente aplicados
 * - Objetos poseídos con su cantidad
 * - Catálogo completo de todos los objetos disponibles
 * 
 * Permite usar objetos que requieren seleccionar un hábito objetivo
 * (como potenciadores de multiplicador específicos).
 * 
 * @component
 * @returns {JSX.Element} Panel de inventario con objetos y efectos
 */
import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import useGameStore from '../store/gameStore.js';
import { ITEMS, RARITY_COLORS } from '../data/items.js';
import ActiveEffectModal from './ActiveEffectModal.jsx';
import { getHabitMultiplierCap, hasPermanentMultiplierGem } from '../utils/gameLogic.js';

export default function InventoryPanel() {
  const inventory = useGameStore(s => s.inventory ?? []);
  const rawEffects = useGameStore(s => s.activeEffects ?? []);
  const useItem = useGameStore(s => s.useItem);
  const habits = useGameStore(s => s.habits ?? []);
  const pushNotification = useGameStore(s => s._pushNotification);
  const [selectedEffect, setSelectedEffect] = useState(null);
  const [pendingTargetItem, setPendingTargetItem] = useState(null);
  const [pendingMultiSelectItem, setPendingMultiSelectItem] = useState(null);
  const [selectedHabits, setSelectedHabits] = useState([]);

  const now = new Date();
  const activeEffects = rawEffects.filter(e => !e.expiresAt || new Date(e.expiresAt) > now);

  const displayedEffects = activeEffects.reduce((acc, effect) => {
    // Evitar duplicados por clave de efecto Y objetivo
    if (!acc.some(e => e.key === effect.key && e.targetHabitId === effect.targetHabitId)) {
      acc.push(effect);
    }
    return acc;
  }, []);

  function getEffectiveMultiplierForHabit(habit) {
    const globalBoost = activeEffects.find(e => e.key === 'global_mult_boost')?.value ?? 0;
    const habitBoost = activeEffects.find(e =>
      e.key === 'habit_mult_boost' && (!e.targetHabitId || e.targetHabitId === habit.id)
    )?.value ?? 0;
    const cap = getHabitMultiplierCap(habit.id, activeEffects);
    return Math.min(cap, (habit.multiplier ?? 1) + globalBoost + habitBoost);
  }

  const allItems = Object.values(ITEMS).sort((a, b) => {
    const invA = inventory.find(i => i.itemId === a.id);
    const invB = inventory.find(i => i.itemId === b.id);
    const qtyA = invA?.qty ?? 0;
    const qtyB = invB?.qty ?? 0;
    // Ordena: primero los que tienen cantidad > 0
    if (qtyA > 0 && qtyB === 0) return -1;
    if (qtyA === 0 && qtyB > 0) return 1;
    return 0;
  });

  // Items que requieren seleccionar un hábito como objetivo
  // Son efectos instantáneos que se aplican a un hábito específico
  const habitTargetEffects = ['mult_recovery', 'perm_base_mult', 'next_triple_target', 'mult_boost_target', 'habit_mult_boost_target', 'delete_habit', 'phoenix_restore'];
  
  // Items que requieren seleccionar múltiples hábitos
  const multiTargetEffects = ['fusion'];
  
  // Items que requieren seleccionar cantidad (no hábito)
  const quantitySelectEffects = ['void_exchange'];
  
  const [pendingQuantityItem, setPendingQuantityItem] = useState(null);

  // Maneja el uso de un objeto del inventario
  // Algunos objetos requieren seleccionar un hábito objetivo primero
  function handleUse(itemId) {
    const item = ITEMS[itemId];
    // Si el efecto requiere cantidad (Piedra del Vacío)
    if (quantitySelectEffects.includes(item?.effectKey)) {
      const invEntry = inventory.find(i => i.itemId === itemId);
      const qty = invEntry?.qty ?? 0;
      
      const options = [];
      if (qty >= 2) options.push({ qty: 2, label: '2 Piedras → Common', rarity: 'common' });
      if (qty >= 4) options.push({ qty: 4, label: '4 Piedras → Rare', rarity: 'rare' });
      if (qty >= 6) options.push({ qty: 6, label: '6 Piedras → Epic', rarity: 'epic' });
      if (qty >= 10) options.push({ qty: 10, label: '10 Piedras → Legendary', rarity: 'legendary' });
      
      if (options.length === 0) {
        pushNotification?.('item', 'Necesitas al menos 2 Piedras del Vacío.');
        return;
      }
      
      setPendingQuantityItem({
        itemId,
        name: item?.name ?? 'Objeto',
        icon: item?.icon ?? '🕳️',
        effectKey: item?.effectKey,
        desc: item?.desc ?? 'Descripción no disponible',
        options,
        availableQty: qty
      });
      return;
    }

    // Si el efecto requiere múltiples objetivos (Poción de Fusión)
    if (multiTargetEffects.includes(item?.effectKey)) {
      if (habits.length < 2) {
        pushNotification?.('item', 'Necesitas al menos 2 hábitos para realizar una fusión.');
        return;
      }
      setPendingMultiSelectItem({
        itemId,
        name: item?.name ?? 'Objeto',
        icon: item?.icon ?? '🧪',
        effectKey: item?.effectKey,
        desc: item?.desc ?? 'Descripción no disponible',
        requiredCount: 2
      });
      setSelectedHabits([]);
      return;
    }

    // Si el efecto requiere un objetivo (hábito específico)
    if (habitTargetEffects.includes(item?.effectKey)) {
      // Para Piedra de Poder, cualquier hábito es elegible
      // Para otros, solo hábitos con multiplicador < 3
      const eligible = item.effectKey === 'next_triple_target'
        ? habits
        : item.effectKey === 'perm_base_mult'
          ? habits.filter(h => !hasPermanentMultiplierGem(h.id, activeEffects))
          : item.effectKey === 'phoenix_restore'
            ? habits.filter(h => (h?.multiplier ?? 1) < 3)
            : habits.filter(h => (h?.multiplier ?? 1) < 3);

      if (eligible.length === 0) {
        const message = item.effectKey === 'next_triple_target'
          ? 'No tienes hábitos disponibles.'
          : item.effectKey === 'perm_base_mult'
            ? 'Todos tus hábitos ya tienen activa la Gema del Multiplicador.'
            : item.effectKey === 'phoenix_restore'
              ? 'Todos tus hábitos ya tienen multiplicador ×3 o superior.'
              : 'Todos tus hábitos ya tienen multiplicador máximo.';
        pushNotification?.('item', message);
        return;
      }
      // Abre el modal de selección de hábito
      setPendingTargetItem({
        itemId,
        name: item?.name ?? 'Objeto',
        icon: item?.icon ?? '🔮',
        effectKey: item?.effectKey,
        desc: item?.desc ?? 'Descripción no disponible'
      });
      return;
    }
    // Uso directo del objeto
    useItem(itemId);
  }

  const eligibleHabits = useMemo(() => {
    if (!pendingTargetItem) return [];
    // Para Piedra de Poder se muestran todos.
    // Para Gema, se excluyen hábitos que ya tienen este efecto (no apilable).
    // Para otros, se mantiene la lógica existente de multiplicador < 3.
    const filtered = pendingTargetItem.effectKey === 'next_triple_target'
      ? habits
      : pendingTargetItem.effectKey === 'perm_base_mult'
        ? habits.filter(habit => !hasPermanentMultiplierGem(habit.id, activeEffects))
        : pendingTargetItem.effectKey === 'phoenix_restore'
          ? habits.filter(habit => (habit?.multiplier ?? 1) < 3)
          : habits.filter(habit => (habit?.multiplier ?? 1) < 3);

    return filtered.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
  }, [habits, pendingTargetItem, activeEffects]);

  function handleSelectHabit(habitId) {
    if (!pendingTargetItem) return;
    useItem(pendingTargetItem.itemId, habitId);
    setPendingTargetItem(null);
  }

  function handleSelectQuantity(qty) {
    if (!pendingQuantityItem) return;
    useItem(pendingQuantityItem.itemId, null, qty);
    setPendingQuantityItem(null);
  }

  function handleHabitToggle(habitId) {
    setSelectedHabits(prev => {
      if (prev.includes(habitId)) {
        return prev.filter(id => id !== habitId);
      } else if (prev.length < (pendingMultiSelectItem?.requiredCount || 2)) {
        return [...prev, habitId];
      }
      return prev;
    });
  }

  function handleConfirmMultiSelect() {
    if (!pendingMultiSelectItem || selectedHabits.length !== pendingMultiSelectItem.requiredCount) return;
    useItem(pendingMultiSelectItem.itemId, null, selectedHabits);
    setPendingMultiSelectItem(null);
    setSelectedHabits([]);
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
      {displayedEffects.length > 0 && (
        <div className="anim-fade-in">
          <div className="text-xs text-quest-gold font-pixel mb-3 flex items-center gap-2">
            <h2 className='text-[10px] sm:text-xs font-pixel uppercase'>
              <span className="animate-pulse">★</span> EFECTOS ACTIVOS
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {displayedEffects.map((eff, i) => (
              <div
                key={i}
                onClick={() => setSelectedEffect(eff)}
                className="bg-quest-panel/50 border-2 border-quest-gold px-3 py-2 shadow-[2px_2px_0_theme(colors.quest.goldDark)] text-quest-gold text-[7px] font-pixel flex items-center gap-3 cursor-pointer hover:bg-quest-gold/10 transition-colors"
              >
                <span className="animate-blink">◆</span>
                <div>
                  <div className="mb-1 uppercase text-[8px]">{eff.itemName ?? eff.key}</div>
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
        <h2 className='text-[10px] sm:text-xs font-pixel text-quest-purple uppercase flex items-center gap-2'>
          <span className="animate-pulse">💎</span> Objetos
        </h2>
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
                  {pendingTargetItem.icon} {pendingTargetItem.name}
                </div>
                <div className="text-[10px] text-quest-textDim font-pixel uppercase">
                  {pendingTargetItem.desc}
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
              {eligibleHabits.map(habit => {
                const effectiveMult = getEffectiveMultiplierForHabit(habit);
                const hasGem = hasPermanentMultiplierGem(habit.id, activeEffects);
                return (
                  <button
                    key={habit.id}
                    onClick={() => handleSelectHabit(habit.id)}
                    className="w-full flex items-center gap-3 p-3 border border-quest-border text-left text-[10px] font-pixel uppercase rounded-md hover:border-quest-cyan hover:bg-quest-cyan/5 transition-colors"
                  >
                    <span className="text-xl">{habit.emoji}</span>
                    <div className="flex-1 truncate">
                      <div className="truncate text-quest-text">{habit.name}</div>
                      <div className="text-[8px] text-quest-textDim flex items-center gap-1">
                        {hasGem && <span title="Gema del Multiplicador activa">💠</span>}
                        <span>×{effectiveMult.toFixed(1)}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
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

      {pendingQuantityItem && createPortal(
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[12000] p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setPendingQuantityItem(null); }}
        >
          <div className="card-pixel w-full max-w-[420px] bg-quest-bg border border-quest-border relative p-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-xs text-quest-purple uppercase font-pixel tracking-widest">
                  {pendingQuantityItem.icon} {pendingQuantityItem.name}
                </div>
                <div className="text-[10px] text-quest-textDim font-pixel uppercase">
                  {pendingQuantityItem.desc}
                </div>
                <div className="text-[8px] text-quest-cyan mt-1">
                  Disponibles: {pendingQuantityItem.availableQty}
                </div>
              </div>
              <button
                onClick={() => setPendingQuantityItem(null)}
                className="btn-pixel-gray py-1 px-3 text-[10px]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {pendingQuantityItem.options.map(opt => (
                <button
                  key={opt.qty}
                  onClick={() => handleSelectQuantity(opt.qty)}
                  className="w-full flex items-center justify-between p-4 border border-quest-border text-left text-[10px] font-pixel uppercase rounded-md hover:border-quest-cyan hover:bg-quest-cyan/5 transition-colors"
                >
                  <span className="text-quest-text">{opt.label}</span>
                  <span 
                    className="text-[8px] px-2 py-1 border uppercase"
                    style={{ 
                      borderColor: RARITY_COLORS[opt.rarity]?.color ?? '#fff',
                      color: RARITY_COLORS[opt.rarity]?.color ?? '#fff'
                    }}
                  >
                    {RARITY_COLORS[opt.rarity]?.label ?? opt.rarity}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setPendingQuantityItem(null)}
                className="btn-pixel-gray text-[8px] py-2 uppercase"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {pendingMultiSelectItem && createPortal(
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[12000] p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setPendingMultiSelectItem(null); }}
        >
          <div className="card-pixel w-full max-w-[520px] bg-quest-bg border border-quest-border relative p-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-xs text-quest-cyan uppercase font-pixel tracking-widest">
                  {pendingMultiSelectItem.icon} {pendingMultiSelectItem.name}
                </div>
                <div className="text-[10px] text-quest-textDim font-pixel uppercase">
                  {pendingMultiSelectItem.desc}
                </div>
                <div className="text-[8px] text-quest-cyan mt-1 uppercase font-pixel">
                  Seleccionados: {selectedHabits.length}/{pendingMultiSelectItem.requiredCount}
                </div>
              </div>
              <button
                onClick={() => setPendingMultiSelectItem(null)}
                className="btn-pixel-gray py-1 px-3 text-[10px]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {habits.map(habit => {
                const isSelected = selectedHabits.includes(habit.id);
                const effectiveMult = getEffectiveMultiplierForHabit(habit);
                const hasGem = hasPermanentMultiplierGem(habit.id, activeEffects);
                
                return (
                  <label 
                    key={habit.id} 
                    className={`w-full flex items-center gap-3 p-3 border text-left text-[10px] font-pixel uppercase rounded-md cursor-pointer transition-all ${
                      isSelected ? 'border-quest-cyan bg-quest-cyan/10 ring-1 ring-quest-cyan/30' : 'border-quest-border hover:border-quest-cyan/50 hover:bg-quest-cyan/5'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleHabitToggle(habit.id)}
                      disabled={!isSelected && selectedHabits.length >= pendingMultiSelectItem.requiredCount}
                      className="w-4 h-4 rounded-sm border-quest-border bg-quest-bg text-quest-cyan focus:ring-quest-cyan focus:ring-offset-0 cursor-pointer accent-quest-cyan"
                    />
                    <span className="text-xl">{habit.emoji}</span>
                    <div className="flex-1 truncate">
                      <div className="truncate text-quest-text">{habit.name}</div>
                      <div className="text-[8px] text-quest-textDim flex items-center gap-1">
                        {hasGem && <span title="Gema del Multiplicador activa">💠</span>}
                        <span>×{effectiveMult.toFixed(1)}</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex justify-between items-center mt-5">
              <button
                onClick={() => setPendingMultiSelectItem(null)}
                className="btn-pixel-gray text-[8px] py-2 px-4 uppercase"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmMultiSelect}
                disabled={selectedHabits.length !== pendingMultiSelectItem.requiredCount}
                className="btn-pixel-cyan text-[8px] py-2 px-6 uppercase disabled:opacity-50 disabled:cursor-not-allowed shadow-pixel-sm"
              >
                FUSIONAR HÁBITOS
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
