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
  const [visible, setVisible] = useState(false);
  const [chosen, setChosen] = useState(null);
  const [confirming, setConfirming] = useState(false);

  // Animación de entrada al montar el componente
  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Selecciona un objeto
  function handlePick(itemId) {
    if (confirming) return;
    setChosen(itemId);
  }

  // Confirma la selección y cierra el modal
  function handleConfirm() {
    if (!chosen || confirming) return;
    setConfirming(true);
    setVisible(false);
    setTimeout(() => {
      onClaim(chosen);
    }, 260);
  }

  // Obtiene los objetos del catálogo
  const items = itemChoices.map(id => ITEMS[id]).filter(Boolean);
  const selectedItem = items.find(item => item.id === chosen) ?? null;

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

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={`w-full max-w-xl bg-quest-card border border-quest-gold shadow-[0_0_60px_rgba(0,0,0,0.7)] transformation ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} transition-all duration-300`}
        style={{ borderWidth: 3 }}>
        <div className="px-6 py-5 text-center">
          <h3 className="text-xs uppercase tracking-[0.35em] text-quest-gold mb-1">Daily completado</h3>
          <p className="font-pixel text-[10px] leading-tight text-quest-text">{dailyName}</p>
        </div>
        <div className="flex gap-3 px-5 pb-4">
          {items.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => handlePick(item.id)}
              className={`flex-1 border-2 p-4 text-center transition-all card-pixel ${chosen === item.id ? 'border-quest-gold shadow-[0_0_0_1px_rgba(255,215,0,0.3)]' : 'border-quest-border hover:border-quest-gold/70'}`}
              style={{ background: 'rgba(10,10,10,0.7)' }}
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="font-pixel text-[8px] text-quest-text">{item.name}</div>
            </button>
          ))}
        </div>

        <div className="px-5 pb-5">
          {selectedItem ? (
            <div className="card-pixel border-2 border-quest-border bg-black/40 p-3">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="font-pixel text-[10px] text-quest-gold uppercase tracking-wider">Objeto seleccionado</p>
                  <p className="font-pixel text-[11px] text-quest-text truncate">{selectedItem.icon} {selectedItem.name}</p>
                </div>
                <span className={`font-pixel text-[8px] border px-2 py-1 uppercase ${rarityClass[selectedItem.rarity] ?? 'text-quest-textDim border-quest-border'}`}>
                  {rarityLabel[selectedItem.rarity] ?? selectedItem.rarity}
                </span>
              </div>

              <p className="text-[10px] text-quest-textDim leading-relaxed mb-3">{selectedItem.desc}</p>

              <div className="grid grid-cols-2 gap-2 text-[9px] font-pixel">
                <div className="border border-quest-border px-2 py-1 text-quest-textDim">
                  Tipo: <span className="text-quest-text">{effectTypeLabel[selectedItem.effectType] ?? selectedItem.effectType}</span>
                </div>
                <div className="border border-quest-border px-2 py-1 text-quest-textDim">
                  Valor: <span className="text-quest-text">{selectedItem.effectValue ?? 0}</span>
                </div>
                {selectedItem.durationDays ? (
                  <div className="border border-quest-border px-2 py-1 text-quest-textDim col-span-2">
                    Duración: <span className="text-quest-text">{selectedItem.durationDays} día(s)</span>
                  </div>
                ) : (
                  <div className="border border-quest-border px-2 py-1 text-quest-textDim col-span-2">
                    Duración: <span className="text-quest-text">Inmediata</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card-pixel border-2 border-quest-border bg-black/30 p-3 text-center font-pixel text-[9px] text-quest-textDim">
              Selecciona un objeto para ver su información.
            </div>
          )}
        </div>

        <div className="flex items-center justify-center px-6 pb-6">
          <button
            onClick={handleConfirm}
            disabled={!chosen}
            className={`btn-pixel text-[10px] px-6 py-2 ${chosen ? 'bg-quest-gold text-black' : 'opacity-40 cursor-not-allowed'}`}
          >
            {confirming ? 'RECLAMANDO...' : 'RECLAMAR OBJETO'}
          </button>
        </div>
      </div>
    </div>
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
