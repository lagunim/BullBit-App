/**
 * ============================================
 * CATÁLOGO DE OBJETOS DEL JUEGO
 * ============================================
 * Este archivo define todos los objetos/items disponibles en el juego.
 * Cada objeto tiene propiedades que determinan su comportamiento.
 * 
 * PROPIEDADES DE CADA OBJETO:
 * - id: Identificador único del objeto
 * - name: Nombre visible para el jugador
 * - icon: Emoji que representa el objeto
 * - rarity: Rareza (common, rare, epic, legendary)
 * - desc: Descripción del efecto
 * - effectType: Tipo de efecto (timed, passive, instant)
 * - effectKey: Clave del efecto en el sistema de juego
 * - effectValue: Valor numérico del efecto
 * - durationDays: Duración en días (solo para effectType: 'timed')
 * - maxStack: Máximo apilable en inventario
 * 
 * TIPOS DE EFECTOS (effectType):
 * - timed: Efecto temporal que dura X días
 * - passive: Efecto pasivo que se activa bajo ciertas condiciones
 * - instant: Efecto que se aplica inmediatamente al usar
 * 
 * SISTEMA DE RAREZA:
 * - common (común): Fácil de obtener, efectos básicos
 * - rare (raro): Efectos útiles, moderately difíciles de obtener
 * - epic (épico): Efectos poderosos, difíciles de obtener
 * - legendary (legendario): Efectos únicos o muy poderosos
 */

// ════════════════════════════════════════════════════════════════════════
// DEFINICIÓN DE OBJETOS
// ════════════════════════════════════════════════════════════════════════

