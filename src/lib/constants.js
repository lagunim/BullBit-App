/**
 * ============================================
 * CONSTANTES DEL JUEGO - BULLBIT APP
 * ============================================
 * Este archivo contiene todas las constantes
 * fundamentales del sistema de juego:
 * - Multiplicadores de puntos
 * - Niveles y umbrales de experiencia
 * - Opciones de personalización de hábitos
 */

// ============================================
// MULTIPLICADORES
// ============================================

/** Multiplicador base inicial para nuevos hábitos */
export const BASE_MULTIPLIER = 1.0;

/** Cantidad que aumenta el multiplicador al completar un hábito (+0.2) */
export const MULTIPLIER_STEP = 0.2;

/** Cantidad que reduce el multiplicador al fallar un hábito (-0.4) */
export const MULTIPLIER_PENALTY = 0.4;

/** Multiplicador mínimo posible (no puede bajar más) */
export const MIN_MULTIPLIER = 0.2;

/** Multiplicador máximo posible (tope del juego) */
export const MAX_MULTIPLIER = 10.0;

// ============================================
// SISTEMA DE NIVELES
// ============================================

/**
 * Puntos necesarios PARA ESTAR EN cada nivel y avanzar al siguiente.
 * Ejemplo: LEVEL_THRESHOLDS[0] = 627 significa que necesitas
 * 627 puntos para pasar del nivel 0 al nivel 1.
 * 
 * Escala progresiva: cada nivel requiere más puntos que el anterior,
 * creando una curva de dificultad ascendente.
 */
export const LEVEL_THRESHOLDS = [627, 2268, 4872, 8505, 14112, 22176, 34020, 51030];

/**
 * Nombres temáticos de cada nivel (estilo RPG).
 * Se muestran al jugador para dar sensación de progreso narrativo.
 */
export const LEVEL_NAMES = [
  'APRENDIZ',    // Nivel 0 - Nuevos usuarios
  'AVENTURERO',  // Nivel 1 - Primeros hábitos establecidos
  'GUERRERO',    // Nivel 2 - Compromiso sostenido
  'HÉROE',       // Nivel 3 - Dedicación notable
  'CAMPEÓN',     // Nivel 4 - Excelencia en hábitos
  'LEYENDA',     // Nivel 5 - Mestre absoluto
  'MAESTRO',     // Nivel 6 - Legenda viviente
  'INMORTAL',    // Nivel 7 - Nivel máximo
];

// ============================================
// OPCIONES DE PERSONALIZACIÓN
// ============================================

/** Periodicidades disponibles para hábitos */
export const PERIODICITIES = ['Diaria', 'Semanal'];

/**
 * Colores disponibles para representar hábitos visualmente.
 * Cada color se asigna a un tema de hábito (ejercicio, estudio, etc.)
 */
export const HABIT_COLORS = ['#00e676','#448aff','#e040fb','#ff9100','#00e5ff','#ff1744','#ffd700','#64ffda'];

/**
 * Emojis/icons disponibles para representar hábitos.
 * Se usan como identificadores visuales en las tarjetas de hábitos.
 */
export const HABIT_ICONS = ['📚','🏃','💧','🧘','💪','🎯','🍎','😴','✍️','🎵','🧠','🌿'];
