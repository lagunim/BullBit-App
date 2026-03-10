import { createPortal } from 'react-dom';
import { useState } from 'react';

export default function DailyChoiceModal({ options, onSelect }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'easy': return 'border-green-500/50 bg-green-500/10 text-green-400';
      case 'medium': return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400';
      case 'hard': return 'border-red-500/50 bg-red-500/10 text-red-400';
      default: return 'border-gray-500/50 bg-gray-500/10 text-gray-400';
    }
  };

  const getDifficultyBg = (diff) => {
    switch (diff) {
      case 'easy': return 'from-green-600/20 to-green-700/10';
      case 'medium': return 'from-yellow-600/20 to-yellow-700/10';
      case 'hard': return 'from-red-600/20 to-red-700/10';
      default: return 'from-gray-600/20 to-gray-700/10';
    }
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  const handleConfirm = () => {
    if (selectedOption && !confirming) {
      setConfirming(true);
      setTimeout(() => {
        onSelect(selectedOption.id);
        setConfirming(false);
        setSelectedOption(null);
      }, 260);
    }
  };

  const handleCancel = () => {
    setSelectedOption(null);
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[10000] p-4 backdrop-blur-sm">
      <div className="card-pixel w-full max-w-[480px] max-h-[calc(100dvh-60px)] overflow-y-auto flex flex-col gap-5 !p-6 border-quest-gold shadow-[4px_4px_0_theme(colors.quest.goldDark)]">
        {/* Title */}
        <div className="text-center border-b border-quest-border pb-4">
          <h2 className="text-sm sm:text-xs text-quest-gold font-pixel uppercase tracking-widest flex items-center justify-center gap-2 mb-2">
            <span className="animate-pulse">🎯</span> Elige tu Misión
          </h2>
          <p className="text-gray-400 text-[10px] sm:text-xs">
            Selecciona una misión diaria para hoy. ¡Elige la que mejor se adapte a tu rutina!
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-4">
          {options.map((option, index) => (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option)}
              className={`text-left p-4 border-2 bg-gradient-to-r ${getDifficultyBg(option.difficulty)}} 
                hover:scale-[1.02] transition-all duration-200 cursor-pointer card-pixel
                hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] group
                ${selectedOption?.id === option.id ? 'border-quest-gold shadow-[0_0_20px_rgba(255,215,0,0.3)]' : 'border-quest-border'}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{option.icon}</span>
                  <div>
                    <h3 className="font-bold text-white text-sm font-pixel">{option.name}</h3>
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${getDifficultyColor(option.difficulty)}`}>
                      {option.difficulty.toUpperCase()}
                    </span>
                  </div>
                </div>
                <span className="text-quest-gold text-lg group-hover:animate-bounce">→</span>
              </div>

              {/* Description */}
              <p className="text-gray-300 text-[10px] sm:text-xs mb-3 leading-relaxed">
                {option.description}
              </p>

              {/* Rewards */}
              <div className="flex items-center gap-3 pt-2 border-t border-quest-border/50">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400 font-bold text-xs">+{option.rewards?.points || 0}</span>
                  <span className="text-yellow-400/70 text-[10px]">pts</span>
                </div>
                {option.rewards?.items && option.rewards.items.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-purple-400 text-[10px]">+</span>
                    <span className="text-purple-400 text-xs">1 item</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Accept Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={handleConfirm}
            disabled={!selectedOption}
            className={`btn-pixel text-[10px] px-6 py-2 w-full ${selectedOption ? 'bg-quest-gold text-black' : 'opacity-40 cursor-not-allowed'}`}
          >
            {confirming ? 'ACEPTANDO...' : 'ACEPTAR MISIÓN'}
          </button>
        </div>

        <p className="text-center text-gray-500 text-[9px] font-pixel">
          Toca una misión para seleccionarla
        </p>
      </div>
    </div>,
    document.body
  );
}
