import { useState } from 'react';
import { createPortal } from 'react-dom';

export default function CustomPeriodicityModal({ initialDays = '', initialInterval = '', onSave, onClose }) {
  const [days, setDays] = useState(initialDays);
  const [interval, setIntervalVal] = useState(initialInterval);

  return createPortal(
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[20000] p-4 backdrop-blur-sm" 
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="anim-fade-in card-pixel w-full max-w-[420px] flex flex-col gap-5 !p-6 border-quest-cyan shadow-[4px_4px_0_theme(colors.quest.cyan)]">
        <div className="flex justify-between items-center border-b border-quest-border pb-3">
          <div className="text-[11px] text-quest-cyan font-pixel uppercase tracking-widest">
            PERSONALIZADO
          </div>
          <button onClick={onClose} className="btn-pixel-gray !py-1 !px-2 !text-[9px]">✕</button>
        </div>

        <div>
          <label className="text-[9px] text-quest-text block mb-2 font-pixel" title="Ej: 1,3,5 (Lun, Mie, Vie)">
            Días (1-7, separados por coma)
          </label>
          <input
            className="input-pixel"
            value={days}
            onChange={e => setDays(e.target.value)}
            placeholder="Ej: 1,3,5"
            title="Ej: 1,3,5 (Lun, Mie, Vie)"
          />
        </div>

        <div>
          <label className="text-[9px] text-quest-text block mb-2 font-pixel" title="Ej: 2 (Cada 2 días)">
            Periocidad
          </label>
          <input
            className="input-pixel"
            type="text"
            value={interval}
            onChange={e => setIntervalVal(e.target.value)}
            placeholder="Ej: 2"
            title="Ej: 2 (Cada 2 días)"
          />
        </div>

        <div className="flex gap-3 mt-2">
          <button 
            onClick={onClose} 
            className="btn-pixel-gray flex-1 uppercase"
          >
            Cancelar
          </button>
          <button 
            onClick={() => onSave({ days, interval })} 
            className="btn-pixel-green flex-[2] uppercase font-bold tracking-widest"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
