/**
 * Toast - Componente simple de notificación temporal
 * 
 * Muestra mensajes breves de retroalimentación al usuario.
 * Tipos disponibles:
 * - points: Puntos ganados (verde)
 * - penalty: Penalización (rojo)
 * - achievement: Logro desbloqueado (dorado)
 * - item: Objeto obtenido (púrpura)
 * - levelup: Subida de nivel (dorado)
 * - info: Información general (azul)
 * 
 * @component
 * @param {Object} props
 * @param {string} props.msg - Mensaje a mostrar
 * @param {string} props.type - Tipo de toast (default: 'info')
 * @returns {JSX.Element} Toast renderizado
 */
export default function Toast({ msg, type = 'info' }) {
  // Mapeo de tipos a estilos CSS
  const styles = {
    points: 'border-quest-green glow-text-green',
    penalty: 'border-quest-red glow-text-red',
    achievement: 'border-quest-gold glow-text-gold',
    item: 'border-quest-purple glow-text-purple',
    success: 'border-quest-green text-quest-green',
    levelup: 'border-quest-gold glow-text-gold',
    info: 'border-quest-blue text-quest-blue',
  }[type] || 'border-quest-blue text-quest-blue';
  
  return (
    <div className={`toast-enter pixel-border bg-quest-panel border px-4 py-3 max-w-xs ${styles}`}>
      <p className="font-pixel text-[10px] leading-relaxed">{msg}</p>
    </div>
  );
}
