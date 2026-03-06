import { createPortal } from 'react-dom';
import { ITEMS, RARITY_COLORS } from '../data/items.js';

function getItemFromEffect(effect) {
  if (effect.itemId && ITEMS[effect.itemId]) {
    return ITEMS[effect.itemId];
  }
  const itemByKey = Object.values(ITEMS).find(item => item.effectKey === effect.key);
  return itemByKey || null;
}

function getEffectDescription(effect) {
  const item = getItemFromEffect(effect);
  if (item) return item.desc;

  switch (effect.key) {
    case 'double_points': return 'Duplica todos los puntos ganados.';
    case 'next_triple': return effect.targetHabitId 
      ? `Triplica los puntos del hábito objetivo en su próxima completación.`
      : 'Triplica los puntos del próximo hábito completado.';
    case 'global_mult_boost': return 'Aumenta todos los multiplicadores.';
    case 'streak_shield': return 'Protege tu multiplicador de una penalización.';
    case 'golden_shield': return 'El siguiente fallo no penaliza y suma +0.2.';
    case 'reduced_penalty': return 'Reduce la penalización por fallo.';
    default: return effect.key;
  }
}

function getEffectTypeLabel(effectType) {
  switch (effectType) {
    case 'timed': return 'TEMPORAL';
    case 'passive': return 'PASIVO';
    case 'instant': return 'INSTANTÁNEO';
    default: return 'DESCONOCIDO';
  }
}

export default function ActiveEffectModal({ effect, onClose }) {
  if (!effect) return null;

  const item = getItemFromEffect(effect);
  const rarity = item ? RARITY_COLORS[item.rarity] : { color: '#888', label: 'UNKNOWN' };
  const effectType = item?.effectType || 'unknown';

  const expiresAt = effect.expiresAt ? new Date(effect.expiresAt) : null;
  const now = new Date();
  const timeLeft = expiresAt
    ? Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)))
    : null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4 backdrop-blur-sm shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="anim-fade-in card-pixel w-full max-w-[380px] max-h-[calc(100dvh-60px)] overflow-y-auto flex flex-col gap-4 !p-5 border-quest-gold shadow-[4px_4px_0_theme(colors.quest.goldDark)]">
        {/* Title */}
        <div className="flex justify-between items-center border-b border-quest-border pb-3">
          <div className="text-sm text-quest-gold font-pixel uppercase tracking-widest flex items-center gap-2">
            <span className="animate-pulse">◆</span> Efecto Activo
          </div>
          <button onClick={onClose} className="btn-pixel-gray !py-2 !px-3 !text-sm">✕</button>
        </div>

        {/* Icon & Name */}
        <div className="flex items-start gap-4">
          <div className="text-3xl p-3 rounded-lg border bg-quest-panel border-quest-cyan/30 shrink-0">
            {item?.icon || '✨'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm md:text-base font-bold text-white font-pixel break-words leading-tight">
              {effect.itemName || item?.name || effect.key}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[8px] font-pixel px-1.5 py-0.5 border uppercase tracking-wider font-bold"
                style={{ borderColor: rarity.color, color: rarity.color, background: `${rarity.color}11` }}>
                {rarity.label}
              </span>
              <span className="text-[8px] font-pixel text-quest-cyan">
                {getEffectTypeLabel(effectType)}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-quest-bg/50 p-3 rounded-lg border border-quest-border">
          <p className="text-xs text-gray-300 font-pixel leading-relaxed">
            {getEffectDescription(effect)}
          </p>
        </div>

        {/* Effect Details */}
        <div className="grid grid-cols-2 gap-3">
          {effect.value !== undefined && (
            <div className="bg-quest-panel/50 p-2 rounded border border-quest-border">
              <div className="text-[10px] text-quest-textMuted font-pixel uppercase mb-1">Valor</div>
              <div className="text-xs text-quest-cyan font-pixel">+{effect.value}</div>
            </div>
          )}
          {timeLeft !== null && (
            <div className="bg-quest-panel/50 p-2 rounded border border-quest-border">
              <div className="text-[10px] text-quest-textMuted font-pixel uppercase mb-1">Tiempo</div>
              <div className="text-xs text-quest-gold font-pixel">
                {timeLeft === 0 ? '<1 día' : `${timeLeft} día${timeLeft > 1 ? 's' : ''}`}
              </div>
            </div>
          )}
        </div>

        {/* Expiration Date */}
        {expiresAt && (
          <div className="text-center">
            <div className="text-[8px] text-quest-textMuted font-pixel">
              Expira el {expiresAt.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        )}

        {/* Hint */}
        <div className="text-center pt-2 border-t border-quest-border/50">
          <div className="text-xs text-quest-textMuted font-pixel">
            💡 Los efectos activos se aplican automáticamente
          </div>
        </div>

        {/* Close button */}
        <button onClick={onClose} className="btn-pixel-gold w-full uppercase font-bold tracking-widest mt-1 !py-2 !text-xs">
          Cerrar
        </button>
      </div>
    </div>,
    document.body
  );
}
