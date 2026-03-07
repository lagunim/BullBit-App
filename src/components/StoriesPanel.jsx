/**
 * StoriesPanel - Panel de historias desbloqueadas
 * 
 * Muestra todas las historias que el jugador ha desbloqueado,
 * organizadas por tipo (viajes o logros). Al seleccionar una,
 * se abre el modal de lectura de historia.
 * 
 * Las historias se desbloquean al completar viajes (niveles)
 * o al obtener ciertos logros especiales.
 * 
 * @component
 * @param {Object} props
 * @param {Function} props.onClose - Función para cerrar el panel
 * @returns {JSX.Element} Panel lateral con lista de historias
 */
import { useState, useEffect } from 'react';
import useGameStore from '../store/gameStore.js';
import { getStoryById } from '../data/stories.js';
import StoryScrollModal from './StoryScrollModal.jsx';

export default function StoriesPanel({ onClose }) {
  const unlockedStories = useGameStore(s => s.unlockedStories ?? []);
  const level = useGameStore(s => s.level ?? 0);
  const [selectedStory, setSelectedStory] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 200);
  }

  // Sort by journey number
  const sorted = [...unlockedStories].sort((a, b) => a.journeyId - b.journeyId);

  // Separate stories by type
  const journeyStories = sorted.filter(s => s.journeyId > 0);
  const achievementStories = sorted.filter(s => s.journeyId <= 0);

  const getStoryLabel = (entry) => {
    return entry.journeyId > 0 ? `VIAJE ${entry.journeyId}` : 'LOGRO';
  };

  const getStoryIcon = (entry) => {
    return entry.journeyId > 0 ? entry.journeyId : '🏆';
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[500] backdrop-blur-sm transition-opacity duration-200"
        style={{
          background: 'rgba(0,0,0,0.50)',
          opacity: visible ? 1 : 0,
        }}
        onClick={handleClose}
      />

      {/* Panel */}
      <div className="fixed inset-0 z-[501] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <div
          className="relative w-full max-w-md max-h-[85vh] flex flex-col pointer-events-auto transition-all duration-200"
          style={{
            border: '3px solid #a07830',
            background: 'linear-gradient(180deg, #1a1005 0%, #0d0a04 100%)',
            boxShadow: '0 0 0 2px #0d0a04, 4px 4px 0 #3a2800, 0 0 24px rgba(255,180,0,0.12)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'scale(1)' : 'scale(0.95)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b-2"
            style={{ borderColor: '#a07830', background: 'linear-gradient(90deg, rgba(80,50,0,0.8), rgba(40,25,0,0.6))' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">📜</span>
              <span className="font-pixel text-[10px] text-quest-gold tracking-wider">HISTORIAS DEL VIAJERO</span>
            </div>
            <button
              onClick={handleClose}
              className="btn-pixel-red !text-[10px] !py-1 !px-2 !min-h-0"
            >
              ✕
            </button>
          </div>

          {/* Journey progress hint */}
          <div className="px-4 py-2 border-b border-quest-border">
            <div className="text-xs text-quest-textDim font-pixel">
              VIAJE ACTUAL: <span className="text-quest-gold">{level}</span>
              <span className="ml-3">HISTORIAS: <span className="text-quest-purple">{sorted.length}</span></span>
            </div>
          </div>

          {/* Stories list */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {sorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <span className="text-4xl opacity-40">📜</span>
                <p className="font-pixel text-xs text-quest-textDim text-center leading-relaxed">
                  Completa tu primer viaje<br />para desbloquear una historia.
                </p>
              </div>
            ) : (
              sorted.map(entry => {
                const story = getStoryById(entry.storyId);
                if (!story) return null;
                return (
                  <button
                    key={entry.journeyId}
                    type="button"
                    onClick={() => setSelectedStory(story)}
                    className="w-full text-left group"
                  >
                    <div
                      className="flex items-center gap-3 p-3 border-2 transition-all duration-150 group-hover:border-quest-gold"
                      style={{
                        borderColor: '#5a3b00',
                        background: 'linear-gradient(90deg, rgba(40,25,0,0.9), rgba(20,12,0,0.8))',
                      }}
                    >
                      <div
                        className="shrink-0 w-8 h-8 flex items-center justify-center border-2 font-pixel text-xs"
                        style={{ borderColor: '#a07830', background: 'rgba(80,50,0,0.5)', color: '#ffd36a' }}
                      >
                        {entry.journeyId}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-pixel text-xs text-quest-gold truncate group-hover:text-white transition-colors">
                          {story.title}
                        </div>
                        <div className="font-pixel text-[7px] text-quest-textDim mt-0.5">
                          VIAJE {entry.journeyId} · {new Date(entry.unlockedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div className="text-quest-textDim group-hover:text-quest-gold transition-colors text-xs">▶</div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Decorative bottom */}
          <div
            className="px-4 py-2 border-t-2 flex justify-center"
            style={{ borderColor: '#5a3b00' }}
          >
            <div className="font-pixel text-[10px] text-quest-textMuted">
              — Crónicas del Viajero Eterno —
            </div>
          </div>
        </div>
      </div>

      {/* Story reader modal */}
      {selectedStory && (
        <StoryScrollModal
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      )}
    </>
  );
}
