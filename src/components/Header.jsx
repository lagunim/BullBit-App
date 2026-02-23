import useGameStore from "../store/gameStore.js";
import { supabase } from "../lib/supabase.js";

export default function Header() {
  const level = useGameStore((s) => s.level ?? 0);
  const points = useGameStore((s) => s.points ?? 0);
  const rawEffects = useGameStore((s) => s.activeEffects ?? []);

  const now = new Date();
  const activeEffects = rawEffects.filter(
    (e) => !e.expiresAt || new Date(e.expiresAt) > now,
  );

  return (
    <header className="sticky top-0 z-[100] bg-quest-bg border-b-2 border-quest-border">
      {/* Title bar */}
      <div className="flex items-center justify-between gap-2 p-2 px-3 sm:px-4">
        <div className="flex items-center gap-2">
          <div className="text-base sm:text-lg shrink-0">⚔️</div>
          <div className="text-[10px] sm:text-xs text-quest-green font-pixel tracking-widest drop-shadow-[0_0_8px_theme(colors.quest.green)] uppercase">
            Habit<span className="text-quest-gold">Quest</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active effects (compact) */}
          <div className="hidden sm:flex gap-2">
            {activeEffects.map((eff, i) => (
              <div key={i} className="tooltip-wrap relative">
                <div className="flex items-center gap-1 bg-quest-panel border border-quest-cyan px-1.5 py-0.5 text-[6px] text-quest-cyan">
                  <span className="animate-blink">◆</span>
                  <span>{eff.itemName}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Level badge */}
          <div className="flex items-center gap-1.5 bg-quest-panel border border-quest-gold px-2 py-0.5 sm:px-3 sm:py-1">
            <span className="text-[6px] text-quest-textDim">LV</span>
            <span className="text-[10px] sm:text-xs text-quest-gold font-pixel">
              {level}
            </span>
          </div>

          {/* Points */}
          <div className="flex items-center gap-1.5 bg-quest-panel border border-quest-green px-2 py-0.5 sm:px-3 sm:py-1">
            <span className="text-[6px] text-quest-textDim">PTS</span>
            <span className="text-[10px] sm:text-xs text-quest-green font-pixel">
              {points.toLocaleString()}
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => supabase.auth.signOut()}
            className="btn-pixel-red p-3 sm:p-1.5"
            title="Sal a menú principal"
          >
            <span className="text-xs">🚪</span>
          </button>
        </div>
      </div>
    </header>
  );
}
