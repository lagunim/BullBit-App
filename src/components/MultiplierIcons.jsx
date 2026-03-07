/**
 * MultiplierIcons - Componente para mostrar iconos de efectos activos
 * 
 * Muestra iconos visuales de los efectos que afectan al multiplicador
 * de puntos. Incluye:
 * - Escudos de racha (protegen de penalizaciones)
 * - Potenciadores globales (aumentan multiplicadores)
 * - Efectos de doble/triple puntos
 * - Efectos específicos por hábito
 * 
 * Proporciona tres exports:
 * - default: Muestra iconos de efectos globales
 * - useHasActiveMultiplierEffect: Hook para verificar efectos activos
 * - HabitTargetedIcons: Iconos específicos de un hábito
 * 
 * @component
 * @returns {JSX.Element|null} Iconos de efectos o null si no hay efectos
 */
import useGameStore from '../store/gameStore.js';

/**
 * Mapeo de iconos y colores para cada tipo de efecto de multiplicador
 * Cada efecto tiene un icono representativo, título descriptivo y color
 */
const EFFECT_ICONS = {
  streak_shield: { icon: '🛡️', title: 'Escudo de Racha activo - Protege de penalizaciones', color: 'text-quest-cyan' },
  golden_shield: { icon: '⭐', title: 'Racha Dorada activa - El próximo fallo no te penaliza y suma +0.2', color: 'text-quest-gold' },
  balance_shield: { icon: '⚖️', title: 'Amuleto de Equilibrio activo - El multiplicador no baja al fallar', color: 'text-quest-cyan' },
  global_mult_boost: { icon: '📈', title: 'Poción de Impulso activa - +1.0 a todos los multiplicadores', color: 'text-quest-green' },
  reduced_penalty: { icon: '🛡️', title: 'Amuleto de Constancia activo - Fallos solo penalizan -0.1', color: 'text-quest-green' },
  double_points: { icon: '✨', title: 'Elixir del Doble activo - Puntos duplicados', color: 'text-purple-400' },
  triple_points: { icon: '🌟', title: 'Pergamino de XP activo - Puntos triplicados', color: 'text-purple-400' },
  next_triple: { icon: '🔺', title: 'Piedra de Poder activa - 3x puntos en hábito específico', color: 'text-purple-400' },
  habit_mult_boost: { icon: '🎯', title: 'Elixir de Enfoque activo - +1.0 al multiplicador de este hábito', color: 'text-quest-green' },
};

/**
 * Verifica si hay efectos de multiplicador activos globalmente
 * Filtra los efectos por fecha de expiración y verifica las claves relevantes
 * 
 * @param {Array} rawEffects - Array de efectos crudos del store
 * @returns {boolean} True si hay algún efecto de multiplicador activo
 */
function hasActiveMultiplierEffect(rawEffects) {
  const now = new Date();
  const activeEffects = rawEffects.filter(e =>
    !e.expiresAt || new Date(e.expiresAt) > now
  );
  
  if (activeEffects.length === 0) return false;
  
  // Efectos que afectan al multiplicador globalmente
  return activeEffects.some(e => 
    e.key === 'streak_shield' || 
    e.key === 'golden_shield' || 
    e.key === 'balance_shield' ||
    e.key === 'global_mult_boost' ||
    e.key === 'reduced_penalty'
  );
}

/**
 * Hook personalizado para verificar efectos de multiplicador activos
 * Se suscribe al store para obtener efectos en tiempo real
 * 
 * @returns {boolean} True si hay efectos de multiplicador activos
 */
export function useHasActiveMultiplierEffect() {
  const rawEffects = useGameStore(s => s.activeEffects ?? []);
  return hasActiveMultiplierEffect(rawEffects);
}

export function useHabitTargetedEffects(habitId) {
  const rawEffects = useGameStore(s => s.activeEffects ?? []);
  const now = new Date();
  const activeEffects = rawEffects.filter(e =>
    !e.expiresAt || new Date(e.expiresAt) > now
  );
  
  return activeEffects.filter(e => e.targetHabitId === habitId);
}

export function HabitTargetedIcons({ habitId, className = '' }) {
  const targetedEffects = useHabitTargetedEffects(habitId);
  
  if (targetedEffects.length === 0) return null;
  
  const icons = [];
  
  targetedEffects.forEach(effect => {
    if (EFFECT_ICONS[effect.key]) {
      icons.push(EFFECT_ICONS[effect.key]);
    }
  });
  
  if (icons.length === 0) return null;
  
  return (
    <span className={`flex items-center gap-0.5 ${className}`}>
      {icons.map((effectIcon, index) => (
        <span
          key={index}
          className={`text-[10px] ${effectIcon.color} animate-pulse`}
          title={`${effectIcon.title} - Aplicado a este hábito`}
        >
          {effectIcon.icon}
        </span>
      ))}
    </span>
  );
}

export default function MultiplierIcons({ className = '' }) {
  const rawEffects = useGameStore(s => s.activeEffects ?? []);
  
  const now = new Date();
  const activeEffects = rawEffects.filter(e =>
    !e.expiresAt || new Date(e.expiresAt) > now
  );

  if (activeEffects.length === 0) return null;

  const icons = [];
  
  const hasShield = activeEffects.some(e => 
    e.key === 'streak_shield' || e.key === 'golden_shield' || e.key === 'balance_shield'
  );
  const hasGlobalBoost = activeEffects.some(e => e.key === 'global_mult_boost');
  const hasReducedPenalty = activeEffects.some(e => e.key === 'reduced_penalty');
  const hasPointsBoost = activeEffects.some(e => 
    (e.key === 'double_points' || e.key === 'triple_points' || e.key === 'next_triple') &&
    !e.targetHabitId // Only show global effects
  );
  
  if (hasShield) {
    const shieldEffect = activeEffects.find(e => 
      e.key === 'golden_shield' || e.key === 'balance_shield' || e.key === 'streak_shield'
    );
    if (shieldEffect && EFFECT_ICONS[shieldEffect.key]) {
      icons.push(EFFECT_ICONS[shieldEffect.key]);
    } else {
      icons.push(EFFECT_ICONS['streak_shield']);
    }
  }
  
  if (hasGlobalBoost) {
    icons.push(EFFECT_ICONS['global_mult_boost']);
  }
  
  if (hasReducedPenalty) {
    icons.push(EFFECT_ICONS['reduced_penalty']);
  }
  
  if (hasPointsBoost && !hasGlobalBoost) {
    const pointsEffect = activeEffects.find(e => 
      (e.key === 'triple_points' || e.key === 'double_points' || e.key === 'next_triple') &&
      !e.targetHabitId // Only show global effects
    );
    if (pointsEffect && EFFECT_ICONS[pointsEffect.key]) {
      icons.push(EFFECT_ICONS[pointsEffect.key]);
    }
  }

  if (icons.length === 0) return null;

  return (
    <span className={`flex items-center gap-0.5 ${className}`}>
      {icons.map((effect, index) => (
        <span
          key={index}
          className={`text-[10px] ${effect.color} animate-pulse`}
          title={effect.title}
        >
          {effect.icon}
        </span>
      ))}
    </span>
  );
}
