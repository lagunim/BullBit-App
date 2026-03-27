/**
 * DailyRewardFlow - Flujo de recompensas de misión diaria
 *
 * Gestiona la visualización de recompensas al completar una misión diaria.
 * Muestra un modal con los objetos recibidos según la dificultad de la misión.
 *
 * @component
 * @returns {JSX.Element|null} Modal de recompensa diaria o null si no hay recompensa pendiente
 */
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import useGameStore from '../../store/gameStore.js';
import { getItemById } from '../../lib/itemsCatalog.js';

/**
 * DailyRewardModal - Modal de visualización de recompensas diarias
 *
 * Muestra los objetos recibidos al completar una misión diaria.
 * Los objetos ya han sido otorgados automáticamente según la dificultad.
 *
 * @component
 * @param {Object} props
 * @param {string} props.dailyName - Nombre de la misión diaria
 * @param {Array} props.grantedItems - Array de IDs de objetos recibidos
 * @param {number} props.points - Puntos recibidos
 * @param {Function} props.onAccept - Función llamada al aceptar
 * @returns {JSX.Element} Modal de visualización de recompensas
 */
function DailyRewardModal({ dailyName, grantedItems = [], points, onAccept }) {
  const itemsCatalog = useGameStore(s => s.itemsCatalog ?? {});
  const [confirming, setConfirming] = useState(false);

  function handleAccept() {
    if (confirming) return;
    setConfirming(true);
    setTimeout(() => {
      onAccept();
    }, 260);
  }

  // Obtiene los objetos del catálogo
  const items = grantedItems.map(id => getItemById(itemsCatalog, id)).filter(Boolean);

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
          <p className="text-quest-gold text-xs font-pixel mt-2">
            +{points} pts
          </p>
        </div>

        {items.length > 0 ? (
          <div className="flex flex-col gap-4">
            <p className="text-center text-gray-400 text-[10px] font-pixel mb-2">
              Has recibido los siguientes objetos:
            </p>
            {items.map(item => (
              <div
                key={item.id}
                className="text-left p-4 border-2 bg-gradient-to-r from-quest-goldDark/20 to-quest-gold/5 border-quest-gold/50 card-pixel"
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
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-400 text-[10px] font-pixel">
              No has recibido objetos en esta misión.
            </p>
          </div>
        )}

        <div className="flex items-center justify-center">
          <button
            onClick={handleAccept}
            disabled={confirming}
            className="btn-pixel text-[10px] px-6 py-2 w-full bg-quest-gold text-black"
          >
            {confirming ? 'ACEPTANDO...' : 'ACEPTAR'}
          </button>
        </div>
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
    <DailyRewardModal
      dailyName={pendingReward.dailyName}
      grantedItems={pendingReward.grantedItems}
      points={pendingReward.points}
      onAccept={claimDailyItem}
    />
  );
}
