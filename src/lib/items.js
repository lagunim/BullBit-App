export const ITEMS = {
  shield:    { id:'shield',    name:'ESCUDO DEL COMPROMISO',  description:'Falla un día sin perder el multiplicador. 1 uso.',                 icon:'🛡️', rarity:'rare',      effectType:'shield',    durationDays:1, uses:1,    value:0 },
  double_xp: { id:'double_xp',name:'PERGAMINO DE DOBLE XP',  description:'Añade +2 a todos los multiplicadores durante 3 días.',              icon:'📜', rarity:'epic',      effectType:'double_xp', durationDays:3, uses:null, value:0 },
  time_warp: { id:'time_warp',name:'CRISTAL DEL TIEMPO',     description:'Marca ayer como completado en el hábito elegido.',                  icon:'🔮', rarity:'epic',      effectType:'time_warp', durationDays:0, uses:1,    value:0 },
  iron_will: { id:'iron_will',name:'VOLUNTAD DE HIERRO',     description:'Reduce la penalización de -0.4 a -0.2 durante 7 días.',             icon:'⚒️', rarity:'rare',      effectType:'iron_will', durationDays:7, uses:null, value:0 },
  elixir:    { id:'elixir',   name:'ELIXIR DE LA RACHA',     description:'Añade +0.4 al multiplicador del hábito elegido al instante.',       icon:'⚗️', rarity:'uncommon',  effectType:'elixir',    durationDays:0, uses:1,    value:0 },
  rune:      { id:'rune',     name:'RUNA DE PROTECCIÓN',     description:'Protege tu racha de penalizaciones durante 3 días.',                icon:'🔱', rarity:'legendary', effectType:'shield',    durationDays:3, uses:null, value:0 },
  mult_boost:{ id:'mult_boost',name:'AMULETO DEL PODER',     description:'Añade +1.0 a todos los multiplicadores durante 2 días.',            icon:'🏺', rarity:'epic',      effectType:'mult_boost',durationDays:2, uses:null, value:1.0 },
  lucky_coin:{ id:'lucky_coin',name:'MONEDA DE LA SUERTE',   description:'El próximo hábito que completes da el doble de puntos.',            icon:'🪙', rarity:'uncommon',  effectType:'lucky_coin',durationDays:0, uses:1,    value:0 },
};

export const RARITY_COLORS  = { common:'text-quest-textDim', uncommon:'glow-text-green', rare:'glow-text-blue', epic:'glow-text-purple', legendary:'glow-text-gold' };
export const RARITY_BORDERS = { common:'pixel-border',        uncommon:'pixel-border-green', rare:'pixel-border-blue', epic:'pixel-border-purple', legendary:'pixel-border-gold' };
export const RARITY_LABELS  = { common:'COMÚN', uncommon:'POCO COMÚN', rare:'RARO', epic:'ÉPICO', legendary:'LEGENDARIO' };
