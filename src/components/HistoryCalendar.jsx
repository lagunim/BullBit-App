/**
 * HistoryCalendar - Visualización de historial en formato calendario
 * 
 * Muestra un calendario de contribución (similar a GitHub) con los
 * últimos 90 días de actividad de cada hábito. Incluye:
 * - Gráfico de matriz (13 semanas x 7 días)
 * - Estadísticas: tasa de éxito, racha actual, total completado
 * - Indicadores visuales: completado (verde), fallado (gris), hoy (dorado)
 * 
 * @component
 * @param {Object} props
 * @param {Array} props.habits - Array de hábitos
 * @param {Object} props.completions - Objeto con completaciones por fecha
 * @returns {JSX.Element|null} Calendario de historial o mensaje si no hay hábitos
 */
import { formatDate } from '../lib/gameEngine.js';

/**
 * Genera un array con los últimos 90 días formateados
 * Utilizado para el calendario de contribuciones
 * 
 * @returns {Array} Array de 90 fechas formateadas (más antigua a más reciente)
 */
function getLast90() {
  return Array.from({ length: 90 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (89 - i));
    return formatDate(d);
  });
}

export default function HistoryCalendar({ habits, completions }) {
  const days = getLast90();
  const today = formatDate();

  if (!habits.length) return (
    <div className="pixel-border bg-quest-panel p-12 text-center">
      <p className="font-pixel text-quest-textMuted text-[10px]">SIN HÁBITOS — AÑADE UNO PRIMERO</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="font-pixel text-[10px] text-quest-text">HISTORIAL (90 DÍAS)</h2>
      {habits.map(habit => {
        const statuses = days.map(date => ({
          date, done: !!completions[`${habit.id}:${date}`],
          isToday: date === today, isFuture: date > today,
        }));
        const done = statuses.filter(d => d.done).length;
        const past = statuses.filter(d => !d.isFuture).length;
        const rate = past ? Math.round((done / past) * 100) : 0;
        let streak = 0;
        for (let i = statuses.length - 1; i >= 0; i--) {
          if (statuses[i].done) streak++; else if (!statuses[i].isToday) break; else break;
        }

        return (
          <div key={habit.id} className="pixel-border bg-quest-card p-4">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{habit.icon}</span>
                <span className="font-pixel text-[10px] text-quest-text">{habit.name}</span>
              </div>
              <div className="flex gap-4">
                {[
                  { label: 'TASA', val: `${rate}%`, color: rate >= 80 ? 'glow-text-green' : rate >= 50 ? 'glow-text-gold' : 'glow-text-red' },
                  { label: 'RACHA', val: `🔥${streak}d`, color: 'glow-text-gold' },
                  { label: 'TOTAL', val: `${done}d`, color: 'glow-text-cyan' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="text-center">
                    <div className="font-pixel text-[7px] text-quest-textDim">{label}</div>
                    <div className={`font-pixel text-[10px] ${color}`}>{val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grid - 13 weeks × 7 days */}
            <div className="overflow-x-auto pb-1">
              <div style={{ display: 'grid', gridAutoFlow: 'column', gridTemplateRows: 'repeat(7, 1fr)', gap: '3px' }}>
                {statuses.map((day, i) => (
                  <div key={i} title={`${day.date}: ${day.done ? '✓' : day.isFuture ? '—' : '✗'}`}
                    className={`w-4 h-4 border ${day.done ? 'bg-quest-greenDark border-quest-green' : day.isToday ? 'bg-quest-bg border-quest-gold animate-blink' : day.isFuture ? 'bg-transparent border-transparent' : 'bg-quest-bg border-quest-border opacity-40'}`} />
                ))}
              </div>
            </div>
            <div className="flex gap-4 mt-3">
              {[['bg-quest-greenDark border-quest-green','COMPLETADO'],['bg-quest-bg border-quest-border opacity-40','FALLADO'],['bg-quest-bg border-quest-gold','HOY']].map(([cls,lbl]) => (
                <div key={lbl} className="flex items-center gap-1">
                  <div className={`w-3 h-3 border ${cls}`} />
                  <span className="font-pixel text-[7px] text-quest-textMuted">{lbl}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
