/**
 * DailyRewardFlow - Flujo de recompensas de misión diaria
 * 
 * Gestiona la entrega de recompensas al completar una misión diaria.
 * Muestra un modal de selección si hay múltiples opciones de objetos,
 * o entrega automáticamente si solo hay una opción.
 * 
 * Componentes hijos:
 * - DailyItemChoiceModal: Modal de selección de objeto (si hay choices)
 * 
 * @component
 * @returns {JSX.Element|null} Modal de recompensa diaria o null si no hay recompensa pendiente
 */
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import useGameStore from '../store/gameStore.js';
import { ITEMS } from '../data/items.js';

/**
 * DailyItemChoiceModal - Modal de selección de objeto para recompensas diarias
 * 
 * Cuando una misión diaria tiene múltiples opciones de objetos,
 * este modal permite al jugador elegir cuál obtener.
 * 
 * @component
 * @param {Object} props
 * @param {string} props.dailyName - Nombre de la misión diaria
 * @param {Array} props.itemChoices - Array de IDs de objetos entre los que elegir
 * @param {Function} props.onClaim - Función llamada con el objeto seleccionado
 * @returns {JSX.Element} Modal de selección de objeto
 */
function DailyItemChoiceModal({ dailyName, itemChoices = [], onClaim }) {
  const [chosen, setChosen] = useState(null);
  const [confirming, setConfirming] = useState(false);

  function handlePick(itemId) {
    if (confirming) return;
    setChosen(itemId);
  }

  function handleConfirm() {
    if (!chosen || confirming) return;
    setConfirming(true);
    setTimeout(() => {
      onClaim(chosen);
    }, 260);
  }

  // Obtiene los objetos del catálogo
  const items = itemChoices.map(id => ITEMS[id]).filter(Boolean);

  const rarityLabel = {
    common: 'Común',
    rare: 'Raro',
    epic: 'Épico',
    legendary: 'Legendario',
  };

  const rarityClass = {
    common: 'text-quest-textDim border-quest-border',
    rare: 'text-cyan-300 border-cyan-400/60',
    epic: 'text-purple-300 border-purple-400/60',
    legendary: 'text-yellow-300 border-yellow-400/70',
  };

  const effectTypeLabel = {
    instant: 'Instantáneo',
    timed: 'Temporal',
    passive: 'Pasivo',
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[10000] p-4 backdrop-blur-sm">
      <div className="card-pixel w-full max-w-[480px] max-h-[calc(100dvh-60px)] overflow-y-auto flex flex-col gap-5 !p-6 border-quest-gold shadow-[4px_4px_0_theme(colors.quest.goldDark)]">
        <div className="text-center border-b border-quest-border pb-4">
          <h2 className="text-sm sm:text-xs text-quest-gold font-pixel uppercase tracking-widest flex items-center justify-center gap-2 mb-2">
            <span className="animate-pulse">🎁</span> Daily completado
          </h2>
          <p className="text-gray-400 text-[10px] sm:text-xs font-pixel">
            {dailyName}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {items.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => handlePick(item.id)}
              className={`text-left p-4 border-2 bg-gradient-to-r from-quest-goldDark/20 to-quest-gold/5 
                hover:scale-[1.02] transition-all duration-200 cursor-pointer card-pixel
                hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] group
                ${chosen === item.id ? 'border-quest-gold shadow-[0_0_20px_rgba(255,215,0,0.3)]' : 'border-quest-border'}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <h3 className="font-bold text-white text-sm font-pixel">{item.name}</h3>
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${rarityClass[item.rarity] ?? 'text-quest-textDim border-quest-border'}`}>
                      {rarityLabel[item.rarity] ?? item.rarity}
                    </span>
                  </div>
                </div>
                <span className={`text-quest-gold text-lg transition-all ${chosen === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>✓</span>
              </div>

              <p className="text-gray-300 text-[10px] sm:text-xs leading-relaxed mb-2">
                {item.desc}
              </p>

              <div className="flex items-center gap-3 pt-2 border-t border-quest-border/50 text-[9px] font-pixel">
                <div className="flex items-center gap-1">
                  <span className="text-purple-400 text-[10px]">Tipo:</span>
                  <span className="text-gray-300">{effectTypeLabel[item.effectType] ?? item.effectType}</span>
                </div>
                {item.durationDays && (
                  <div className="flex items-center gap-1">
                    <span className="text-purple-400 text-[10px]">Duración:</span>
                    <span className="text-gray-300">{item.durationDays} día(s)</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center">
          <button
            onClick={handleConfirm}
            disabled={!chosen}
            className={`btn-pixel text-[10px] px-6 py-2 w-full ${chosen ? 'bg-quest-gold text-black' : 'opacity-40 cursor-not-allowed'}`}
          >
            {confirming ? 'RECLAMANDO...' : 'RECLAMAR OBJETO'}
          </button>
        </div>

        <p className="text-center text-gray-500 text-[9px] font-pixel">
          Toca un objeto para seleccionarlo
        </p>
      </div>
    </div>,
    document.body
  );
}

export default function DailyRewardFlow() {
  const pendingReward = useGameStore(s => s.pendingDailyReward);
  const claimDailyItem = useGameStore(s => s.claimDailyItem);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (pendingReward) setMounted(true);
  }, [pendingReward]);

  if (!pendingReward) return null;

  return (
    <DailyItemChoiceModal
      dailyName={pendingReward.dailyName}
      itemChoices={pendingReward.itemChoices}
      onClaim={claimDailyItem}
    />
  );
}
