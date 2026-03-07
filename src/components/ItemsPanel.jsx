/**
 * ItemsPanel - Panel de visualización de objetos (legacy)
 * 
 * Este es un componente más simple de visualización de inventario
 * comparado con InventoryPanel. Muestra:
 * - Efectos activos actualmente
 * - Objetos poseídos con cantidad
 * - Catálogo completo de objetos
 * 
 * NOTA: Este componente parece ser una versión anterior.
 * Se recomienda usar InventoryPanel para funcionalidad completa.
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.inventory - Objeto con cantidades por itemId
 * @param {Array} props.activeEffects - Array de efectos activos
 * @param {Function} props.onUseItem - Función para usar un objeto
 * @returns {JSX.Element} Panel de objetos
 */
import { ITEMS, RARITY_COLORS, RARITY_BORDERS, RARITY_LABELS } from '../lib/items.js';

export default function ItemsPanel({ inventory, activeEffects, onUseItem }) {
  // Filtra solo los objetos con cantidad > 0
  const owned = Object.entries(inventory).filter(([,q]) => q > 0).map(([id,qty]) => ({ ...ITEMS[id], qty })).filter(Boolean);

  // Calcula el tiempo restante de un efecto
  // Convierte milisegundos a horas o días
  const timeLeft = (expiresAt) => {
    const ms = new Date(expiresAt) - new Date();
    const h = Math.floor(ms / 3600000);
    return h > 24 ? `${Math.floor(h/24)}d` : h > 0 ? `${h}h` : '<1h';
  };

  return (
    <div className="space-y-6">
      <h2 className="font-pixel text-[10px] text-quest-text">INVENTARIO</h2>

      {activeEffects.length > 0 && (
        <div>
          <h3 className="font-pixel text-[9px] glow-text-purple mb-3">⚡ EFECTOS ACTIVOS</h3>
          <div className="grid gap-2">
            {activeEffects.map((e, i) => {
              const item = Object.values(ITEMS).find(it => it.effectType === e.type);
              return (
                <div key={i} className="pixel-border-purple bg-quest-card p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item?.icon || '✨'}</span>
                    <div>
                      <div className="font-pixel text-[9px] glow-text-purple">{item?.name}</div>
                      <div className="font-pixel text-[7px] text-quest-textDim mt-0.5">{item?.description}</div>
                    </div>
                  </div>
                  <div className="font-pixel text-[8px] text-quest-gold flex-shrink-0">⏱ {timeLeft(e.expiresAt)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {owned.length > 0 ? (
        <div>
          <h3 className="font-pixel text-[9px] text-quest-textDim mb-3">🎒 OBJETOS [{owned.reduce((a,i)=>a+i.qty,0)}]</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {owned.map(item => (
              <div key={item.id} className={`${RARITY_BORDERS[item.rarity]} bg-quest-card p-4`}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl flex-shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`font-pixel text-[9px] ${RARITY_COLORS[item.rarity]}`}>{item.name}</div>
                    <div className="font-pixel text-[7px] text-quest-textDim mt-1 leading-relaxed">{item.description}</div>
                    <div className="flex gap-2 mt-2">
                      <span className={`font-pixel text-[7px] ${RARITY_COLORS[item.rarity]}`}>[x{item.qty}]</span>
                      <span className="font-pixel text-[7px] text-quest-textMuted">{RARITY_LABELS[item.rarity]}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => onUseItem(item.id)} className="pixel-btn pixel-btn-blue text-[9px] w-full py-2">▶ USAR</button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="pixel-border bg-quest-panel p-10 text-center">
          <p className="font-pixel text-quest-textMuted text-[10px] leading-loose">INVENTARIO VACÍO.<br/>CONSIGUE LOGROS<br/>PARA OBTENER OBJETOS.</p>
        </div>
      )}

      <div>
        <h3 className="font-pixel text-[9px] text-quest-textMuted mb-3">📖 CATÁLOGO</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.values(ITEMS).map(item => {
            const qty = inventory[item.id] || 0;
            return (
              <div key={item.id} className={`pixel-border bg-quest-bg p-3 ${qty > 0 ? '' : 'opacity-40'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <div className={`font-pixel text-[8px] ${RARITY_COLORS[item.rarity]}`}>{item.name} {qty > 0 && <span className="text-quest-text">[x{qty}]</span>}</div>
                    <div className="font-pixel text-[6px] text-quest-textMuted mt-0.5">{item.description}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
