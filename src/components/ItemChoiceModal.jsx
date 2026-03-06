import { useState, useEffect } from 'react';
import { ITEMS, RARITY_COLORS } from '../data/items.js';

/**
 * ItemChoiceModal — shows 3 item choices after completing a journey.
 * No close button; user MUST pick one item to proceed.
 *
 * Props:
 *   journeyNumber — number
 *   itemChoices   — [itemId, itemId, itemId]
 *   onClaim       — (chosenItemId) => void
 */
export default function ItemChoiceModal({ journeyNumber, itemChoices = [], onClaim }) {
  const [visible, setVisible] = useState(false);
  const [chosen, setChosen] = useState(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  function handlePick(itemId) {
    if (confirming) return;
    setChosen(itemId);
  }

  function handleConfirm() {
    if (!chosen || confirming) return;
    setConfirming(true);
    setVisible(false);
    setTimeout(() => onClaim(chosen), 280);
  }

  const items = itemChoices.map(id => ITEMS[id]).filter(Boolean);

  return (
    <>
      <style>{`
        @keyframes chest-open {
          0%   { transform: scale(0.7) translateY(30px); opacity: 0; }
          60%  { transform: scale(1.04) translateY(-4px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes item-card-in {
          from { transform: translateY(20px) scale(0.9); opacity: 0; }
          to   { transform: translateY(0)     scale(1);   opacity: 1; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 8px var(--rarity-glow, transparent); }
          50%       { box-shadow: 0 0 18px var(--rarity-glow, transparent); }
        }
        .chest-open-enter {
          animation: chest-open 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .item-card-in-1 { animation: item-card-in 0.3s ease 0.08s both; }
        .item-card-in-2 { animation: item-card-in 0.3s ease 0.15s both; }
        .item-card-in-3 { animation: item-card-in 0.3s ease 0.22s both; }
        .rarity-shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.12) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2.4s linear infinite;
        }
        .item-selected {
          animation: glow-pulse 1.2s ease infinite;
        }
        .choice-grid::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[650] flex items-end sm:items-center justify-center p-3 sm:p-4"
        style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(3px)' }}
      >
        {/* Panel */}
        <div
          className={`w-full max-w-sm flex flex-col gap-4 pb-[env(safe-area-inset-bottom)] ${visible ? 'chest-open-enter' : 'opacity-0'}`}
          style={{
            background: 'linear-gradient(180deg, #1a1005 0%, #0d0a04 100%)',
            border: '3px solid #a07830',
            boxShadow: '0 0 0 2px #0d0a04, 0 0 0 4px #5a3b00, 0 16px 48px rgba(0,0,0,0.9), 0 0 40px rgba(160,120,48,0.12)',
            padding: '20px 16px 18px',
          }}
        >
          {/* Header */}
          <div className="text-center">
            <div
              className="font-pixel text-[9px] tracking-[0.25em] mb-1"
              style={{ color: '#a07830' }}
            >
              ¡VIAJE {journeyNumber} COMPLETADO!
            </div>
            <div
              className="font-pixel text-[13px] tracking-wide"
              style={{
                color: '#f0c050',
                textShadow: '0 0 16px rgba(240,180,50,0.5)',
              }}
            >
              ELIGE TU RECOMPENSA
            </div>
            <div
              className="font-pixel text-[7px] mt-1"
              style={{ color: '#7a6030' }}
            >
              Selecciona uno de los tres objetos
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2 opacity-50">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, #a07830)' }} />
            <span className="font-pixel text-[8px]" style={{ color: '#a07830' }}>✦</span>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, #a07830, transparent)' }} />
          </div>

          {/* Item cards */}
          <div className="choice-grid flex gap-3 overflow-x-auto sm:overflow-visible justify-center">
            {items.map((item, idx) => {
              const rc = RARITY_COLORS[item.rarity] ?? RARITY_COLORS.common;
              const isChosen = chosen === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handlePick(item.id)}
                  className={`item-card-in-${idx + 1} relative flex flex-col items-center gap-2 p-3 transition-all duration-150 shrink-0 w-[88px] focus:outline-none`}
                  style={{
                    '--rarity-glow': rc.glow !== 'none' ? rc.glow : 'transparent',
                    border: isChosen ? `2px solid ${rc.color}` : '2px solid #3a2800',
                    background: isChosen
                      ? `linear-gradient(180deg, rgba(80,50,0,0.9), rgba(20,12,0,0.95))`
                      : 'linear-gradient(180deg, rgba(30,18,0,0.9), rgba(12,8,0,0.9))',
                    boxShadow: isChosen
                      ? `0 0 0 1px ${rc.color}44, 0 0 16px ${rc.color}55`
                      : 'none',
                    transform: isChosen ? 'translateY(-3px)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  {/* Shimmer overlay on hover */}
                  <div className="rarity-shimmer absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity" />

                  {/* Rarity label */}
                  <div
                    className="absolute top-0 left-0 right-0 font-pixel text-[5.5px] text-center py-[2px]"
                    style={{
                      background: `${rc.color}22`,
                      color: rc.color,
                      borderBottom: `1px solid ${rc.color}44`,
                    }}
                  >
                    {RARITY_COLORS[item.rarity]?.label ?? item.rarity.toUpperCase()}
                  </div>

                  {/* Icon */}
                  <div className="text-3xl mt-3" style={{ filter: isChosen ? `drop-shadow(0 0 6px ${rc.color})` : 'none' }}>
                    {item.icon}
                  </div>

                  {/* Name */}
                  <div
                    className="font-pixel text-[6.5px] text-center leading-tight"
                    style={{ color: isChosen ? rc.color : '#c8a86a' }}
                  >
                    {item.name}
                  </div>

                  {/* Selected checkmark */}
                  {isChosen && (
                    <div
                      className="absolute bottom-1 right-1 font-pixel text-[7px]"
                      style={{ color: rc.color }}
                    >
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Item description */}
          <div
            className="font-pixel text-[7px] text-center leading-relaxed px-2"
            style={{
              color: chosen ? '#c8a86a' : '#5a4020',
              minHeight: '2.4em',
              transition: 'color 0.2s',
            }}
          >
            {chosen ? ITEMS[chosen]?.desc : 'Pasa el cursor por un objeto para ver su descripción'}
          </div>

          {/* Confirm button */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!chosen || confirming}
            className="w-full font-pixel text-[9px] py-3 tracking-widest transition-all duration-150"
            style={{
              background: chosen
                ? 'linear-gradient(180deg, #5a3b00, #3a2800)'
                : 'linear-gradient(180deg, #1a1200, #110d00)',
              border: chosen ? '2px solid #a07830' : '2px solid #3a2800',
              color: chosen ? '#f0c050' : '#3a2800',
              boxShadow: chosen ? '0 2px 0 #1a0f00, 0 0 12px rgba(160,120,48,0.2)' : 'none',
              cursor: chosen ? 'pointer' : 'not-allowed',
              transform: confirming ? 'scale(0.97)' : 'none',
            }}
          >
            {confirming ? 'RECLAMANDO...' : chosen ? 'RECLAMAR OBJETO' : 'ELIGE UN OBJETO'}
          </button>

          {/* Mandatory note */}
          <div
            className="font-pixel text-[6px] text-center"
            style={{ color: '#5a4020' }}
          >
            Debes elegir un objeto para continuar
          </div>
        </div>
      </div>
    </>
  );
}
