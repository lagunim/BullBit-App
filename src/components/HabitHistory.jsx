import useGameStore from '../store/gameStore.js';
import { getDateKey } from '../utils/gameLogic.js';

const STATUS_STYLE = {
  completed: { bg: 'bg-[#003322]', border: 'border-quest-green', symbol: '✔', text: 'text-quest-green' },
  failed:    { bg: 'bg-[#330011]', border: 'border-quest-red', symbol: '✖', text: 'text-quest-red' },
  none:      { bg: 'bg-quest-bg', border: 'border-quest-border', symbol: '·', text: 'text-quest-textMuted' },
};

export default function HabitHistory() {
  const habits = useGameStore(s => s.habits ?? []);
  const history = useGameStore(s => s.history ?? {});

  const DAYS = 14; // Showing 14 days for mobile better fit
  const dates = Array.from({ length: DAYS }, (_, i) => getDateKey(DAYS - 1 - i));

  if (habits.length === 0) {
    return (
      <div className="text-center py-10 text-quest-textMuted font-pixel text-[8px] uppercase tracking-widest border-2 border-dashed border-quest-border">
        SIN HÁBITOS — CREA UNO PRIMERO ⚔️
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-quest-border pb-3">
        <div className="text-[10px] text-quest-cyan font-pixel mb-2 tracking-widest uppercase">📅 Historial</div>
        <div className="text-[7px] text-quest-textDim leading-relaxed uppercase">
          Registro de los últimos {DAYS} días. Mantén el ritmo para evitar penalizaciones en el multiplicador.
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap">
        {Object.entries(STATUS_STYLE).map(([key, s]) => (
          <div key={key} className={`flex items-center gap-2 text-[7px] font-pixel ${s.text}`}>
            <div className={`w-3 h-3 ${s.bg} border ${s.border}`} />
            <span className="uppercase tracking-tighter">
              {key === 'completed' ? 'HECHO' : key === 'failed' ? 'FALLO' : 'VACÍO'}
            </span>
          </div>
        ))}
      </div>

      {/* Grid-based History Table */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[480px]">
          <div className="flex border-b-2 border-quest-border pb-2 mb-2">
            <div className="w-32 shrink-0 text-[7px] text-quest-textMuted font-pixel tracking-tighter uppercase self-end">Hábito</div>
            <div className="flex-1 flex justify-around">
              {dates.map(d => {
                const short = d.slice(8); // DD only
                const isToday = d === getDateKey(0);
                return (
                  <div key={d} className={`text-[6px] font-pixel text-center ${isToday ? 'text-quest-cyan underline decoration-2' : 'text-quest-textMuted'}`}>
                    {short}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            {habits.map(habit => (
              <div key={habit.id} className="flex items-center">
                <div className="w-32 shrink-0 text-[8px] truncate pr-2 uppercase font-pixel tracking-tighter leading-none">
                  {habit.emoji} {habit.name}
                </div>
                <div className="flex-1 flex justify-around">
                  {dates.map(d => {
                    const status = history[d]?.[habit.id] ?? 'none';
                    const s = STATUS_STYLE[status] ?? STATUS_STYLE.none;
                    const isToday = d === getDateKey(0);
                    return (
                      <div key={d} className={`w-5 h-5 flex items-center justify-center text-[9px] border transition-all ${s.bg} ${s.border} ${s.text} ${isToday && status === 'none' ? 'animate-pulse scale-110 border-quest-cyan' : ''}`}>
                        {s.symbol}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
        {habits.map(habit => {
          const completed = dates.filter(d => history[d]?.[habit.id] === 'completed').length;
          const failed = dates.filter(d => history[d]?.[habit.id] === 'failed').length;
          const rate = completed + failed > 0 ? Math.round((completed / (completed + failed)) * 100) : 0;
          return (
            <div key={habit.id} className="card-pixel !p-3">
              <div className="text-[8px] font-pixel mb-3 flex items-center gap-2 uppercase tracking-tighter border-b border-quest-border pb-2">
                <span>{habit.emoji}</span>
                <span className="truncate">{habit.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-[7px] font-pixel uppercase tracking-tighter">
                <div className="text-quest-textDim">COMPLETADOS:</div>
                <div className="text-quest-green text-right">{completed}</div>
                <div className="text-quest-textDim">FALLADOS:</div>
                <div className="text-quest-red text-right">{failed}</div>
                <div className="text-quest-textDim pt-2 border-t border-quest-border">TASA ÉXITO:</div>
                <div className="text-quest-gold text-right pt-2 border-t border-quest-border">{rate}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
