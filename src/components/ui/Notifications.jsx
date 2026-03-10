/**
 * Notifications - Componente de notificaciones emergentes
 * 
 * Muestra notificaciones en tiempo real sobre eventos del juego:
 * - Completar hábitos (complete)
 * - Fallar hábitos (fail)
 * - Desbloquear logros (achievement)
 * - Subir de nivel (level)
 * - Obtener objetos (item)
 * - Completar diarias (daily)
 * 
 * Las notificaciones aparecen en la parte inferior derecha
 * y se pueden descartar haciendo click en ellas.
 * 
 * @component
 * @returns {JSX.Element} Contenedor de notificaciones flotantes
 */
import useGameStore from '../../store/gameStore.js';

/**
 * Definición de estilos para cada tipo de notificación
 * Cada tipo tiene un color de borde, color de texto e icono distintivo
 */
const TYPE_STYLES = {
  // Hábito completado exitosamente
  complete:    { border: 'border-quest-green', text: 'text-quest-green', icon: '✔' },
  // Hábito fallado
  fail:        { border: 'border-quest-red', text: 'text-quest-red', icon: '✖' },
  // Fallo automático (por no completar a tiempo)
  auto_fail:   { border: 'border-orange-500', text: 'text-orange-500', icon: '⚠️' },
  // Logro desbloqueado
  achievement: { border: 'border-quest-gold', text: 'text-quest-gold', icon: '★' },
  // Subida de nivel
  level:       { border: 'border-quest-purple', text: 'text-quest-purple', icon: '▲' },
  // Objeto obtenido o usado
  item:        { border: 'border-quest-cyan', text: 'text-quest-cyan', icon: '◆' },
  // Misión diaria completada
  daily:       { border: 'border-quest-gold', text: 'text-quest-gold', icon: '🏆' },
};

export default function Notifications() {
  const notifications = useGameStore(s => s.notifications ?? []);
  const dismiss = useGameStore(s => s.dismissNotification);

  return (
    <div className="fixed bottom-24 right-4 sm:right-6 lg:right-8 z-[3000] flex flex-col gap-3 pointer-events-none">
      {notifications.map(n => {
        const style = TYPE_STYLES[n.type] ?? TYPE_STYLES.complete;
        return (
          <div
            key={n.id}
            onClick={() => dismiss(n.id)}
            className={`anim-slide-in card-pixel transition-all cursor-pointer pointer-events-auto flex items-center gap-3 !p-3 min-w-[200px] max-w-[280px] sm:max-w-xs ${style.border} shadow-[0_0_15px_rgba(0,0,0,0.4)]`}
          >
            <div className={`text-base font-bold shrink-0 ${style.text}`}>{style.icon}</div>
            <div className="text-[7px] text-quest-text font-pixel leading-normal uppercase tracking-tighter">
              {n.msg}
            </div>
            <div className="ml-auto opacity-20 text-[6px] font-pixel">✕</div>
          </div>
        );
      })}
    </div>
  );
}
