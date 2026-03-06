import { useState } from 'react';
import { createPortal } from 'react-dom';
import useGameStore from '../store/gameStore.js';
import { PERIODICITY_LABELS } from '../utils/gameLogic.js';
import CustomPeriodicityModal from './CustomPeriodicityModal.jsx';
import { HABIT_THEMES, HABIT_THEME_BY_ID, DEFAULT_HABIT_THEME } from '../data/habitThemes.js';

export default function EditHabitModal({ habit, onClose }) {
  const updateHabit = useGameStore(s => s.updateHabit);
  const defaultTheme = HABIT_THEME_BY_ID[habit.themeId] ?? HABIT_THEME_BY_ID[DEFAULT_HABIT_THEME];
  const [form, setForm] = useState({
    name: habit.name,
    minutes: habit.minutes,
    periodicity: habit.periodicity,
    emoji: habit.emoji ?? defaultTheme?.icon,
    themeId: habit.themeId ?? DEFAULT_HABIT_THEME,
    customDays: habit.customDays || '',
    customInterval: habit.customInterval || '',
    customWeeklyTimes: habit.weeklyTimesTarget ? String(habit.weeklyTimesTarget) : '',
  });
  const [error, setError] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);

  function handleSubmit() {
    if (!form.name.trim()) { setError('¡EL NOMBRE ES OBLIGATORIO!'); return; }
    if (form.minutes < 1) { setError('¡MÍNIMO 1 MINUTO!'); return; }
    const habitPayload = {
      ...form,
      weeklyTimesTarget: null,
    };
    if (form.periodicity === 'custom' && form.customWeeklyTimes) {
      const target = Number(form.customWeeklyTimes);
      if (!Number.isFinite(target) || target < 1) {
        setError('¡MÍNIMO 1 VEZ POR SEMANA!');
        return;
      }
      habitPayload.weeklyTimesTarget = target;
      habitPayload.customDays = '';
      habitPayload.customInterval = '';
    }
    updateHabit(habit.id, habitPayload);
    onClose();
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4 backdrop-blur-sm shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="anim-fade-in card-pixel w-full max-w-[420px] max-h-[calc(100dvh-60px)] overflow-y-auto flex flex-col gap-5 !p-6 border-quest-gold shadow-[4px_4px_0_theme(colors.quest.goldDark)]">
        {/* Title */}
        <div className="flex justify-between items-center border-b border-quest-border pb-3">
          <div className="text-sm sm:text-xs text-quest-gold font-pixel uppercase tracking-widest flex items-center gap-2">
            <span className="animate-pulse">✎</span> Editar Misión
          </div>
          <button onClick={onClose} className="btn-pixel-gray !py-3 !px-4 sm:!py-1 sm:!px-2 !text-sm sm:!text-xs">✕</button>
        </div>

        {/* Emoji selector */}
        <div>
          <label className="text-sm sm:text-[9px] text-quest-textDim block mb-3 font-pixel">TEMÁTICA</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {HABIT_THEMES.map(theme => {
              const isSelected = form.themeId === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, themeId: theme.id, emoji: theme.icon }))}
                  className={`flex flex-col items-center justify-center gap-1 py-3 rounded border-2 transition-all ${isSelected
                    ? 'bg-quest-panel border-quest-gold shadow-[0_0_8px_theme(colors.quest.gold)] scale-105'
                    : 'bg-quest-bg border-quest-border hover:border-quest-textDim'
                    }`}
                >
                  <span className="text-3xl leading-[1]">{theme.icon}</span>
                  {isSelected && (
                    <span className="text-[10px] uppercase text-quest-textDim">{theme.label}</span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="text-[10px] uppercase text-quest-textDim mt-2">
            {HABIT_THEME_BY_ID[form.themeId]?.description}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="text-sm sm:text-[9px] text-quest-textDim block mb-2 font-pixel">NOMBRE DE LA MISIÓN</label>
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
          <label className="text-sm sm:text-[9px] text-quest-textDim block mb-2 font-pixel">
            DURACIÓN (MINUTOS) — <span className="text-quest-green">{form.minutes} pts</span>
          </label>
          <div className="flex items-center gap-3 mb-3">
            <input
              className="input-pixel !w-24 text-center"
              type="number"
              inputMode="numeric"
              min={1} max={480}
              value={form.minutes}
              onChange={e => setForm(f => ({ ...f, minutes: Number(e.target.value) }))}
            />
          </div>
        </div>

        {/* Periodicity */}
        <div>
          <label className="text-sm sm:text-[9px] text-quest-textDim block mb-2 font-pixel">FRECUENCIA</label>
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
                className="btn-pixel-gray !py-3 !px-4 sm:!px-3 sm:!py-2 font-pixel text-sm sm:text-xs"
              >
                ✎
              </button>
            )}
          </div>
        </div>

        {form.periodicity === 'weekly_times' && (
          <div>
            <label className="text-[18px] sm:text-[9px] text-quest-textDim block mb-2 font-pixel">VECES POR SEMANA</label>
            <div className="flex items-center gap-3">
              <input
                className="input-pixel !w-20 text-center"
                type="number"
                inputMode="numeric"
                min={1} max={7}
                value={form.weeklyTimesTarget}
                onChange={e => setForm(f => ({ ...f, weeklyTimesTarget: e.target.value }))}
                placeholder="3"
              />
              <div className="text-[16px] sm:text-[7px] text-quest-textMuted uppercase">veces esta semana</div>
            </div>
          </div>
        )}

        {error && <div className="text-quest-red text-[16px] sm:text-[7px] font-pixel animate-pulse bg-quest-red/10 p-2 border border-quest-red">{error}</div>}

        <div className="flex gap-3 mt-2">
          <button onClick={onClose} className="btn-pixel-gray flex-1 uppercase">Cancelar</button>
          <button onClick={handleSubmit} className="btn-pixel-gold flex-[2] uppercase font-bold tracking-widest shadow-[inset_0_0_10px_rgba(255,255,255,0.2)]">💾 Guardar Cambios</button>
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
