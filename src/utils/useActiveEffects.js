import useGameStore from '../store/gameStore.js';

const EFFECT_ICONS = {
  streak_shield: { icon: '🛡️', title: 'Escudo de Racha activo - Protege de penalizaciones', color: 'text-quest-cyan' },
  golden_shield: { icon: '⭐', title: 'Racha Dorada activa - El próximo fallo no te penaliza y suma +0.2', color: 'text-quest-gold' },
  balance_shield: { icon: '⚖️', title: 'Amuleto de Equilibrio activo - El multiplicador no baja al fallar', color: 'text-quest-cyan' },
  global_mult_boost: { icon: '📈', title: 'Poción de Impulso activa - +1.0 a todos los multiplicadores', color: 'text-quest-green' },
  reduced_penalty: { icon: '🛡️', title: 'Amuleto de Constancia activo - Fallos solo penalizan -0.2', color: 'text-quest-green' },
  double_points: { icon: '✨', title: 'Elixir del Doble activo - Puntos duplicados', color: 'text-purple-400' },
  triple_points: { icon: '🌟', title: 'Pergamino de XP activo - Puntos triplicados', color: 'text-purple-400' },
  next_triple: { icon: '🔺', title: 'Piedra de Poder activa - Próximo hábito completado dará 3x puntos', color: 'text-purple-400' },
  habit_mult_boost: { icon: '🎯', title: 'Elixir de Enfoque activo - +1.0 al multiplicador de este hábito', color: 'text-quest-green' },
};

export function useActiveEffects() {
  const rawEffects = useGameStore(s => s.activeEffects ?? []);

  const now = new Date();
  const activeEffects = rawEffects.filter(e =>
    !e.expiresAt || new Date(e.expiresAt) > now
  );

  const hasShield = activeEffects.some(e =>
    e.key === 'streak_shield' || e.key === 'golden_shield' || e.key === 'balance_shield'
  );

  const hasGlobalBoost = activeEffects.some(e => e.key === 'global_mult_boost');
  const hasReducedPenalty = activeEffects.some(e => e.key === 'reduced_penalty');
  const hasPointsBoost = activeEffects.some(e =>
    (e.key === 'double_points' || e.key === 'triple_points' || e.key === 'next_triple') &&
    !e.targetHabitId // Only count global effects
  );

  const globalBoostValue = activeEffects.find(e => e.key === 'global_mult_boost')?.value || 0;
  const reducedPenaltyValue = activeEffects.find(e => e.key === 'reduced_penalty')?.value || 0.4;

  const getEffectIcons = () => {
    const icons = [];

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

    return icons;
  };

  return {
    activeEffects,
    hasShield,
    hasGlobalBoost,
    hasReducedPenalty,
    hasPointsBoost,
    globalBoostValue,
    reducedPenaltyValue,
    getEffectIcons,
  };
}
