export const DAILY_CHALLENGES = [
  {
    id: 'productive_day',
    name: 'Día Productivo',
    description: 'Completa 3 hábitos cualquiera',
    icon: '🎯',
    difficulty: 'medium',
    condition: (state) => {
      const today = new Date().toISOString().split('T')[0];
      const dayHistory = state.history[today] || {};
      const completed = Object.values(dayHistory).filter(
        status => status === 'completed' || status === 'partial' || status === 'over'
      ).length;
      return { current: completed, target: 3, completed: completed >= 3 };
    },
    rewards: {
      points: 150,
      items: ['recovery_totem']
    }
  },
  {
    id: 'double_streak',
    name: 'Racha Doble',
    description: 'Completa 2 hábitos con multiplicador ≥2.0',
    icon: '⚡',
    difficulty: 'hard',
    condition: (state) => {
      const today = new Date().toISOString().split('T')[0];
      const dayHistory = state.history[today] || {};
      let count = 0;

      Object.entries(dayHistory).forEach(([habitId, status]) => {
        if (status === 'completed' || status === 'partial' || status === 'over') {
          const habit = state.habits.find(h => h.id === habitId);
          if (habit && habit.multiplier >= 2.0) {
            count++;
          }
        }
      });

      return { current: count, target: 2, completed: count >= 2 };
    },
    rewards: {
      points: 220,
      items: ['boost_potion']
    }
  },
  {
    id: 'marathon',
    name: 'Maratón',
    description: 'Completa hábitos que sumen ≥60 minutos totales',
    icon: '🏃',
    difficulty: 'medium',
    condition: (state) => {
      const today = new Date().toISOString().split('T')[0];
      const dayHistory = state.history[today] || {};
      let totalMinutes = 0;

      Object.entries(dayHistory).forEach(([habitId, status]) => {
        if (status === 'completed' || status === 'partial' || status === 'over') {
          const habit = state.habits.find(h => h.id === habitId);
          if (habit) {
            // Para 'partial' asumimos 15 minutos, para otros el tiempo completo
            const minutes = status === 'partial' ? 15 : habit.minutes;
            totalMinutes += minutes;
          }
        }
      });

      return { current: totalMinutes, target: 60, completed: totalMinutes >= 60 };
    },
    rewards: {
      points: 180,
      items: ['shield_of_streak']
    }
  },
  {
    id: 'perfectionist',
    name: 'Perfeccionista',
    description: 'Completa todos tus hábitos sin fallar ninguno',
    icon: '✨',
    difficulty: 'hard',
    condition: (state) => {
      if (state.habits.length === 0) return { current: 0, target: 1, completed: false };

      const today = new Date().toISOString().split('T')[0];
      const dayHistory = state.history[today] || {};

      const totalHabits = state.habits.length;
      const completedHabits = state.habits.filter(habit => {
        const status = dayHistory[habit.id];
        return status === 'completed' || status === 'partial' || status === 'over';
      }).length;
      const failedHabits = state.habits.filter(habit => {
        return dayHistory[habit.id] === 'failed';
      }).length;

      const allCompleted = completedHabits === totalHabits;
      const noFails = failedHabits === 0;

      return {
        current: allCompleted && noFails ? 1 : 0,
        target: 1,
        completed: allCompleted && noFails
      };
    },
    rewards: {
      points: 230,
      items: ['double_elixir']
    }
  },
  {
    id: 'quick_start',
    name: 'Inicio Rápido',
    description: 'Completa 1 hábito hoy',
    icon: '🌱',
    difficulty: 'easy',
    condition: (state) => {
      const today = new Date().toISOString().split('T')[0];
      const dayHistory = state.history[today] || {};
      const completed = Object.values(dayHistory).filter(
        status => status === 'completed' || status === 'partial' || status === 'over'
      ).length;
      return { current: completed, target: 1, completed: completed >= 1 };
    },
    rewards: {
      points: 80,
      items: []
    }
  },
  {
    id: 'steady_pair',
    name: 'Par Constante',
    description: 'Completa 2 hábitos en el día',
    icon: '🧩',
    difficulty: 'easy',
    condition: (state) => {
      const today = new Date().toISOString().split('T')[0];
      const dayHistory = state.history[today] || {};
      const completed = Object.values(dayHistory).filter(
        status => status === 'completed' || status === 'partial' || status === 'over'
      ).length;
      return { current: completed, target: 2, completed: completed >= 2 };
    },
    rewards: {
      points: 100,
      items: ['recovery_totem']
    }
  },
  {
    id: 'active_half_hour',
    name: 'Media Hora Activa',
    description: 'Suma al menos 30 minutos en hábitos completados',
    icon: '⏱️',
    difficulty: 'easy',
    condition: (state) => {
      const today = new Date().toISOString().split('T')[0];
      const dayHistory = state.history[today] || {};
      let totalMinutes = 0;

      Object.entries(dayHistory).forEach(([habitId, status]) => {
        if (status === 'completed' || status === 'partial' || status === 'over') {
          const habit = state.habits.find(h => h.id === habitId);
          if (habit) {
            const minutes = status === 'partial' ? 15 : habit.minutes;
            totalMinutes += minutes;
          }
        }
      });

      return { current: totalMinutes, target: 30, completed: totalMinutes >= 30 };
    },
    rewards: {
      points: 90,
      items: []
    }
  },
  {
    id: 'focused_three',
    name: 'Trío Enfocado',
    description: 'Completa 3 hábitos en el día',
    icon: '🎯',
    difficulty: 'medium',
    condition: (state) => {
      const today = new Date().toISOString().split('T')[0];
      const dayHistory = state.history[today] || {};
      const completed = Object.values(dayHistory).filter(
        status => status === 'completed' || status === 'partial' || status === 'over'
      ).length;
      return { current: completed, target: 3, completed: completed >= 3 };
    },
    rewards: {
      points: 160,
      items: ['golden_streak']
    }
  },
  {
    id: 'rising_multipliers',
    name: 'Multiplicadores en Alza',
    description: 'Completa 2 hábitos con multiplicador ≥1.6',
    icon: '📈',
    difficulty: 'medium',
    condition: (state) => {
      const today = new Date().toISOString().split('T')[0];
      const dayHistory = state.history[today] || {};
      let count = 0;

      Object.entries(dayHistory).forEach(([habitId, status]) => {
        if (status === 'completed' || status === 'partial' || status === 'over') {
          const habit = state.habits.find(h => h.id === habitId);
          if (habit && habit.multiplier >= 1.6) {
            count++;
          }
        }
      });

      return { current: count, target: 2, completed: count >= 2 };
    },
    rewards: {
      points: 170,
      items: ['balance_amulet']
    }
  },
  {
    id: 'long_session',
    name: 'Sesión Larga',
    description: 'Suma al menos 75 minutos en hábitos completados',
    icon: '🏋️',
    difficulty: 'medium',
    condition: (state) => {
      const today = new Date().toISOString().split('T')[0];
      const dayHistory = state.history[today] || {};
      let totalMinutes = 0;

      Object.entries(dayHistory).forEach(([habitId, status]) => {
        if (status === 'completed' || status === 'partial' || status === 'over') {
          const habit = state.habits.find(h => h.id === habitId);
          if (habit) {
            const minutes = status === 'partial' ? 15 : habit.minutes;
            totalMinutes += minutes;
          }
        }
      });

      return { current: totalMinutes, target: 75, completed: totalMinutes >= 75 };
    },
    rewards: {
      points: 180,
      items: ['boost_potion']
    }
  },
  {
    id: 'five_checkins',
    name: 'Cinco Check-ins',
    description: 'Registra 5 hábitos como completados',
    icon: '✅',
    difficulty: 'medium',
    condition: (state) => {
      const today = new Date().toISOString().split('T')[0];
      const dayHistory = state.history[today] || {};
      const checkIns = Object.values(dayHistory).filter(
        status => status === 'completed' || status === 'partial' || status === 'over'
      ).length;
      return { current: checkIns, target: 5, completed: checkIns >= 5 };
    },
    rewards: {
      points: 165,
      items: ['focused_elixir']
    }
  },
  {
    id: 'elite_duo',
    name: 'Dúo de Élite',
    description: 'Completa 2 hábitos con multiplicador ≥2.5',
    icon: '⚔️',
    difficulty: 'hard',
    condition: (state) => {
      const today = new Date().toISOString().split('T')[0];
      const dayHistory = state.history[today] || {};
      let count = 0;

      Object.entries(dayHistory).forEach(([habitId, status]) => {
        if (status === 'completed' || status === 'partial' || status === 'over') {
          const habit = state.habits.find(h => h.id === habitId);
          if (habit && habit.multiplier >= 2.5) {
            count++;
          }
        }
      });

      return { current: count, target: 2, completed: count >= 2 };
    },
    rewards: {
      points: 240,
      items: ['xp_scroll']
    }
  },
  {
    id: 'iron_day',
    name: 'Día de Hierro',
    description: 'Completa todos tus hábitos por encima de su multiplicador base',
    icon: '🧱',
    difficulty: 'hard',
    condition: (state) => {
      if (state.habits.length === 0) return { current: 0, target: 1, completed: false };

      const today = new Date().toISOString().split('T')[0];
      const dayHistory = state.history[today] || {};
      const totalHabits = state.habits.length;

      const fullyCompleted = state.habits.filter(habit => {
        const status = dayHistory[habit.id];
        return status === 'completed' || status === 'over';
      }).length;

      const failed = state.habits.filter(habit => dayHistory[habit.id] === 'failed').length;
      const success = fullyCompleted === totalHabits && failed === 0;

      return { current: success ? 1 : 0, target: 1, completed: success };
    },
    rewards: {
      points: 235,
      items: ['double_elixir', 'mastery_token']
    }
  },
  {
    id: 'century_push',
    name: 'Empuje del Siglo',
    description: 'Suma al menos 120 minutos en hábitos completados',
    icon: '🔥',
    difficulty: 'epic',
    condition: (state) => {
      const today = new Date().toISOString().split('T')[0];
      const dayHistory = state.history[today] || {};
      let totalMinutes = 0;

      Object.entries(dayHistory).forEach(([habitId, status]) => {
        if (status === 'completed' || status === 'partial' || status === 'over') {
          const habit = state.habits.find(h => h.id === habitId);
          if (habit) {
            const minutes = status === 'partial' ? 15 : habit.minutes;
            totalMinutes += minutes;
          }
        }
      });

      return { current: totalMinutes, target: 120, completed: totalMinutes >= 120 };
    },
    rewards: {
      points: 340,
      items: ['xp_scroll', 'double_elixir', 'multiplier_gem']
    }
  },
  {
    id: 'epic_chain',
    name: 'Cadena Épica',
    description: 'Completa 4 hábitos con multiplicador ≥2.0',
    icon: '⛓️',
    difficulty: 'epic',
    condition: (state) => {
      const today = new Date().toISOString().split('T')[0];
      const dayHistory = state.history[today] || {};
      let count = 0;

      Object.entries(dayHistory).forEach(([habitId, status]) => {
        if (status === 'completed' || status === 'partial' || status === 'over') {
          const habit = state.habits.find(h => h.id === habitId);
          if (habit && habit.multiplier >= 2.0) {
            count++;
          }
        }
      });

      return { current: count, target: 4, completed: count >= 4 };
    },
    rewards: {
      points: 320,
      items: ['xp_scroll', 'mastery_token']
    }
  },
  {
    id: 'flawless_six',
    name: 'Seis sin Fallo',
    description: 'Registra 6 hábitos válidos y cero fallos',
    icon: '🧠',
    difficulty: 'epic',
    condition: (state) => {
      const today = new Date().toISOString().split('T')[0];
      const dayHistory = state.history[today] || {};
      const completed = Object.values(dayHistory).filter(
        status => status === 'completed' || status === 'partial' || status === 'over'
      ).length;
      const failed = Object.values(dayHistory).filter(status => status === 'failed').length;
      const success = completed >= 6 && failed === 0;

      return { current: success ? 6 : completed, target: 6, completed: success };
    },
    rewards: {
      points: 330,
      items: ['double_elixir', 'mastery_token']
    }
  },
  {
    id: 'triple_elite',
    name: 'Triple Élite',
    description: 'Completa 3 hábitos con multiplicador ≥2.8',
    icon: '⚜️',
    difficulty: 'epic',
    condition: (state) => {
      const today = new Date().toISOString().split('T')[0];
      const dayHistory = state.history[today] || {};
      let count = 0;

      Object.entries(dayHistory).forEach(([habitId, status]) => {
        if (status === 'completed' || status === 'partial' || status === 'over') {
          const habit = state.habits.find(h => h.id === habitId);
          if (habit && habit.multiplier >= 2.8) {
            count++;
          }
        }
      });

      return { current: count, target: 3, completed: count >= 3 };
    },
    rewards: {
      points: 350,
      items: ['xp_scroll', 'multiplier_gem']
    }
  },
  {
    id: 'apex_total',
    name: 'Total Apex',
    description: 'Suma 150 minutos en hábitos completados y sin fallar',
    icon: '🚀',
    difficulty: 'epic',
    condition: (state) => {
      const today = new Date().toISOString().split('T')[0];
      const dayHistory = state.history[today] || {};
      let totalMinutes = 0;

      Object.entries(dayHistory).forEach(([habitId, status]) => {
        if (status === 'completed' || status === 'partial' || status === 'over') {
          const habit = state.habits.find(h => h.id === habitId);
          if (habit) {
            const minutes = status === 'partial' ? 15 : habit.minutes;
            totalMinutes += minutes;
          }
        }
      });

      const failed = Object.values(dayHistory).filter(status => status === 'failed').length;
      const success = totalMinutes >= 150 && failed === 0;

      return { current: success ? 150 : totalMinutes, target: 150, completed: success };
    },
    rewards: {
      points: 360,
      items: ['double_elixir', 'xp_scroll', 'phoenix']
    }
  },
  {
    id: 'master_line',
    name: 'Línea Maestra',
    description: 'Completa 3 hábitos con multiplicador ≥2.0 y sin fallos',
    icon: '👑',
    difficulty: 'hard',
    condition: (state) => {
      const today = new Date().toISOString().split('T')[0];
      const dayHistory = state.history[today] || {};
      const failed = Object.values(dayHistory).filter(status => status === 'failed').length;
      let highMultiplierDone = 0;

      Object.entries(dayHistory).forEach(([habitId, status]) => {
        if (status === 'completed' || status === 'partial' || status === 'over') {
          const habit = state.habits.find(h => h.id === habitId);
          if (habit && habit.multiplier >= 2.0) {
            highMultiplierDone++;
          }
        }
      });

      const success = highMultiplierDone >= 3 && failed === 0;
      return { current: success ? 3 : highMultiplierDone, target: 3, completed: success };
    },
    rewards: {
      points: 220,
      items: ['xp_scroll', 'multiplier_gem']
    }
  }
];

export const DIFFICULTY_CONFIG = {
  easy: { pointsMultiplier: 1.0, rarityBonus: 0 },
  medium: { pointsMultiplier: 1.5, rarityBonus: 1 },
  hard: { pointsMultiplier: 2.0, rarityBonus: 2 },
  epic: { pointsMultiplier: 2.5, rarityBonus: 3 }
};

export function getRandomDaily(excludeIds = []) {
  const availableDailies = DAILY_CHALLENGES.filter(d => !excludeIds.includes(d.id));
  if (availableDailies.length === 0) return DAILY_CHALLENGES[0]; // fallback

  const randomIndex = Math.floor(Math.random() * availableDailies.length);
  return availableDailies[randomIndex];
}

export function checkDailyProgress(daily, gameState) {
  if (!daily || !daily.id) return { current: 0, target: 1, completed: false };

  // Find the original daily template with the condition function
  const originalDaily = DAILY_CHALLENGES.find(d => d.id === daily.id);
  if (!originalDaily || !originalDaily.condition) {
    return { current: 0, target: 1, completed: false };
  }

  try {
    return originalDaily.condition(gameState);
  } catch (error) {
    console.error('Error checking daily progress:', error);
    return { current: 0, target: 1, completed: false };
  }
}