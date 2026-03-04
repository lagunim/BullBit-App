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
      points: 250,
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
      points: 300,
      items: ['double_elixir']
    }
  }
];

export const DIFFICULTY_CONFIG = {
  easy: { pointsMultiplier: 1.0, rarityBonus: 0 },
  medium: { pointsMultiplier: 1.5, rarityBonus: 1 },
  hard: { pointsMultiplier: 2.0, rarityBonus: 2 }
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