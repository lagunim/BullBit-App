/**
 * ActiveEffectModal - Modal de detalles de efecto activo
 * 
 * Muestra información detallada sobre un efecto activo:
 * - Nombre y icono del objeto/efecto
 * - Rareza del efecto
 * - Descripción del efecto
 * - Valor numérico si aplica
 * - Tiempo restante (para efectos temporales)
 * - Fecha de expiración
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.effect - Efecto activo (o el primero del grupo). Si incluye `effectInstances` (array),
 *   el modal muestra la unión de hábitos y el detalle de cada instancia.
 * @param {Function} props.onClose - Función para cerrar el modal
 * @returns {JSX.Element|null} Modal de efecto activo o null si no hay efecto
 */
import { createPortal } from 'react-dom';
import useGameStore from '../../store/gameStore.js';
import { findItemByEffect, getItemById, RARITY_COLORS } from '../../lib/itemsCatalog.js';

/**
 * Obtiene el objeto ITEMS correspondiente a un efecto activo
 * Busca por itemId o por effectKey en el catálogo de objetos
 * 
 * @param {Object} effect - Objeto del efecto activo
 * @returns {Object|null} Objeto del catálogo o null si no se encuentra
 */
function getItemFromEffect(itemsCatalog, effect) {
  if (effect.itemId) {
    const item = getItemById(itemsCatalog, effect.itemId);
    if (item) return item;
  }

  return findItemByEffect(itemsCatalog, effect);
}

/**
 * Genera una descripción legible para un efecto activo
 * Utiliza la descripción del objeto o genera una según el tipo de efecto
 * 
 * @param {Object} effect - Objeto del efecto activo
 * @returns {string} Descripción del efecto
 */
