import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function CustomPeriodicityModal({
  initialDays = '',
  initialInterval = '',
  initialWeeklyTimes = '',
  onSave,
  onClose,
}) {
  const [mode, setMode] = useState('days');
  const [days, setDays] = useState('');
  const [interval, setIntervalVal] = useState('');
  const [weeklyTimes, setWeeklyTimes] = useState('');

  useEffect(() => {
    if (initialWeeklyTimes && Number(initialWeeklyTimes) > 0) {
      setMode('weekly_times');
      setWeeklyTimes(initialWeeklyTimes);
      setDays('');
      setIntervalVal('');
      return;
    }

    if (initialInterval && Number(initialInterval) > 0) {
      setMode('interval');
      setIntervalVal(initialInterval);
      setDays('');
      setWeeklyTimes('');
      return;
    }

    setMode('days');
    setDays(initialDays);
    setIntervalVal('');
    setWeeklyTimes('');
  }, [initialDays, initialInterval, initialWeeklyTimes]);

  function save() {
    onSave({
      days: mode === 'days' ? days : '',
      interval: mode === 'interval' ? interval : '',
      weeklyTimes: mode === 'weekly_times' ? weeklyTimes : '',
      mode,
    });
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[20000] p-4 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="anim-fade-in card-pixel w-full max-w-[420px] flex flex-col gap-4 !p-6 border-quest-cyan shadow-[4px_4px_0_theme(colors.quest.cyan)]">
        <div className="flex justify-between items-center border-b border-quest-border pb-2">
          <div className="text-[11px] text-quest-cyan font-pixel uppercase tracking-widest">PERSONALIZADO</div>
          <button onClick={onClose} className="btn-pixel-gray !py-1 !px-2 !text-[9px]">✕</button>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" name="custom-mode" checked={mode === 'days'} onChange={() => setMode('days')} className="accent-quest-cyan" />
          <span className="text-[9px] text-quest-text font-pixel">Días específicos (1-7, separados por coma)</span>
        </label>
        {mode === 'days' && (
          <div className="w-full flex flex-col items-center">
            <input
              className="input-pixel w-full text-center"
              value={days}
              onChange={e => setDays(e.target.value)}
              placeholder="Ej: 1,3,5"
              title="Ej: 1,3,5 (Lun, Mie, Vie)"
            />
          </div>
        )}

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" name="custom-mode" checked={mode === 'interval'} onChange={() => setMode('interval')} className="accent-quest-cyan" />
          <span className="text-[9px] text-quest-text font-pixel">Periodicidad (cada cuántos días)</span>
        </label>
        {mode === 'interval' && (
          <div className="w-full flex flex-col items-center">
            <input
              className="input-pixel w-full text-center"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              step="1"
              min={1}
              value={interval}
              onChange={e => setIntervalVal(e.target.value)}
              placeholder="Ej: 2"
              title="Ej: 2 (Cada 2 días)"
            />
          </div>
        )}

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" name="custom-mode" checked={mode === 'weekly_times'} onChange={() => setMode('weekly_times')} className="accent-quest-cyan" />
          <span className="text-[9px] text-quest-text font-pixel">Veces por semana</span>
        </label>
        {mode === 'weekly_times' && (
          <div className="w-full flex flex-col items-center gap-2">
            <input
              className="input-pixel w-full text-center"
              type="number"
              inputMode="numeric"
              pattern="[0-7]*"
              step="1"
              min={1}
              max={7}
              value={weeklyTimes}
              onChange={e => setWeeklyTimes(e.target.value)}
              placeholder="3"
            />
            <span className="text-[8px] text-quest-textMuted font-pixel uppercase">veces por semana</span>
          </div>
        )}

        <div className="flex gap-3 mt-3">
          <button onClick={onClose} className="btn-pixel-gray flex-1 uppercase">Cancelar</button>
          <button onClick={save} className="btn-pixel-green flex-[2] uppercase font-bold tracking-widest">Guardar</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