export const ITEMS = {
  /**
   * ESCUDO DE RACHA
   * Tipo: Pasivo
   * Efecto: Protege el multiplicador de UNA penalización por fallo.
   * Uso: Se consume automáticamente cuando fallas un hábito.
   */
  shield_of_streak: {
    id: 'shield_of_streak',
    name: 'Escudo de Racha',
    icon: '🛡️',
    rarity: 'common',
    desc: 'Protege tu multiplicador de UNA penalización por fallo. Se consume automáticamente.',
    effectType: 'passive',
    effectKey: 'streak_shield',
    effectValue: 1,
    maxStack: 5,
  },

  /**
   * GOTA DE ESFUERZO
   * Tipo: Instantáneo
   * Efecto: Añade +0.2 al multiplicador de DOS hábitos seleccionados (máx 3.0).
   */
  effort_drop: {
    id: 'effort_drop',
    name: 'Gota de Esfuerzo',
    icon: '💧',
    rarity: 'common',
    desc: 'Añade +0.2 al multiplicador de DOS hábitos seleccionados (máx 3.0).',
    effectType: 'instant',
    effectKey: 'mult_boost_target_two',
    effectValue: 0.2,
    maxStack: 5,
  },

  /**
   * SEMILLA DE HÁBITO
   * Tipo: Temporal
   * Efecto: Añade +0.5 al multiplicador durante 1 día.
   */
  habit_seed: {
    id: 'habit_seed',
    name: 'Semilla de Hábito',
    icon: '🌱',
    rarity: 'common',
    desc: 'Añade +0.5 al multiplicador durante 1 día.',
    effectType: 'timed',
    effectKey: 'small_mult_boost',
    effectValue: 0.5,
    durationDays: 1,
    maxStack: 5,
  },

  /**
   * FRAGMENTO DE PUNTO
   * Tipo: Instantáneo
   * Efecto: Multiplica por 1.5 los puntos de la próxima completación.
   */
  point_fragment: {
    id: 'point_fragment',
    name: 'Fragmento de Punto',
    icon: '🔹',
    rarity: 'common',
    desc: 'Multiplica por 1.5 los puntos de la próxima completación.',
    effectType: 'instant',
    effectKey: 'next_point_boost',
    effectValue: 1.5,
    maxStack: 5,
  },

  /**
   * MARCA DE PROTECCIÓN
   * Tipo: Pasivo
   * Efecto: La próxima penalización por fallo se reduce de -0.4 a -0.2.
   */
  protection_mark: {
    id: 'protection_mark',
    name: 'Marca de Protección',
    icon: '⭕',
    rarity: 'common',
    desc: 'La próxima penalización por fallo se reduce de -0.4 a -0.2.',
    effectType: 'passive',
    effectKey: 'reduced_fail',
    effectValue: 0.2,
    maxStack: 5,
  },

  /**
   * POCIÓN DE IMPULSO
   * Tipo: Temporal
   * Efecto: Añade +1.0 a TODOS los multiplicadores durante 3 días.
   * Uso: Great for boosting all habits temporarily.
   */
  boost_potion: {
    id: 'boost_potion',
    name: 'Poción de Impulso',
    icon: '⚗️',
    rarity: 'rare',
    desc: 'Añade +1.0 a TODOS los multiplicadores durante 3 días.',
    effectType: 'timed',
    effectKey: 'global_mult_boost',
    effectValue: 1.0,
    durationDays: 3,
    maxStack: 3,
  },

  /**
   * ELIXIR DEL DOBLE
   * Tipo: Temporal
   * Efecto: Duplica todos los puntos ganados durante 24 horas.
   */
  double_elixir: {
    id: 'double_elixir',
    name: 'Elixir del Doble',
    icon: '✨',
    rarity: 'epic',
    desc: 'Duplica todos los puntos ganados durante 24 horas.',
    effectType: 'timed',
    effectKey: 'double_points',
    effectValue: 2,
    durationDays: 1,
    maxStack: 2,
  },

  /**
   * AMULETO DE CONSTANCIA
   * Tipo: Temporal
   * Efecto: Reduce la penalización por fallo de -0.4 a -0.2 durante 7 días.
   */
  amulet_constancy: {
    id: 'amulet_constancy',
    name: 'Amuleto de Constancia',
    icon: '📿',
    rarity: 'epic',
    desc: 'En vez de -0.4, los fallos solo penalizan -0.2 al multiplicador durante 7 días.',
    effectType: 'timed',
    effectKey: 'reduced_penalty',
    effectValue: 0.2,
    durationDays: 7,
    maxStack: 2,
  },

  /**
   * TÓTEM DE RECUPERACIÓN
   * Tipo: Instantáneo
   * Efecto: Recupera +0.4 al multiplicador de un hábito específico.
   * Requiere selección de hábito.
   */
  recovery_totem: {
    id: 'recovery_totem',
    name: 'Tótem de Recuperación',
    icon: '🗿',
    rarity: 'common',
    desc: 'Recupera +0.4 al multiplicador de un hábito concreto al instante.',
    effectType: 'instant',
    effectKey: 'mult_recovery',
    effectValue: 0.4,
    maxStack: 5,
  },

  /**
   * GEMA DEL MULTIPLICADOR
   * Tipo: Instantáneo
   * Efecto: Aumenta PERMANENTEMENTE límite del multiplicador BASE a 4.
   * Importante: Es permanente, pero se pierde al reducir el multiplicador por debajo de 3.
   */
  multiplier_gem: {
    id: 'multiplier_gem',
    name: 'Gema del Multiplicador',
    icon: '💠',
    rarity: 'legendary',
    desc: 'Elige un hábito para elevar su tope de multiplicador a ×4. No se apila en el mismo hábito y se pierde si baja de ×3.',
    effectType: 'instant',
    effectKey: 'perm_base_mult',
    effectValue: 1,
    maxStack: 1,
  },

  /**
   * RACHA DORADA
   * Tipo: Pasivo
   * Efecto: El siguiente fallo NO baja el multiplicador Y además lo aumenta +0.2.
   * Es como un "escudo dorado" que te beneficia al fallar.
   */
  golden_streak: {
    id: 'golden_streak',
    name: 'Racha Dorada',
    icon: '⭐',
    rarity: 'rare',
    desc: 'El siguiente fallo NO activa penalización y además suma +0.2 al multiplicador como si lo hubieras completado.',
    effectType: 'passive',
    effectKey: 'golden_shield',
    effectValue: 1,
    maxStack: 3,
  },

  /**
   * PIEDRA DE PODER
   * Tipo: Instantáneo
   * Efecto: Triplica los puntos de la próxima completación de un hábito específico.
   * Requiere selección de hábito.
   */
  xp_multiplier: {
    id: 'xp_multiplier',
    name: 'Piedra de Poder',
    icon: '🔺',
    rarity: 'epic',
    desc: 'Selecciona un hábito para triplicar los puntos de su próxima completación.',
    effectType: 'instant',
    effectKey: 'next_triple_target',
    effectValue: 3,
    maxStack: 2,
  },

  // ════════════════════════════════════════════════════════════════════════
  // OBJETOS ADICIONALES
  // ════════════════════════════════════════════════════════════════════════

  /**
   * AMULETO DE EQUILIBRIO
   * Tipo: Temporal
   * Efecto: El multiplicador no baja al fallar durante 3 días.
   */
  balance_amulet: {
    id: 'balance_amulet',
    name: 'Amuleto de Equilibrio',
    icon: '⚖️',
    rarity: 'rare',
    desc: 'El multiplicador no baja al fallar durante 3 días.',
    effectType: 'timed',
    effectKey: 'balance_shield',
    effectValue: 1,
    durationDays: 3,
    maxStack: 2,
  },

  /**
   * FANTASMA DE RACHA
   * Tipo: Instantáneo
   * Efecto: Duplica la racha actual (cuenta 1 día como 2).
   */
  streak_ghost: {
    id: 'streak_ghost',
    name: 'Fantasma de Racha',
    icon: '👻',
    rarity: 'rare',
    desc: 'Duplica tu racha actual (cuenta 1 día como 2).',
    effectType: 'instant',
    effectKey: 'double_streak',
    effectValue: 2,
    maxStack: 1,
  },

  /**
   * CRISTAL DE RECUPERACIÓN
   * Tipo: Instantáneo
   * Efecto: Recupera +0.4 al multiplicador de un hábito al instante.
   */
  mult_recovery: {
    id: 'mult_recovery',
    name: 'Cristal de Recuperación',
    icon: '💎',
    rarity: 'rare',
    desc: 'Recupera +0.4 al multiplicador de un hábito al instante.',
    effectType: 'instant',
    effectKey: 'mult_recovery',
    effectValue: 0.4,
    maxStack: 5,
  },

  /**
   * PERGAMINO DE XP
   * Tipo: Temporal
   * Efecto: Triplica los puntos ganados durante 1 día.
   */
  xp_scroll: {
    id: 'xp_scroll',
    name: 'Pergamino de XP',
    icon: '📜',
    rarity: 'epic',
    desc: 'Triplica los puntos ganados durante 1 día.',
    effectType: 'timed',
    effectKey: 'triple_points',
    effectValue: 3,
    durationDays: 1,
    maxStack: 2,
  },

  /**
   * TOKEN DE MAESTRÍA
   * Tipo: Instantáneo
   * Efecto: Añade +0.4 al multiplicador de un hábito específico.
   * Requiere selección de hábito.
   */
  mastery_token: {
    id: 'mastery_token',
    name: 'Token de Maestría',
    icon: '🎖️',
    rarity: 'epic',
    desc: 'Selecciona un hábito para añadirle +0.4 al multiplicador (máx 3.0).',
    effectType: 'instant',
    effectKey: 'mult_boost_target',
    effectValue: 0.4,
    maxStack: 3,
  },

  /**
   * ESPEJO MÁGICO
   * Tipo: Instantáneo
   * Efecto: Copia el multiplicador más alto a todos los hábitos.
   * Útil para平等的ar hábitos que están por detrás.
   */
  mirror: {
    id: 'mirror',
    name: 'Espejo Mágico',
    icon: '🪞',
    rarity: 'epic',
    desc: 'Copia el multiplicador más alto a todos los hábitos.',
    effectType: 'instant',
    effectKey: 'copy_multiplier',
    effectValue: 0,
    maxStack: 1,
  },

  /**
   * PLUMA DE FÉNIX
   * Tipo: Instantáneo
   * Efecto: Selecciona un hábito con multiplicador < 3 para establecerlo en ×3.
   * Los próximos 5 completados otorgan el doble de puntos.
   */
  phoenix: {
    id: 'phoenix',
    name: 'Pluma de Fénix',
    icon: '🪶',
    rarity: 'legendary',
    desc: 'Selecciona un hábito con multiplicador < 3 para establecerlo en ×3. Los próximos 5 completados otorgan doble de puntos.',
    effectType: 'instant',
    effectKey: 'phoenix_restore',
    effectValue: 3.0,
    maxStack: 1,
  },

  /**
   * PIEDRA DEL VACÍO
   * Tipo: Instantáneo
   * Efecto: Canjea piedras del vacío por objetos aleatorios.
   * - 2 piedras → 1 objeto common
   * - 4 piedras → 1 objeto rare
   * - 6 piedras → 1 objeto epic
   * - 10 piedras → 1 objeto legendary
   */
  void_stone: {
    id: 'void_stone',
    name: 'Piedra del Vacío',
    icon: '🕳️',
    rarity: 'common',
    desc: 'Canjea piedras por objetos: 2(Common), 4(Rare), 6(Epic), 10(Legendary).',
    effectType: 'instant',
    effectKey: 'void_exchange',
    effectValue: 0,
    maxStack: 10,
  },

  /**
   * POCIÓN DE FUSIÓN
   * Tipo: Instantáneo
   * Efecto: Combina dos hábitos: suma multiplicadores (máx 3.0).
   */
  fusion_potion: {
    id: 'fusion_potion',
    name: 'Poción de Fusión',
    icon: '🧪',
    rarity: 'legendary',
    desc: 'Combina dos hábitos: suma multiplicadores (máx 3.0).',
    effectType: 'instant',
    effectKey: 'fusion',
    effectValue: 0,
    maxStack: 1,
  },

  /**
   * ELIXIR DE ENFOQUE
   * Tipo: Temporal
   * Efecto: Añade +1.0 al multiplicador de un hábito específico durante 2 días.
   */
  focused_elixir: {
    id: 'focused_elixir',
    name: 'Elixir de Enfoque',
    icon: '🎯',
    rarity: 'rare',
    desc: 'Selecciona un hábito para añadirle +1.0 al multiplicador durante 2 días.',
    effectType: 'timed',
    effectKey: 'habit_mult_boost_target',
    effectValue: 1.0,
    durationDays: 2,
    maxStack: 2,
  },
};

// ════════════════════════════════════════════════════════════════════════
// COLORES POR RAREZA
// ════════════════════════════════════════════════════════════════════════

/**
 * Definición de colores y efectos visuales para cada nivel de rareza.
 * Se usa para mostrar los objetos con el estilo visual apropiado.
 */
export const RARITY_COLORS = {
  // Común: Gris azulado, sin brillo
  common: { color: '#a0a0c0', glow: 'none', label: 'COMÚN' },
  // Raro: Cian, brillo suave azul
  rare: { color: '#00e5ff', glow: '0 0 8px #00e5ff66', label: 'RARO' },
  // Épico: Púrpura, brillo púrpura
  epic: { color: '#b44fff', glow: '0 0 8px #b44fff66', label: 'ÉPICO' },
  // Legendario: Dorado, brillo dorado intenso
  legendary: { color: '#ffd700', glow: '0 0 12px #ffd70088', label: 'LEGENDARIO' },
};
