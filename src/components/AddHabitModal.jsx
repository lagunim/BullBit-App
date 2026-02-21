import { useState } from 'react';
import { createPortal } from 'react-dom';
import useGameStore from '../store/gameStore.js';
import { HABIT_EMOJIS, PERIODICITY_LABELS } from '../utils/gameLogic.js';
import CustomPeriodicityModal from './CustomPeriodicityModal.jsx';

export default function AddHabitModal({ onClose }) {
  const addHabit = useGameStore(s => s.addHabit);
  const [form, setForm] = useState({ name: '', minutes: 20, periodicity: 'daily', emoji: '🎯', customDays: '', customInterval: '' });
  const [error, setError] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);

  function handleSubmit() {
    if (!form.name.trim()) { setError('¡EL NOMBRE ES OBLIGATORIO!'); return; }
    if (form.minutes < 1) { setError('¡MÍNIMO 1 MINUTO!'); return; }
    addHabit(form);
    onClose();
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10000] p-4 backdrop-blur-sm" 
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="anim-fade-in card-pixel w-full max-w-[420px] max-h-[calc(100dvh-60px)] overflow-y-auto flex flex-col gap-5 !p-6">
        {/* Title */}
        <div className="flex justify-between items-center border-b border-quest-border pb-3">
          <div className="text-[11px] text-quest-cyan font-pixel uppercase tracking-widest">
            ✚ Nuevo Hábito
          </div>
          <button onClick={onClose} className="btn-pixel-gray !py-3 !px-4 sm:!py-1 sm:!px-2 !text-[12px] sm:!text-[9px]">✕</button>
        </div>

        {/* Emoji selector */}
        <div>
          <label className="text-[9px] text-quest-textDim block mb-3 font-pixel">ICONO</label>
          <div className="grid grid-cols-6 gap-2">
            {HABIT_EMOJIS.map(em => (
              <button 
                key={em} 
                onClick={() => setForm(f => ({ ...f, emoji: em }))}
                className={`flex items-center justify-center p-2 text-xl border-2 transition-all ${
                  form.emoji === em 
                    ? 'bg-quest-panel border-quest-cyan shadow-[0_0_8px_theme(colors.quest.cyan)]' 
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
          <label className="text-[9px] text-quest-textDim block mb-2 font-pixel">NOMBRE</label>
          <input
            className="input-pixel"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Ej: Leer, Correr, Meditar..."
            maxLength={40}
          />
        </div>

        {/* Minutes */}
        <div>
          <label className="text-[9px] text-quest-textDim block mb-2 font-pixel">
            DURACIÓN (MIN) — <span className="text-quest-green">{form.minutes} pts</span>
          </label>
          <div className="flex items-center gap-3 mb-3">
            <input
              className="input-pixel !w-24 text-center"
              type="number"
              min={1} max={480}
              value={form.minutes}
              onChange={e => setForm(f => ({ ...f, minutes: Number(e.target.value) }))}
            />
            <div className="text-[7px] text-quest-textMuted uppercase">Puntos base por completion</div>
          </div>
        </div>

        {/* Periodicity */}
        <div>
          <label className="text-[9px] text-quest-textDim block mb-2 font-pixel">PERIODICIDAD</label>
          <div className="flex gap-2">
            <select
              className="input-pixel flex-1"
              value={form.periodicity}
              onChange={e => {
                setForm(f => ({ ...f, periodicity: e.target.value }));
                if (e.target.value === 'custom') {
                  setShowCustomModal(true);
                }
              }}
            >
              {Object.entries(PERIODICITY_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            {form.periodicity === 'custom' && (
              <button 
                onClick={() => setShowCustomModal(true)}
                className="btn-pixel-gray !py-3 !px-4 sm:!px-3 sm:!py-2 font-pixel text-[12px] sm:text-[9px]"
              >
                ✎
              </button>
            )}
          </div>
        </div>

        {error && <div className="text-quest-red text-[7px] font-pixel animate-pulse bg-quest-red/10 p-2 border border-quest-red">{error}</div>}

        <div className="flex gap-3 mt-2">
          <button onClick={onClose} className="btn-pixel-gray flex-1 uppercase">Cancelar</button>
          <button onClick={handleSubmit} className="btn-pixel-green flex-[2] uppercase font-bold tracking-widest">✚ Crear</button>
        </div>
        
        {showCustomModal && (
          <CustomPeriodicityModal
            initialDays={form.customDays}
            initialInterval={form.customInterval}
            onSave={(data) => {
              setForm(f => ({ ...f, customDays: data.days, customInterval: data.interval }));
              setShowCustomModal(false);
            }}
            onClose={() => setShowCustomModal(false)}
          />
        )}
      </div>
    </div>,
    document.body
  );
}
