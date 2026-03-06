export const ACHIEVEMENTS = [
  // === PRIMEROS PASOS ===
  {
    id: 'first_habit',
    name: 'Primer Paso',
    desc: 'Completa tu primer hábito',
    icon: '👣',
    rarity: 'common',
    check: (state) => Object.values(state.history).some(day =>
      Object.values(day).includes('completed')
    ),
    reward: 'random_common',
    storyId: 'story_first_habit',
  },
  {
    id: 'first_habit_added',
    name: 'El Viaje Comienza',
    desc: 'Añade tu primer hábito',
    icon: '🌱',
    rarity: 'common',
    check: (state) => state.habits.length >= 1,
    reward: 'random_common',
    storyId: 'story_first_habit_added',
  },
  {
    id: 'three_habits',
    name: 'Multitarea',
    desc: 'Añade 3 hábitos distintos',
    icon: '🎯',
    rarity: 'common',
    check: (state) => state.habits.length >= 3,
    reward: 'random_common',
    storyId: 'story_three_habits',
  },

  // === RACHAS ===
  {
    id: 'streak_3',
    name: 'Tres en Raya',
    desc: 'Completa un hábito 3 días seguidos',
    icon: '🔥',
    rarity: 'common',
    check: (state) => state.habits.some(h => h.streak >= 3),
    reward: 'random_common',
    storyId: 'story_streak_3',
  },
  {
    id: 'streak_7',
    name: 'Semana Perfecta',
    desc: 'Completa un hábito 7 días seguidos',
    icon: '⚡',
    rarity: 'rare',
    check: (state) => state.habits.some(h => h.streak >= 7),
    reward: 'shield_of_streak',
    storyId: 'story_streak_7',
  },
  {
    id: 'streak_14',
    name: 'Quincena Imparable',
    desc: 'Completa un hábito 14 días seguidos',
    icon: '🌟',
    rarity: 'rare',
    check: (state) => state.habits.some(h => h.streak >= 14),
    reward: 'boost_potion',
    storyId: 'story_streak_14',
  },
  {
    id: 'streak_30',
    name: 'Mes de Hierro',
    desc: 'Completa un hábito 30 días seguidos',
    icon: '💎',
    rarity: 'epic',
    check: (state) => state.habits.some(h => h.streak >= 30),
    reward: 'double_elixir',
    storyId: 'story_streak_30',
  },
  {
    id: 'streak_100',
    name: 'Centurión',
    desc: 'Completa un hábito 100 días seguidos',
    icon: '🏛️',
    rarity: 'legendary',
    check: (state) => state.habits.some(h => h.streak >= 100),
    reward: 'multiplier_gem',
    storyId: 'story_streak_100',
  },

  // === TODOS LOS HÁBITOS ===
  {
    id: 'all_day',
    name: 'Día Completo',
    desc: 'Completa todos tus hábitos en un mismo día',
    icon: '🌈',
    rarity: 'rare',
    check: (state) => {
      if (state.habits.length < 2) return false;
      return Object.values(state.history).some(day =>
        state.habits.every(h => day[h.id] === 'completed')
      );
    },
    reward: 'random_rare',
    storyId: 'story_all_day',
  },
  {
    id: 'all_week',
    name: 'Guerrero Total',
    desc: 'Completa todos tus hábitos durante 7 días seguidos',
    icon: '⚔️',
    rarity: 'epic',
    check: (state) => state.globalStreak >= 7,
    reward: 'amulet_constancy',
    storyId: 'story_all_week',
  },
  {
    id: 'all_month',
    name: 'Constancia Total',
    desc: 'Completa todos tus hábitos durante 30 días seguidos',
    icon: '👑',
    rarity: 'legendary',
    check: (state) => state.globalStreak >= 30,
    reward: 'multiplier_gem',
    storyId: 'story_all_month',
  },

  // === MULTIPLICADORES ===
  {
    id: 'mult_2',
    name: 'Engranaje',
    desc: 'Consigue un multiplicador de x2.0 en cualquier hábito',
    icon: '⚙️',
    rarity: 'rare',
    check: (state) => state.habits.some(h => h.multiplier >= 2.0),
    reward: 'random_rare',
    storyId: 'story_mult_2',
  },
  {
    id: 'mult_3',
    name: 'Turbocargado',
    desc: 'Consigue un multiplicador de x3.0 en cualquier hábito',
    icon: '🚀',
    rarity: 'epic',
    check: (state) => state.habits.some(h => h.multiplier >= 3.0),
    reward: 'boost_potion',
    storyId: 'story_mult_3',
  },
  {
    id: 'mult_5',
    name: 'Modo Dios',
    desc: 'Consigue un multiplicador de x5.0 en cualquier hábito',
    icon: '🌌',
    rarity: 'legendary',
    check: (state) => state.habits.some(h => h.multiplier >= 5.0),
    reward: 'double_elixir',
    storyId: 'story_mult_5',
  },

  // === VIAJES ===
  {
    id: 'level_1',
    name: 'Iniciado',
    desc: 'Completa el Viaje 1',
    icon: '🥉',
    rarity: 'common',
    check: (state) => state.level >= 1,
    reward: 'shield_of_streak',
    storyId: 'story_level_1',
  },
  {
    id: 'level_2',
    name: 'Aventurero',
    desc: 'Completa el Viaje 2',
    icon: '🥈',
    rarity: 'rare',
    check: (state) => state.level >= 2,
    reward: 'random_rare',
    storyId: 'story_level_2',
  },
  {
    id: 'level_3',
    name: 'Maestro',
    desc: 'Completa el Viaje 3',
    icon: '🥇',
    rarity: 'epic',
    check: (state) => state.level >= 3,
    reward: 'double_elixir',
    storyId: 'story_level_3',
  },
  {
    id: 'level_5',
    name: 'Leyenda',
    desc: 'Completa el Viaje 5',
    icon: '🏆',
    rarity: 'legendary',
    check: (state) => state.level >= 5,
    reward: 'multiplier_gem',
    storyId: 'story_level_5',
  },

  // === COLECCIONISTA ===
  {
    id: 'collect_5',
    name: 'Coleccionista',
    desc: 'Consigue 5 objetos en tu inventario',
    icon: '🎒',
    rarity: 'rare',
    check: (state) => state.inventory.length >= 5,
    reward: 'random_rare',
    storyId: 'story_collect_5',
  },

  // === PUNTOS ===
  {
    id: 'points_1000',
    name: 'Mil Puntos',
    desc: 'Acumula 1000 puntos en total (histórico)',
    icon: '💯',
    rarity: 'common',
    check: (state) => state.lifetimePoints >= 1000,
    reward: 'random_common',
    storyId: 'story_points_1000',
  },
  {
    id: 'points_10000',
    name: 'Diez Mil',
    desc: 'Acumula 10,000 puntos en total (histórico)',
    icon: '💰',
    rarity: 'rare',
    check: (state) => state.lifetimePoints >= 10000,
    reward: 'random_rare',
    storyId: 'story_points_10000',
  },
  // === NUEVOS LOGROS - RACHAS LARGAS ===
  {
    id: 'streak_60',
    name: 'Seis Meses',
    desc: 'Completa un hábito 60 días seguidos',
    icon: '📅',
    rarity: 'legendary',
    check: (state) => state.habits.some(h => h.streak >= 60),
    reward: 'multiplier_gem',
    storyId: 'story_streak_60',
  },
  {
    id: 'streak_100_inv',
    name: 'Invencible',
    desc: 'Completa un hábito 100 días seguidos',
    icon: '🏛️',
    rarity: 'legendary',
    check: (state) => state.habits.some(h => h.streak >= 100),
    reward: 'multiplier_gem',
    storyId: 'story_streak_100_inv',
  },

  // === NUEVOS LOGROS - MULTIPLICADOR MÁXIMO ===
  {
    id: 'multiplier_3_max',
    name: 'Perfección',
    desc: 'Consigue un multiplicador de x3.0 en cualquier hábito',
    icon: '⚜️',
    rarity: 'epic',
    check: (state) => state.habits.some(h => h.multiplier >= 3.0),
    reward: 'boost_potion',
    storyId: 'story_multiplier_3_max',
  },

  // === NUEVOS LOGROS - VIAJES AVANZADOS ===
  {
    id: 'level_10',
    name: 'Maestro',
    desc: 'Completa el Viaje 10',
    icon: '🏅',
    rarity: 'epic',
    check: (state) => state.level >= 10,
    reward: 'multiplier_gem',
    storyId: 'story_level_10',
  },
  {
    id: 'level_20',
    name: 'Leyenda',
    desc: 'Completa el Viaje 20',
    icon: '👑',
    rarity: 'legendary',
    check: (state) => state.level >= 20,
    reward: 'multiplier_gem',
    storyId: 'story_level_20',
  },

  // === NUEVOS LOGROS - HÁBITOS MÚLTIPLES ===
  {
    id: 'habits_10',
    name: 'Ejército',
    desc: 'Ten 10 hábitos activos',
    icon: '💂',
    rarity: 'rare',
    check: (state) => state.habits.length >= 10,
    reward: 'random_rare',
    storyId: 'story_habits_10',
  },

  // === NUEVOS LOGROS - COMPLETACIONES TOTALES ===
  {
    id: 'completions_100',
    name: 'Centurión',
    desc: 'Completa 100 hábitos en total',
    icon: '💯',
    rarity: 'uncommon',
    check: (state) => {
      const total = Object.values(state.history).reduce((acc, day) => {
        return acc + Object.values(day).filter(s => s === 'completed' || s === 'partial' || s === 'over').length;
      }, 0);
      return total >= 100;
    },
    reward: 'random_uncommon',
    storyId: 'story_completions_100',
  },
  {
    id: 'completions_500',
    name: 'Guerrero',
    desc: 'Completa 500 hábitos en total',
    icon: '⚔️',
    rarity: 'rare',
    check: (state) => {
      const total = Object.values(state.history).reduce((acc, day) => {
        return acc + Object.values(day).filter(s => s === 'completed' || s === 'partial' || s === 'over').length;
      }, 0);
      return total >= 500;
    },
    reward: 'boost_potion',
    storyId: 'story_completions_500',
  },
  {
    id: 'completions_1000',
    name: 'Caballero',
    desc: 'Completa 1000 hábitos en total',
    icon: '🛡️',
    rarity: 'epic',
    check: (state) => {
      const total = Object.values(state.history).reduce((acc, day) => {
        return acc + Object.values(day).filter(s => s === 'completed' || s === 'partial' || s === 'over').length;
      }, 0);
      return total >= 1000;
    },
    reward: 'multiplier_gem',
    storyId: 'story_completions_1000',
  },

  // === NUEVOS LOGROS - PUNTOS EN PERIODO ===
  {
    id: 'points_day',
    name: 'Día Explosivo',
    desc: 'Consigue 100 puntos en un solo día',
    icon: '💥',
    rarity: 'uncommon',
    check: (state) => {
      const today = new Date().toISOString().split('T')[0];
      const dayHistory = state.history[today] || {};
      let points = 0;
      Object.entries(dayHistory).forEach(([habitId, status]) => {
        if (status === 'completed' || status === 'partial' || status === 'over') {
          const habit = state.habits.find(h => h.id === habitId);
          if (habit) {
            const minutes = status === 'partial' ? 15 : habit.minutes;
            points += minutes * habit.multiplier;
          }
        }
      });
      return points >= 100;
    },
    reward: 'random_uncommon',
    storyId: 'story_points_day',
  },
  {
    id: 'points_week',
    name: 'Semana Épica',
    desc: 'Consigue 500 puntos en una semana',
    icon: '🌟',
    rarity: 'rare',
    check: (state) => {
      let totalPoints = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const date = d.toISOString().split('T')[0];
        const dayHistory = state.history[date] || {};
        Object.entries(dayHistory).forEach(([habitId, status]) => {
          if (status === 'completed' || status === 'partial' || status === 'over') {
            const habit = state.habits.find(h => h.id === habitId);
            if (habit) {
              const minutes = status === 'partial' ? 15 : habit.minutes;
              totalPoints += minutes * habit.multiplier;
            }
          }
        });
      }
      return totalPoints >= 500;
    },
    reward: 'random_rare',
    storyId: 'story_points_week',
  },

  // === NUEVOS LOGROS - TODOS LOS HÁBITOS AL MÁXIMO ===
  {
    id: 'all_x2',
    name: 'Sincronía',
    desc: 'Consigue que todos tus hábitos tengan x2.0+ de multiplicador',
    icon: '🎭',
    rarity: 'epic',
    check: (state) => {
      if (state.habits.length < 2) return false;
      return state.habits.every(h => h.multiplier >= 2.0);
    },
    reward: 'random_epic',
    storyId: 'story_all_x2',
  },
  {
    id: 'all_max',
    name: 'Orquesta',
    desc: 'Consigue 5 hábitos con multiplicador x3.0',
    icon: '🎼',
    rarity: 'legendary',
    check: (state) => {
      return state.habits.filter(h => h.multiplier >= 3.0).length >= 5;
    },
    reward: 'random_legendary',
    storyId: 'story_all_max',
  },

  // === NUEVOS LOGROS - CONSISTENCIA EXTREMA ===
  {
    id: 'no_miss_30',
    name: 'Máquina',
    desc: 'No falles ningún hábito durante 30 días seguidos',
    icon: '🤖',
    rarity: 'legendary',
    check: (state) => state.globalStreak >= 30,
    reward: 'multiplier_gem',
    storyId: 'story_no_miss_30',
  },

  // === NUEVOS LOGROS - COLECCIONISMO ===
  {
    id: 'object_master',
    name: 'Coleccionista',
    desc: 'Usa todos los tipos de objetos disponibles',
    icon: '🎒',
    rarity: 'uncommon',
    check: (state) => {
      const uniqueItems = new Set(state.inventory.map(i => i.itemId));
      return uniqueItems.size >= 5;
    },
    reward: 'random_uncommon',
    storyId: 'story_object_master',
  },
  {
    id: 'early_achiever',
    name: 'Madrugador',
    desc: 'Desbloquea 5 logros',
    icon: '🌄',
    rarity: 'common',
    check: (state) => state.unlockedAchievements.length >= 5,
    reward: 'random_common',
    storyId: 'story_early_achiever',
  },

  {
    id: 'streak_broken_5',
    name: 'El Tropezón',
    desc: 'Rompe una racha de 5 días consecutivos',
    icon: '💔',
    rarity: 'uncommon',
    check: (state) => state.habits.some(h => h.lastStreakBroken === true && h.previousStreak >= 5),
    reward: 'random_uncommon',
    storyId: 'story_streak_broken_5',
  },

  {
    id: 'streak_failed_5',
    name: 'La Caída',
    desc: 'Falla un hábito 5 días seguidos',
    icon: '📉',
    rarity: 'uncommon',
    check: (state) => state.habits.some(h => h.failStreak >= 5),
    reward: 'random_uncommon',
    storyId: 'story_streak_failed_5',
  },

  {
    id: 'speed_runner_5',
    name: 'Rayo Veloz',
    desc: 'Completa un hábito 5 días seguidos por debajo del tiempo configurado',
    icon: '⚡',
    rarity: 'rare',
    check: (state) => state.habits.some(h => h.speedStreak >= 5),
    reward: 'boost_potion',
    storyId: 'story_speed_runner_5',
  },

  {
    id: 'overachiever_5',
    name: 'Sobreesforzo',
    desc: 'Completa un hábito 5 días seguidos por encima del tiempo configurado',
    icon: '🏃',
    rarity: 'rare',
    check: (state) => state.habits.some(h => h.overTimeStreak >= 5),
    reward: 'boost_potion',
    storyId: 'story_overachiever_5',
  },

];

export const RARITY_COLORS = {
  common: { color: '#a0a0c0', border: '#2a2a4a', label: 'COMÚN' },
  uncommon: { color: '#88ff88', border: '#226622', label: 'POCO COMÚN' },
  rare: { color: '#00e5ff', border: '#004466', label: 'RARO' },
  epic: { color: '#b44fff', border: '#330055', label: 'ÉPICO' },
  legendary: { color: '#ffd700', border: '#664400', label: 'LEGENDARIO' },
};
