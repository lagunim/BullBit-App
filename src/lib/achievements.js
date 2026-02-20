import { formatDate, getStreak } from './gameEngine.js';

export const ACHIEVEMENTS = [
  { id:'first_step',      name:'PRIMER PASO',           description:'Completa tu primer hábito',                                icon:'🌟', rarity:'common',    reward:null },
  { id:'week_warrior',    name:'GUERRERO SEMANAL',      description:'Racha de 7 días en cualquier hábito',                     icon:'⚔️', rarity:'rare',      reward:'shield' },
  { id:'streak_10',       name:'RACHA DE FUEGO',        description:'Racha de 10 días en cualquier hábito',                    icon:'🔥', rarity:'rare',      reward:'elixir' },
  { id:'streak_30',       name:'MAESTRO CONSTANTE',     description:'Racha de 30 días en cualquier hábito',                    icon:'🏆', rarity:'epic',      reward:'double_xp' },
  { id:'multiplier_2',    name:'MOMENTUM',              description:'Alcanza ×2.0 en cualquier hábito',                        icon:'⚡', rarity:'uncommon',  reward:null },
  { id:'multiplier_3',    name:'IMPARABLE',             description:'Alcanza ×3.0 en cualquier hábito',                        icon:'💎', rarity:'epic',      reward:'time_warp' },
  { id:'multiplier_5',    name:'TRASCENDENCIA',         description:'Alcanza ×5.0 en cualquier hábito',                        icon:'🌌', rarity:'legendary', reward:'rune' },
  { id:'level_1',         name:'PRIMER NIVEL',          description:'Sube al Nivel 1 (Aventurero)',                             icon:'🎮', rarity:'uncommon',  reward:null },
  { id:'level_3',         name:'VETERANO',              description:'Alcanza el Nivel 3 (Héroe)',                               icon:'🛡️', rarity:'rare',      reward:'iron_will' },
  { id:'collector',       name:'COLECCIONISTA',         description:'Añade 5 hábitos diferentes',                              icon:'📋', rarity:'uncommon',  reward:null },
  { id:'thousand_points', name:'MIL PUNTOS',            description:'Acumula 1000 puntos en un mismo nivel',                   icon:'💯', rarity:'uncommon',  reward:'elixir' },
  { id:'perfect_week',    name:'SEMANA PERFECTA',       description:'Sin fallar ningún hábito durante 7 días',                 icon:'✨', rarity:'epic',      reward:'double_xp' },
  { id:'comeback',        name:'RESURGIMIENTO',         description:'Recupera un multiplicador desde 0.2 hasta 1.0',           icon:'🦅', rarity:'uncommon',  reward:null },
  { id:'early_bird',      name:'CONSTANTE DIGITAL',     description:'Completa hábitos en 10 días distintos',                   icon:'🌅', rarity:'common',    reward:null },
  { id:'night_grind',     name:'GRINDEO ÉPICO',         description:'Racha de 3 días en un hábito de 60+ minutos',             icon:'🌙', rarity:'rare',      reward:'mult_boost' },
  { id:'lucky',           name:'AFORTUNADO',            description:'Usa la Moneda de la Suerte',                              icon:'🪙', rarity:'common',    reward:null },
];

export const RARITY_COLORS = {
  common:    { color:'text-quest-textDim', border:'pixel-border',        label:'COMÚN' },
  uncommon:  { color:'glow-text-green',    border:'pixel-border-green',  label:'POCO COMÚN' },
  rare:      { color:'glow-text-blue',     border:'pixel-border-blue',   label:'RARO' },
  epic:      { color:'glow-text-purple',   border:'pixel-border-purple', label:'ÉPICO' },
  legendary: { color:'glow-text-gold',     border:'pixel-border-gold',   label:'LEGENDARIO' },
};

export function checkAchievements(state) {
  const { habits, completions, level, totalPoints, earnedAchievements, inventory } = state;
  const earned = new Set(earnedAchievements.map(a => a.id));
  const unlock = [];
  const chk = (id, cond) => { if (!earned.has(id) && cond) unlock.push(id); };

  const totalDone = Object.values(completions).filter(Boolean).length;
  const uniqueDays = new Set(Object.keys(completions).filter(k => completions[k]).map(k => k.split(':')[1])).size;
  const maxMult = habits.length > 0 ? Math.max(...habits.map(h => h.multiplier)) : 0;

  chk('first_step', totalDone >= 1);
  chk('collector', habits.length >= 5);
  chk('level_1', level >= 1);
  chk('level_3', level >= 3);
  chk('thousand_points', totalPoints >= 1000);
  chk('early_bird', uniqueDays >= 10);
  chk('multiplier_2', maxMult >= 2.0);
  chk('multiplier_3', maxMult >= 3.0);
  chk('multiplier_5', maxMult >= 5.0);
  chk('comeback', habits.some(h => h.multiplier >= 1.0 && (h.lowestMultiplier ?? 1) <= 0.4));
  chk('lucky', (inventory.lucky_coin || 0) === 0 && earned.has('first_step'));

  habits.forEach(h => {
    const s = getStreak(h.id, completions);
    chk('week_warrior', s >= 7);
    chk('streak_10', s >= 10);
    chk('streak_30', s >= 30);
    if (h.minutes >= 60) chk('night_grind', s >= 3);
  });

  // Perfect week check
  if (!earned.has('perfect_week') && habits.length > 0) {
    let perfect = true;
    outer: for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const date = d.toISOString().split('T')[0];
      for (const h of habits) {
        if (h.periodicity === 'Diaria' && !completions[`${h.id}:${date}`]) { perfect = false; break outer; }
      }
    }
    chk('perfect_week', perfect);
  }

  return unlock;
}
