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
  },
  {
    id: 'first_habit_added',
    name: 'El Viaje Comienza',
    desc: 'Añade tu primer hábito',
    icon: '🌱',
    rarity: 'common',
    check: (state) => state.habits.length >= 1,
  },
  {
    id: 'three_habits',
    name: 'Multitarea',
    desc: 'Añade 3 hábitos distintos',
    icon: '🎯',
    rarity: 'common',
    check: (state) => state.habits.length >= 3,
  },

  // === RACHAS ===
  {
    id: 'streak_3',
    name: 'Tres en Raya',
    desc: 'Completa un hábito 3 días seguidos',
    icon: '🔥',
    rarity: 'common',
    check: (state) => state.habits.some(h => h.streak >= 3),
  },
  {
    id: 'streak_7',
    name: 'Semana Perfecta',
    desc: 'Completa un hábito 7 días seguidos',
    icon: '⚡',
    rarity: 'rare',
    check: (state) => state.habits.some(h => h.streak >= 7),
    reward: 'shield_of_streak',
  },
  {
    id: 'streak_14',
    name: 'Quincena Imparable',
    desc: 'Completa un hábito 14 días seguidos',
    icon: '🌟',
    rarity: 'rare',
    check: (state) => state.habits.some(h => h.streak >= 14),
    reward: 'boost_potion',
  },
  {
    id: 'streak_30',
    name: 'Mes de Hierro',
    desc: 'Completa un hábito 30 días seguidos',
    icon: '💎',
    rarity: 'epic',
    check: (state) => state.habits.some(h => h.streak >= 30),
    reward: 'double_elixir',
  },
  {
    id: 'streak_100',
    name: 'Centurión',
    desc: 'Completa un hábito 100 días seguidos',
    icon: '🏛️',
    rarity: 'legendary',
    check: (state) => state.habits.some(h => h.streak >= 100),
    reward: 'multiplier_gem',
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
  },
  {
    id: 'all_week',
    name: 'Guerrero Total',
    desc: 'Completa todos tus hábitos durante 7 días seguidos',
    icon: '⚔️',
    rarity: 'epic',
    check: (state) => state.globalStreak >= 7,
    reward: 'amulet_constancy',
  },
  {
    id: 'all_month',
    name: 'Constancia Total',
    desc: 'Completa todos tus hábitos durante 30 días seguidos',
    icon: '👑',
    rarity: 'legendary',
    check: (state) => state.globalStreak >= 30,
    reward: 'multiplier_gem',
  },

  // === MULTIPLICADORES ===
  {
    id: 'mult_2',
    name: 'Engranaje',
    desc: 'Consigue un multiplicador de x2.0 en cualquier hábito',
    icon: '⚙️',
    rarity: 'rare',
    check: (state) => state.habits.some(h => h.multiplier >= 2.0),
  },
  {
    id: 'mult_3',
    name: 'Turbocargado',
    desc: 'Consigue un multiplicador de x3.0 en cualquier hábito',
    icon: '🚀',
    rarity: 'epic',
    check: (state) => state.habits.some(h => h.multiplier >= 3.0),
    reward: 'boost_potion',
  },
  {
    id: 'mult_5',
    name: 'Modo Dios',
    desc: 'Consigue un multiplicador de x5.0 en cualquier hábito',
    icon: '🌌',
    rarity: 'legendary',
    check: (state) => state.habits.some(h => h.multiplier >= 5.0),
    reward: 'double_elixir',
  },

  // === NIVELES ===
  {
    id: 'level_1',
    name: 'Iniciado',
    desc: 'Alcanza el Nivel 1',
    icon: '🥉',
    rarity: 'common',
    check: (state) => state.level >= 1,
    reward: 'shield_of_streak',
  },
  {
    id: 'level_2',
    name: 'Aventurero',
    desc: 'Alcanza el Nivel 2',
    icon: '🥈',
    rarity: 'rare',
    check: (state) => state.level >= 2,
    reward: 'time_crystal',
  },
  {
    id: 'level_3',
    name: 'Maestro',
    desc: 'Alcanza el Nivel 3',
    icon: '🥇',
    rarity: 'epic',
    check: (state) => state.level >= 3,
    reward: 'double_elixir',
  },
  {
    id: 'level_5',
    name: 'Leyenda',
    desc: 'Alcanza el Nivel 5',
    icon: '🏆',
    rarity: 'legendary',
    check: (state) => state.level >= 5,
    reward: 'multiplier_gem',
  },

  // === COLECCIONISTA ===
  {
    id: 'collect_5',
    name: 'Coleccionista',
    desc: 'Consigue 5 objetos en tu inventario',
    icon: '🎒',
    rarity: 'rare',
    check: (state) => state.inventory.length >= 5,
  },

  // === PUNTOS ===
  {
    id: 'points_1000',
    name: 'Mil Puntos',
    desc: 'Acumula 1000 puntos en total (histórico)',
    icon: '💯',
    rarity: 'common',
    check: (state) => state.lifetimePoints >= 1000,
  },
  {
    id: 'points_10000',
    name: 'Diez Mil',
    desc: 'Acumula 10,000 puntos en total (histórico)',
    icon: '💰',
    rarity: 'rare',
    check: (state) => state.lifetimePoints >= 10000,
  },
];

export const RARITY_COLORS = {
  common:    { color: '#a0a0c0', border: '#2a2a4a', label: 'COMÚN' },
  rare:      { color: '#00e5ff', border: '#004466', label: 'RARO' },
  epic:      { color: '#b44fff', border: '#330055', label: 'ÉPICO' },
  legendary: { color: '#ffd700', border: '#664400', label: 'LEGENDARIO' },
};
