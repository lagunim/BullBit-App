import useGameStore from '../store/gameStore.js';

export default function DailyChallenge() {
  const { currentDaily } = useGameStore();

  if (!currentDaily) return null;

  const { name, description, icon, progress, completed, difficulty, rewards } = currentDaily;
  const progressPercentage = Math.min(100, Math.round((progress.current / progress.target) * 100));

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getDifficultyBg = (diff) => {
    switch (diff) {
      case 'easy': return 'from-green-500/20 to-green-600/20 border-green-500/30';
      case 'medium': return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
      case 'hard': return 'from-red-500/20 to-red-600/20 border-red-500/30';
      default: return 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
    }
  };

  return (
    <div className={`mb-6 p-3 sm:p-4 rounded-lg border bg-gradient-to-r ${getDifficultyBg(difficulty)} backdrop-blur-sm card-pixel`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl">{icon}</span>
          <div className="min-w-0">
            <h3 className="font-bold text-white text-[10px] sm:text-[12px] font-pixel truncate uppercase tracking-tight">{name}</h3>
            <div className="mt-0.5">
              <span className={`text-[8px] sm:text-[10px] font-pixel font-semibold px-1.5 py-0.5 rounded border ${getDifficultyColor(difficulty)} ${getDifficultyBg(difficulty)}`}>
                {difficulty.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        {completed && (
          <div className="flex items-center gap-1 text-quest-green">
            <span className="text-sm sm:text-base">✓</span>
            <span className="text-[8px] sm:text-[10px] font-pixel font-medium">COMPLETADO</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-400 text-[8px] sm:text-[10px] font-pixel mb-2 sm:mb-3 hidden sm:block">{description}</p>

      {/* Progress Bar */}
      <div className="mb-2 sm:mb-3">
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <span className="text-[8px] sm:text-[10px] font-pixel text-gray-500">PROGRESO</span>
          <span className="text-[8px] sm:text-[10px] font-pixel text-white font-bold">
            <span className="sm:hidden">{progressPercentage}%</span>
            <span className="hidden sm:inline">{progress.current} / {progress.target}</span>
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 sm:h-3 relative overflow-hidden">
          <div 
            className={`h-2 sm:h-3 rounded-full transition-all duration-500 ease-out ${
              completed 
                ? 'bg-gradient-to-r from-green-400 to-green-600' 
                : 'bg-gradient-to-r from-blue-500 to-purple-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
          {progressPercentage > 0 && progressPercentage < 100 && (
            <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          )}
        </div>
        <div className="text-center mt-1 hidden sm:block">
          <span className={`text-[8px] sm:text-[10px] font-pixel font-medium ${
            progressPercentage === 100 ? 'text-quest-green' : 'text-blue-400'
          }`}>
            {progressPercentage}%
          </span>
        </div>
      </div>

      {/* Rewards */}
      <div className="flex items-center justify-between">
        <div className="text-gray-500 text-[8px] sm:text-[10px] font-pixel">
          RECOMPENSA:
          <span className="text-yellow-400 font-medium ml-1">+{rewards.points} pts</span>
          {rewards.items && rewards.items.length > 0 && (
            <span className="text-purple-400 ml-2 hidden sm:inline">
              + {rewards.items.length} item{rewards.items.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {completed && (
          <div className="text-quest-green text-[8px] sm:text-[10px] font-pixel font-medium hidden sm:block">
            ¡OBTENIDA! 🎉
          </div>
        )}
      </div>
    </div>
  );
}
