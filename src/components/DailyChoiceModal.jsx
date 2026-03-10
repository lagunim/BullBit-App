import { createPortal } from 'react-dom';
import { useState } from 'react';
import { ITEMS } from '../data/items.js';
import { getProgressColor } from '../utils/gameLogic.js';

export default function DailyChoiceModal({ options, onSelect }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
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
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    if (selectedOption) {
      onSelect(selectedOption.id);
      setShowConfirmation(false);
      setSelectedOption(null);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
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
                hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] group`}
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

        {/* Hint */}
        <p className="text-center text-gray-500 text-[9px] font-pixel">
          Toca una misión para seleccionarla
        </p>

        {/* Confirmation Modal */}
        {showConfirmation && selectedOption && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10001] p-4">
            <div className="card-pixel w-full max-w-[380px] p-5 border-quest-gold shadow-[4px_4px_0_theme(colors.quest.goldDark)] flex flex-col gap-4">
              {/* Title */}
              <div className="text-center border-b border-quest-border pb-3">
                <h3 className="text-sm text-quest-gold font-pixel uppercase tracking-widest flex items-center justify-center gap-2">
                  <span className="text-yellow-400">⚠️</span> Confirmar Misión
                </h3>
              </div>

              {/* Mission Details */}
              <div className="flex items-center gap-3 p-3 bg-quest-bg/50 border border-quest-border">
                <span className="text-3xl">{selectedOption.icon}</span>
                <div>
                  <h4 className="font-bold text-white text-sm">{selectedOption.name}</h4>
                  <span className={`text-[8px] font-semibold px-2 py-0.5 rounded-full border ${getDifficultyColor(selectedOption.difficulty)}`}>
                    {selectedOption.difficulty.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-quest-bg/30 p-3 border border-quest-border">
                <p className="text-gray-300 text-xs leading-relaxed">
                  {selectedOption.description}
                </p>
              </div>

              {/* Objective */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Objetivo</span>
                <span className="text-white font-bold">
                  {selectedOption.progress?.current || 0} / {selectedOption.progress?.target || 0}
                </span>
              </div>

              {/* Progress Bar */}
              {selectedOption.progress && (
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${Math.min(100, Math.round(((selectedOption.progress?.current || 0) / (selectedOption.progress?.target || 1)) * 100))}%`,
                      color: getProgressColor(Math.min(100, Math.round(((selectedOption.progress?.current || 0) / (selectedOption.progress?.target || 1)) * 100))),
                    }}
                  />
                </div>
              )}

              {/* Rewards */}
              <div className="flex items-center justify-around gap-3 pt-3 border-t border-quest-border">
                <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-2 border border-yellow-500/30">
                  <span className="text-yellow-400 font-bold text-xs">+{selectedOption.rewards?.points || 0}</span>
                  <span className="text-yellow-400/70 text-[10px]">pts</span>
                </div>
                {selectedOption.rewards?.items && selectedOption.rewards.items.length > 0 && (
                  <div className="flex items-center gap-2 bg-purple-500/20 px-3 py-2 border border-purple-500/30">
                    <span className="text-purple-400 text-xs">+</span>
                    <span className="text-purple-400 text-xs">
                      {selectedOption.rewards.items.map(itemId => ITEMS[itemId]?.name || 'Item').join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCancel}
                  className="flex-1 btn-pixel-gray uppercase font-bold tracking-widest text-xs py-3"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 btn-pixel-gold uppercase font-bold tracking-widest text-xs py-3 flex items-center justify-center gap-2"
                >
                  <span>Confirmar</span>
                  <span>✓</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
