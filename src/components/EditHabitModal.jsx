import { useState } from 'react';
import { createPortal } from 'react-dom';
import useGameStore from '../store/gameStore.js';
import { HABIT_EMOJIS, PERIODICITY_LABELS } from '../utils/gameLogic.js';

export default function EditHabitModal({ habit, onClose }) {
  const updateHabit = useGameStore(s => s.updateHabit);
  const [form, setForm] = useState({ 
    name: habit.name, 
    minutes: habit.minutes, 
    periodicity: habit.periodicity, 
    emoji: habit.emoji 
  });
  const [error, setError] = useState('');

  function handleSubmit() {
    if (!form.name.trim()) { setError('¡EL NOMBRE ES OBLIGATORIO!'); return; }
    if (form.minutes < 1) { setError('¡MÍNIMO 1 MINUTO!'); return; }
    updateHabit(habit.id, form);
    onClose();
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[10000] p-4 backdrop-blur-sm shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" 
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="anim-fade-in card-pixel w-full max-w-[420px] max-h-[calc(100dvh-60px)] overflow-y-auto flex flex-col gap-5 !p-6 border-quest-gold shadow-[4px_4px_0_theme(colors.quest.goldDark)]">
        {/* Title */}
        <div className="flex justify-between items-center border-b border-quest-border pb-3">
          <div className="text-[11px] text-quest-gold font-pixel uppercase tracking-widest flex items-center gap-2">
            <span className="animate-pulse">✎</span> Editar Misión
          </div>
          <button onClick={onClose} className="btn-pixel-gray !py-1 !px-2 !text-[9px]">✕</button>
        </div>

        {/* Emoji selector */}
        <div>
          <label className="text-[9px] text-quest-textDim block mb-3 font-pixel">CAMBIAR ICONO</label>
          <div className="grid grid-cols-6 gap-2">
            {HABIT_EMOJIS.map(em => (
              <button 
                key={em} 
                onClick={() => setForm(f => ({ ...f, emoji: em }))}
                className={`flex items-center justify-center p-2 text-xl border-2 transition-all ${
                  form.emoji === em 
                    ? 'bg-quest-panel border-quest-gold shadow-[0_0_8px_theme(colors.quest.gold)] scale-110 z-10' 
                    : 'bg-quest-bg border-quest-border hover:border-quest-textDim'
                }`}
              >
                {em}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="text-[9px] text-quest-textDim block mb-2 font-pixel">NOMBRE DE LA MISIÓN</label>
          <input
            className="input-pixel"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Ej: Leer, Correr..."
            maxLength={40}
          />
        </div>

        {/* Minutes */}
        <div>
          <label className="text-[9px] text-quest-textDim block mb-2 font-pixel">
            DURACIÓN (MINUTOS) — <span className="text-quest-green">{form.minutes} pts</span>
          </label>
          <div className="flex items-center gap-3 mb-3">
            <input
              className="input-pixel !w-24 text-center"
              type="number"
              min={1} max={480}
              value={form.minutes}
              onChange={e => setForm(f => ({ ...f, minutes: Number(e.target.value) }))}
            />
          </div>
          {/* Quick presets */}
          <div className="flex flex-wrap gap-2">
            {[10, 15, 20, 30, 45, 60].map(m => (
              <button 
                key={m} 
                onClick={() => setForm(f => ({ ...f, minutes: m }))}
                className={`btn-pixel !px-2.5 !py-1.5 !text-[7px] ${
                  form.minutes === m ? 'bg-quest-panel border-quest-gold text-quest-gold' : 'btn-pixel-gray'
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>

        {/* Periodicity */}
        <div>
          <label className="text-[9px] text-quest-textDim block mb-2 font-pixel">FRECUENCIA</label>
          <select
            className="input-pixel"
            value={form.periodicity}
            onChange={e => setForm(f => ({ ...f, periodicity: e.target.value }))}
          >
            {Object.entries(PERIODICITY_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        {error && <div className="text-quest-red text-[7px] font-pixel animate-pulse bg-quest-red/10 p-2 border border-quest-red">{error}</div>}

        <div className="flex gap-3 mt-2">
          <button onClick={onClose} className="btn-pixel-gray flex-1 uppercase">Cancelar</button>
          <button onClick={handleSubmit} className="btn-pixel-gold flex-[2] uppercase font-bold tracking-widest shadow-[inset_0_0_10px_rgba(255,255,255,0.2)]">💾 Guardar Cambios</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
