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
import { getHabitMultiplierCap, hasPermanentMultiplierGem } from '../utils/gameLogic.js';

/**
 * Mapeo de iconos y colores para cada tipo de efecto de multiplicador
 * Cada efecto tiene un icono representativo, título descriptivo y color
 */
const EFFECT_ICONS = {
  streak_shield: { icon: '🛡️', title: 'Escudo de Racha activo - Protege de penalizaciones', color: 'text-quest-cyan' },
  golden_shield: { icon: '⭐', title: 'Racha Dorada activa - El próximo fallo no te penaliza y suma +0.2', color: 'text-quest-gold' },
  balance_shield: { icon: '⚖️', title: 'Amuleto de Equilibrio activo - El multiplicador no baja al fallar', color: 'text-quest-cyan' },
  global_mult_boost: { icon: '⚗️', title: 'Poción de Impulso activa - +1.0 a todos los multiplicadores', color: 'text-quest-green' },
  reduced_penalty: { icon: '🛡️', title: 'Amuleto de Constancia activo - Fallos solo penalizan -0.2', color: 'text-quest-green' },
  double_points: { icon: '✨', title: 'Elixir del Doble activo - Puntos duplicados', color: 'text-purple-400' },
  triple_points: { icon: '🌟', title: 'Pergamino de XP activo - Puntos triplicados', color: 'text-purple-400' },
  next_triple: { icon: '🔺', title: 'Piedra de Poder activa - 3x puntos en hábito específico', color: 'text-purple-400' },
  habit_mult_boost: { icon: '🎯', title: 'Elixir de Enfoque activo - +1.0 al multiplicador de este hábito', color: 'text-quest-green' },
  perm_base_mult: { icon: '💠', title: 'Gema del Multiplicador activa - Este hábito puede llegar a ×4', color: 'text-quest-gold' },
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

export function useEffectiveMultiplier(habitId, baseMultiplier = 1) {
  const rawEffects = useGameStore(s => s.activeEffects ?? []);
  const now = new Date();
  const activeEffects = rawEffects.filter(e =>
    !e.expiresAt || new Date(e.expiresAt) > now
  );

  let effectiveMultiplier = baseMultiplier;

  const globalBoostEffect = activeEffects.find(e => e.key === 'global_mult_boost');
  if (globalBoostEffect) {
    effectiveMultiplier += globalBoostEffect.value || 1.0;
  }

  const habitBoostEffect = activeEffects.find(e =>
    e.key === 'habit_mult_boost' &&
    (!e.targetHabitId || e.targetHabitId === habitId)
  );
  if (habitBoostEffect) {
    effectiveMultiplier += habitBoostEffect.value || 1.0;
  }

  const multiplierCap = getHabitMultiplierCap(habitId, activeEffects);
  return Math.min(multiplierCap, effectiveMultiplier);
}

export function useHasMultiplierGem(habitId) {
  const rawEffects = useGameStore(s => s.activeEffects ?? []);
  const now = new Date();
  const activeEffects = rawEffects.filter(e =>
    !e.expiresAt || new Date(e.expiresAt) > now
  );

  return hasPermanentMultiplierGem(habitId, activeEffects);
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

  // 1. Escudos y Protecciones (Prioridad 1)
  const shieldKeys = ['golden_shield', 'balance_shield', 'streak_shield'];
  shieldKeys.forEach(key => {
    if (activeEffects.some(e => e.key === key)) {
      icons.push(EFFECT_ICONS[key]);
    }
  });

  // 2. Impulsos de Multiplicador (Prioridad 2)
  if (activeEffects.some(e => e.key === 'global_mult_boost')) {
    icons.push(EFFECT_ICONS['global_mult_boost']);
  }

  if (activeEffects.some(e => e.key === 'reduced_penalty')) {
    icons.push(EFFECT_ICONS['reduced_penalty']);
  }

  // 3. Impulsos de Puntos (Prioridad 3)
  const pointBoostKeys = ['triple_points', 'double_points', 'next_triple'];
  pointBoostKeys.forEach(key => {
    if (activeEffects.some(e => e.key === key && !e.targetHabitId)) {
      icons.push(EFFECT_ICONS[key]);
    }
  });

  if (icons.length === 0) return null;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {icons.map((effect, index) => (
        <span
          key={`${effect.icon}-${index}`}
          className={`text-[11px] ${effect.color} animate-pulse drop-shadow-sm`}
          title={effect.title}
        >
          {effect.icon}
        </span>
      ))}
    </div>
  );
}
