import { useEffect } from 'react';
import ItemCard from './ItemCard.jsx';

export default function ItemDetailModal({ item, qty, onClose, onUse, actionText }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[11000] p-4 anim-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-[320px] relative anim-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center bg-quest-bg border-2 border-quest-border text-quest-text hover:text-quest-gold hover:border-quest-gold transition-colors z-10"
        >
          ✕
        </button>

        {/* Indicador de cantidad/límite en esquina superior izquierda */}
        {qty > 0 && (
          <div className={`absolute -top-3 -left-3 px-2 py-1 font-pixel text-[9px] border-2 rounded bg-quest-bg z-10 ${
            qty >= (item.maxStack ?? 99) * 0.8
              ? 'border-quest-gold text-quest-gold'
              : 'border-quest-cyan text-quest-cyan'
          }`}>
            x{qty}/{(item.maxStack ?? 99)}
          </div>
        )}

        <ItemCard
          item={item}
          qty={qty}
          maxStack={item.maxStack ?? 99}
          onUse={(id) => {
            onUse(id);
          }}
          actionText={actionText}
        />
      </div>
    </div>
  );
}
