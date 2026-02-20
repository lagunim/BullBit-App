export default function Toast({ msg, type = 'info' }) {
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
      <p className="font-pixel text-[9px] leading-relaxed">{msg}</p>
    </div>
  );
}
