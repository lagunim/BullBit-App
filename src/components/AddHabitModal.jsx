/**
 * AddHabitModal - Modal para crear nuevos hábitos
 * 
 * Formulario modal que permite al usuario crear un nuevo hábito
 * con las siguientes opciones:
 * - Icono/temática del hábito (seleccionable de una lista predefinida)
 * - Nombre del hábito (obligatorio)
 * - Duración en minutos (para calcular puntos base)
 * - Periodicidad: diaria, semanal, personalizada
 * 
 * @component
 * @param {Object} props
 * @param {Function} props.onClose - Función para cerrar el modal
 * @returns {JSX.Element} Modal con formulario de creación de hábito
 */
import { useState } from 'react';
import { createPortal } from 'react-dom';
import useGameStore from '../store/gameStore.js';
import { PERIODICITY_LABELS } from '../utils/gameLogic.js';
import { HABIT_THEMES, DEFAULT_HABIT_THEME, HABIT_THEME_BY_ID } from '../data/habitThemes.js';
import CustomPeriodicityModal from './CustomPeriodicityModal.jsx';

export default function AddHabitModal({ onClose }) {
  const addHabit = useGameStore(s => s.addHabit);
  // Obtiene el tema por defecto para el emoji inicial
  const defaultTheme = HABIT_THEME_BY_ID[DEFAULT_HABIT_THEME] ?? HABIT_THEMES[0];

  // Estado del formulario con valores iniciales
  const [form, setForm] = useState({
    name: '',
    minutes: '',
    periodicity: 'daily',
    emoji: defaultTheme?.icon ?? '🎯',
    themeId: defaultTheme?.id ?? DEFAULT_HABIT_THEME,
    customDays: '',
    customInterval: '',
    customWeeklyTimes: '',
  });
  const [error, setError] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Valida y crea el nuevo hábito
  function handleSubmit() {
    // Validar nombre obligatorio
    if (!form.name.trim()) { setError('¡EL NOMBRE ES OBLIGATORIO!'); return; }
    // Validar duración mínima
    const mins = form.minutes === '' ? 20 : Number(form.minutes);
    if (mins < 1) { setError('¡MÍNIMO 1 MINUTO!'); return; }

    const habitPayload = {
      ...form,
      minutes: mins,
      weeklyTimesTarget: null,
    };

    // Manejar periodicidad personalizada semanal
    if (form.periodicity === 'custom' && form.customWeeklyTimes) {
      const target = Number(form.customWeeklyTimes);
      if (!Number.isFinite(target) || target < 1) {
        setError('¡MÍNIMO 1 VEZ POR SEMANA!');
        return;
      }
      habitPayload.periodicity = 'weekly_times';
      habitPayload.weeklyTimesTarget = target;
      habitPayload.customDays = '';
      habitPayload.customInterval = '';
    }

    addHabit(habitPayload);
    onClose();
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="anim-fade-in card-pixel w-full max-w-[420px] max-h-[calc(100dvh-60px)] overflow-y-auto flex flex-col gap-5 !p-6">
        {/* Title */}
        <div className="flex justify-between items-center border-b border-quest-border pb-3">
          <h2 className="text-sm sm:text-xs text-quest-cyan font-pixel uppercase tracking-widest">
            ✚ Nuevo Hábito
          </h2>
          <button onClick={onClose} className="btn-pixel-gray !py-3 !px-4 sm:!py-1 sm:!px-2 !text-sm sm:!text-xs">✕</button>
        </div>

        {/* Emoji selector - 3 columnas, 2 filas */}
        <div>
          <label className="text-[9px] text-quest-textDim block mb-2 font-pixel">ICONO</label>
          <div className="grid grid-cols-3 gap-2">
            {HABIT_THEMES.map(theme => {
              const isSelected = form.themeId === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, themeId: theme.id, emoji: theme.icon }))}
                  className={`flex flex-col items-center justify-center py-2 gap-2 rounded border-2 transition-all ${isSelected
                    ? 'bg-quest-panel border-quest-cyan shadow-[0_0_8px_theme(colors.quest.cyan)]'
                    : 'bg-quest-bg border-quest-border hover:border-quest-textDim'
                    }`}
                >
                  <span className="text-2xl leading-[1]">{theme.icon}</span>
                  <span className="text-[7px] uppercase text-quest-textDim mt-1">{theme.label}</span>
                </button>
              );
            })}
          </div>
          <div className="text-[9px] text-quest-textDim uppercase mt-2 font-pixel">
            {HABIT_THEME_BY_ID[form.themeId]?.description}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="text-sm sm:text-[9px] text-quest-textDim block mb-2 font-pixel">NOMBRE</label>
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
            DURACIÓN (MIN) — <span className="text-quest-green">{(form.minutes === '' ? 20 : form.minutes)} pts</span>
          </label>
          <div className="flex items-center gap-3 mb-3">
            <input
              className="input-pixel !w-24 text-center"
              type="number"
              inputMode="numeric"
              min={1} max={480}
              value={form.minutes}
              onChange={e => setForm(f => ({ ...f, minutes: e.target.value }))}
              placeholder="20"
            />
            <div className="text-xs sm:text-[8px] text-quest-textMuted uppercase">Puntos base por completion</div>
          </div>
        </div>

        {/* Periodicity */}
        {/* Selector de periodicidad: diaria, semanal, o personalizada */}
        <div>
          <label className="text-sm sm:text-[9px] text-quest-textDim block mb-2 font-pixel">PERIODICIDAD</label>
          <div className="flex gap-2">
            <select
              className="input-pixel flex-1"
              value={form.periodicity}
              onChange={e => {
                const nextPeriodicity = e.target.value;
                setForm(f => ({
                  ...f,
                  periodicity: nextPeriodicity,
                  ...(nextPeriodicity !== 'custom'
                    ? { customDays: '', customInterval: '', customWeeklyTimes: '' }
                    : {}),
                }));
                if (nextPeriodicity === 'custom') {
                  setShowCustomModal(true);
                }
              }}
            >
              {Object.entries(PERIODICITY_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            {/* Botón para abrir modal de periodicidad personalizada */}
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

        {error && <div className="text-quest-red text-[16px] sm:text-[7px] font-pixel animate-pulse bg-quest-red/10 p-2 border border-quest-red">{error}</div>}

        <div className="flex gap-3 mt-2">
          <button onClick={onClose} className="btn-pixel-gray flex-1 uppercase">Cancelar</button>
          <button onClick={handleSubmit} className="btn-pixel-green flex-[2] uppercase font-bold tracking-widest">✚ Crear</button>
        </div>

        {showCustomModal && (
          <CustomPeriodicityModal
            initialDays={form.customDays}
            initialInterval={form.customInterval}
            initialWeeklyTimes={form.customWeeklyTimes}
            onSave={(data) => {
              setForm(f => ({
                ...f,
                periodicity: 'custom',
                customDays: data.days,
                customInterval: data.interval,
                customWeeklyTimes: data.weeklyTimes,
              }));
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