function getEffectDescription(itemsCatalog, effect) {
  const item = getItemFromEffect(itemsCatalog, effect);
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

/**
 * Obtiene la etiqueta del tipo de efecto
 * 
 * @param {string} effectType - Tipo de efecto (timed, passive, instant)
 * @returns {string} Etiqueta formateada del tipo de efecto
 */
function getEffectTypeLabel(effectType) {
  switch (effectType) {
    case 'timed': return 'TEMPORAL';
    case 'passive': return 'PASIVO';
    case 'instant': return 'INSTANTÁNEO';
    default: return 'DESCONOCIDO';
  }
}

/** Instancias del mismo efecto (p. ej. varios escudos en distintos hábitos) */
function getEffectInstances(effect) {
  if (Array.isArray(effect.effectInstances) && effect.effectInstances.length > 0) {
    return effect.effectInstances;
  }
  return [effect];
}

function collectTargetHabitIds(instances) {
  const ids = new Set();
  for (const e of instances) {
    if (e.targetHabitId) ids.add(e.targetHabitId);
    if (Array.isArray(e.targetHabitIds)) {
      for (const id of e.targetHabitIds) ids.add(id);
    }
  }
  return ids;
}

function daysLeftUntil(expiresAt) {
  if (!expiresAt) return null;
  const end = new Date(expiresAt);
  const now = new Date();
  return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
}

export default function ActiveEffectModal({ effect, onClose }) {
  if (!effect) return null;
  const itemsCatalog = useGameStore(s => s.itemsCatalog ?? {});
  const habits = useGameStore(s => s.habits ?? []);

  const instances = getEffectInstances(effect);
  const primary = instances[0];

  // Obtiene el objeto del catálogo y la rareza (primera instancia representa al grupo)
  const item = getItemFromEffect(itemsCatalog, primary);
  const rarity = item ? RARITY_COLORS[item.rarity] : { color: '#888', label: 'UNKNOWN' };
  const effectType = item?.effectType || 'unknown';

  const habitIdSet = collectTargetHabitIds(instances);
  const targetHabits = [...habitIdSet].map(id => {
    const h = habits.find(x => x.id === id);
    return h ?? { id, name: '(Hábito ya no existe)', emoji: '❓' };
  }).sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

  const anyTargeted = instances.some(e => e.targetHabitId || (Array.isArray(e.targetHabitIds) && e.targetHabitIds.length));
  const showGlobalScope = !anyTargeted;

  const expiresDates = instances.map(e => e.expiresAt).filter(Boolean);
  const uniqueExpireIso = [...new Set(expiresDates)];
  const expiresAt = uniqueExpireIso.length === 1 ? new Date(uniqueExpireIso[0]) : null;
  const now = new Date();
  const timeLeft = expiresAt
    ? Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)))
    : null;

  const definedValues = instances.map(e => e.value).filter(v => v !== undefined && v !== null);
  const singleSharedValue = definedValues.length === instances.length && definedValues.length > 0
    && definedValues.every(v => v === definedValues[0])
    ? definedValues[0]
    : null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4 backdrop-blur-sm shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="anim-fade-in card-pixel w-full max-w-[380px] max-h-[calc(100dvh-60px)] overflow-y-auto flex flex-col gap-4 !p-5 border-quest-gold shadow-[4px_4px_0_theme(colors.quest.goldDark)]">
        {/* Title */}
        <div className="flex justify-between items-center border-b border-quest-border pb-3">
          <h2 className="text-sm text-quest-gold font-pixel uppercase tracking-widest flex items-center gap-2">
            <span className="animate-pulse">◆</span> Efecto Activo
          </h2>
          <button onClick={onClose} className="btn-pixel-gray !py-2 !px-3 !text-sm">✕</button>
        </div>

        {/* Icon & Name */}
        <div className="flex items-start gap-4">
          <div className="text-3xl p-3 rounded-lg border bg-quest-panel border-quest-cyan/30 shrink-0">
            {item?.icon || '✨'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm md:text-base font-bold text-white font-pixel break-words leading-tight">
              {primary.itemName || item?.name || primary.key}
              {instances.length > 1 && (
                <span className="ml-2 text-[10px] text-quest-gold font-pixel align-middle">
                  ({instances.length} activos)
                </span>
              )}
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
            {getEffectDescription(itemsCatalog, primary)}
          </p>
        </div>

        {/* Alcance: hábitos concretos o global */}
        {targetHabits.length > 0 && (
          <div className="bg-quest-panel/30 p-3 rounded-lg border border-quest-cyan/20">
            <div className="text-[10px] text-quest-cyan font-pixel uppercase mb-2 flex items-center gap-1.5">
              <span className="animate-pulse">▶</span> Aplicado en ({targetHabits.length} hábito{targetHabits.length !== 1 ? 's' : ''}):
            </div>
            <div className="flex flex-wrap gap-2">
              {targetHabits.map(h => (
                <div key={h.id} className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded border border-quest-border/50">
                  <span className="text-xs">{h.emoji}</span>
                  <span className="text-[10px] text-white font-pixel truncate max-w-[140px]">{h.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {showGlobalScope && (
          <div className="bg-quest-panel/30 p-3 rounded-lg border border-quest-purple/25">
            <div className="text-[10px] text-quest-purple font-pixel uppercase mb-1">Alcance</div>
            <p className="text-[10px] text-gray-300 font-pixel leading-relaxed">
              Este efecto no está ligado a un hábito concreto: se aplica a toda tu rutina (todos los hábitos).
            </p>
          </div>
        )}

        {/* Detalle por cada instancia cuando hay más de una o conviene listar caducidad */}
        {instances.length > 1 && (
          <div className="bg-quest-bg/50 p-3 rounded-lg border border-quest-border">
            <div className="text-[10px] text-quest-gold font-pixel uppercase mb-2">Detalle de cada activación</div>
            <ul className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {instances.map((inst, idx) => {
                const hid = inst.targetHabitId;
                const habit = hid
                  ? (habits.find(h => h.id === hid) ?? { emoji: '❓', name: '(Hábito ya no existe)' })
                  : null;
                const dLeft = daysLeftUntil(inst.expiresAt);
                return (
                  <li
                    key={`${idx}-${hid ?? 'g'}-${inst.expiresAt ?? ''}`}
                    className="text-[9px] font-pixel border border-quest-border/40 rounded p-2 bg-black/25 text-gray-300"
                  >
                    <span className="text-quest-cyan">#{idx + 1}</span>
                    {' · '}
                    {habit ? (
                      <span>{habit.emoji} {habit.name}</span>
                    ) : (
                      <span className="text-quest-textMuted">Global</span>
                    )}
                    {inst.expiresAt && (
                      <span className="block mt-1 text-quest-textMuted">
                        Expira: {new Date(inst.expiresAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {dLeft !== null && ` · ${dLeft === 0 ? 'Menos de un día restante' : dLeft === 1 ? '1 día restante' : `${dLeft} días restantes`}`}
                      </span>
                    )}
                    {inst.value !== undefined && inst.value !== null && (
                      <span className="block mt-0.5 text-quest-cyan">Valor: +{inst.value}</span>
                    )}
                    {inst.usesRemaining !== undefined && inst.usesRemaining !== null && (
                      <span className="block mt-0.5 text-quest-orange">Usos restantes: {inst.usesRemaining}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Effect Details */}
        <div className="grid grid-cols-2 gap-3">
          {singleSharedValue !== null && (
            <div className="bg-quest-panel/50 p-2 rounded border border-quest-border">
              <div className="text-[10px] text-quest-textMuted font-pixel uppercase mb-1">Valor</div>
              <div className="text-xs text-quest-cyan font-pixel">+{singleSharedValue}</div>
            </div>
          )}
          {timeLeft !== null && instances.length === 1 && (
            <div className="bg-quest-panel/50 p-2 rounded border border-quest-border">
              <div className="text-[10px] text-quest-textMuted font-pixel uppercase mb-1">Tiempo</div>
              <div className="text-xs text-quest-gold font-pixel">
                {timeLeft === 0 ? '<1 día' : `${timeLeft} día${timeLeft > 1 ? 's' : ''}`}
              </div>
            </div>
          )}
          {timeLeft !== null && instances.length > 1 && uniqueExpireIso.length === 1 && (
            <div className="bg-quest-panel/50 p-2 rounded border border-quest-border">
              <div className="text-[10px] text-quest-textMuted font-pixel uppercase mb-1">Tiempo (todas)</div>
              <div className="text-xs text-quest-gold font-pixel">
                {timeLeft === 0 ? '<1 día' : `${timeLeft} día${timeLeft > 1 ? 's' : ''}`}
              </div>
            </div>
          )}
        </div>

        {/* Expiration Date */}
        {expiresAt && instances.length === 1 && (
          <div className="text-center">
            <div className="text-[8px] text-quest-textMuted font-pixel">
              Expira el {expiresAt.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        )}
        {expiresAt && instances.length > 1 && uniqueExpireIso.length === 1 && (
          <div className="text-center">
            <div className="text-[8px] text-quest-textMuted font-pixel">
              Todas las activaciones expiran el {expiresAt.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        )}
        {uniqueExpireIso.length > 1 && (
          <div className="text-center">
            <div className="text-[8px] text-quest-textMuted font-pixel">
              Hay varias fechas de expiración entre las activaciones; revisa el detalle arriba.
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
