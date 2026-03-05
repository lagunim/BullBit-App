export const HABIT_THEMES = [
  {
    id: 'body',
    icon: '💪',
    label: 'Cuerpo',
    description: 'Ejercicio, movilidad y autocuidado físico.',
  },
  {
    id: 'mind',
    icon: '🧠',
    label: 'Mente',
    description: 'Meditación, lectura, reflexión y aprendizaje.',
  },
  {
    id: 'productivity',
    icon: '⚙️',
    label: 'Productividad',
    description: 'Tareas, organización y hábitos para avanzar proyectos.',
  },
  {
    id: 'creativity',
    icon: '🎨',
    label: 'Creatividad',
    description: 'Arte, escritura, hobby y exploración creativa.',
  },
  {
    id: 'rituals',
    icon: '⏰',
    label: 'Rutinas',
    description: 'Rituales diarios, higiene y hábitos constantes.',
  },
  {
    id: 'connection',
    icon: '🤝',
    label: 'Conexión',
    description: 'Relaciones, ayuda, comunidad y actos sociales.',
  },
];

export const DEFAULT_HABIT_THEME = HABIT_THEMES[0]?.id ?? 'body';

export const HABIT_THEME_BY_ID = HABIT_THEMES.reduce((acc, theme) => {
  acc[theme.id] = theme;
  return acc;
}, {});

export function getThemeIdByIcon(icon) {
  const theme = HABIT_THEMES.find(t => t.icon === icon);
  return theme ? theme.id : DEFAULT_HABIT_THEME;
}

export function attachThemeToHabit(habit) {
  if (!habit) return habit;
  const themeId = habit.themeId ?? getThemeIdByIcon(habit.emoji);
  return { ...habit, themeId };
}
