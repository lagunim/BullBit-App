import { useState } from 'react';
import { createPortal } from 'react-dom';
import useGameStore from '../store/gameStore.js';

function createUuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  const bytes = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export default function CreatePlanModal({ onClose, editDate = null }) {
  const { createPlan, updatePlan, plans } = useGameStore();

  const existingPlan = editDate ? plans[editDate] : null;

  const today = new Date();
  const getDateString = (date) => date.toISOString().split('T')[0];

  const [planName, setPlanName] = useState(existingPlan?.name || '');
  const [planDate, setPlanDate] = useState(existingPlan?.date || getDateString(today));
  const [tasks, setTasks] = useState(
    existingPlan?.tasks?.filter(t => !t.deleted).map(t => ({
      id: t.id,
      name: t.name,
      durationMinutes: t.durationMinutes,
    })) || [{ id: createUuid(), name: '', durationMinutes: '' }]
  );
  const [error, setError] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  const calendarDate = new Date(planDate + 'T12:00:00');
  const [calendarMonth, setCalendarMonth] = useState(calendarDate.getMonth());
  const [calendarYear, setCalendarYear] = useState(calendarDate.getFullYear());

  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

  function getDaysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(month, year) {
    return new Date(year, month, 1).getDay();
  }

  function handleAddTask() {
    setTasks([...tasks, { id: createUuid(), name: '', durationMinutes: '' }]);
  }

  function handleRemoveTask(index) {
    if (tasks.length > 1) {
      setTasks(tasks.filter((_, i) => i !== index));
    }
  }

  function handleTaskChange(index, field, value) {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTasks(newTasks);
  }

  function handleSelectDate(day) {
    const selectedDate = new Date(calendarYear, calendarMonth, day);
    setPlanDate(getDateString(selectedDate));
    setShowCalendar(false);
  }

  function handleSubmit() {
    const validTasks = tasks.filter(t => t.name.trim() && t.durationMinutes > 0);

    if (validTasks.length === 0) {
      setError('¡AL MENOS UNA TAREA CON NOMBRE Y DURACIÓN!');
      return;
    }

    const planData = {
      name: planName.trim() || 'Mi Plan',
      date: planDate,
      tasks: validTasks,
    };

    if (existingPlan) {
      updatePlan(editDate, planData);
    } else {
      createPlan(planData);
    }

    onClose();
  }

  const totalMinutes = tasks.reduce((sum, t) => sum + (parseInt(t.durationMinutes) || 0), 0);
  const todayStr = getDateString(today);

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(calendarMonth, calendarYear);
    const firstDay = getFirstDayOfMonth(calendarMonth, calendarYear);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = getDateString(new Date(calendarYear, calendarMonth, day));
      const isSelected = dateStr === planDate;
      const isToday = dateStr === todayStr;
      const isPast = dateStr < todayStr;
      const hasPlan = plans[dateStr] && dateStr !== editDate;

      days.push(
        <button
          key={day}
          onClick={() => handleSelectDate(day)}
          disabled={hasPlan}
          className={`
            p-1 text-[10px] sm:text-xs rounded transition-all
            ${isSelected ? 'bg-quest-cyan text-black font-bold' : ''}
            ${isToday && !isSelected ? 'border border-quest-cyan text-quest-cyan' : ''}
            ${hasPlan ? 'opacity-30 cursor-not-allowed' : 'hover:bg-quest-border'}
            ${isPast && !isSelected ? 'opacity-40' : ''}
          `}
        >
          {day}
          {hasPlan && <span className="block text-[8px] text-quest-gold">📋</span>}
        </button>
      );
    }

    return days;
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="anim-fade-in card-pixel w-full max-w-[420px] max-h-[calc(100dvh-60px)] overflow-y-auto flex flex-col gap-4 !p-5">
        {/* Title */}
        <div className="flex justify-between items-center border-b border-quest-border pb-3">
          <h2 className="text-sm sm:text-xs text-quest-gold font-pixel uppercase tracking-widest">
            {existingPlan ? '✏️ Editar Plan' : '📋 Nuevo Plan'}
          </h2>
          <button onClick={onClose} className="btn-pixel-gray !py-3 !px-4 sm:!py-1 sm:!px-2 !text-sm sm:!text-xs">✕</button>
        </div>

        {/* Plan Name */}
        <div>
          <label className="text-sm sm:text-[9px] text-quest-textDim block mb-2 font-pixel">NOMBRE DEL PLAN</label>
          <input
            className="input-pixel text-xs sm:text-sm"
            value={planName}
            onChange={e => setPlanName(e.target.value)}
            placeholder="Ej: Mi día productivo..."
            maxLength={50}
          />
        </div>

        {/* Date Picker */}
        <div>
          <label className="text-sm sm:text-[9px] text-quest-textDim block mb-2 font-pixel">FECHA</label>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="input-pixel flex items-center justify-between gap-2"
          >
            <span>{new Date(planDate + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            <span>📅</span>
          </button>

          {showCalendar && (
            <div className="mt-2 p-3 bg-quest-panel border border-quest-border rounded">
              <div className="flex justify-between items-center mb-3">
                <button
                  onClick={() => { setCalendarMonth(m => m === 0 ? 11 : m - 1); if (calendarMonth === 0) setCalendarYear(y => y - 1); }}
                  className="btn-pixel-gray !py-1 !px-2 text-xs"
                >
                  ◀
                </button>
                <span className="text-xs font-pixel text-quest-cyan">{months[calendarMonth]} {calendarYear}</span>
                <button
                  onClick={() => { setCalendarMonth(m => m === 11 ? 0 : m + 1); if (calendarMonth === 11) setCalendarYear(y => y + 1); }}
                  className="btn-pixel-gray !py-1 !px-2 text-xs"
                >
                  ▶
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {dayNames.map(d => (
                  <div key={d} className="text-[8px] text-quest-textMuted uppercase">{d}</div>
                ))}
                {renderCalendar()}
              </div>
            </div>
          )}
        </div>

        {/* Tasks */}
        <div>
          <label className="text-sm sm:text-[9px] text-quest-textDim block mb-2 font-pixel">
            TAREAS — <span className="text-quest-gold">⏱️ {totalMinutes} min total</span>
          </label>

          <div className="grid grid-cols-[1fr_64px_36px] gap-2 px-1 mb-1">
            <span className="text-[10px] text-quest-textMuted font-pixel uppercase">Nombre</span>
            <span className="text-[10px] text-quest-textMuted font-pixel uppercase text-center">min</span>
            <span />
          </div>

          <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto">
            {tasks.map((task, index) => (
              <div key={task.id} className="grid grid-cols-[1fr_64px_36px] gap-2 items-center">
                <input
                  className="input-pixel flex-1 !py-2 text-xs"
                  value={task.name}
                  onChange={e => handleTaskChange(index, 'name', e.target.value)}
                  placeholder="Nombre tarea"
                  maxLength={40}
                />
                <input
                  className="input-pixel !py-2 text-center"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={3}
                  placeholder="30"
                  value={task.durationMinutes ?? ''}
                  onChange={e => {
                    const rawValue = e.target.value;
                    if (!/^\d*$/.test(rawValue)) return;
                    handleTaskChange(index, 'durationMinutes', rawValue === '' ? '' : parseInt(rawValue, 10));
                  }}
                />
                <button
                  onClick={() => handleRemoveTask(index)}
                  className="btn-pixel-red !py-2 !px-0 text-xs w-full"
                  disabled={tasks.length === 1}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddTask}
            className="mt-3 btn-pixel-gray w-full uppercase text-xs py-2"
          >
            + Añadir tarea
          </button>
        </div>

        {error && (
          <div className="text-quest-red text-xs font-pixel animate-pulse bg-quest-red/10 p-2 border border-quest-red">
            {error}
          </div>
        )}

        <div className="flex gap-3 mt-2">
          <button onClick={onClose} className="btn-pixel-gray flex-1 uppercase">Cancelar</button>
          <button onClick={handleSubmit} className="btn-pixel-green flex-[2] uppercase font-bold tracking-widest">
            {existingPlan ? '💾 Guardar' : '✚ Crear Plan'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
