import { useEffect, useState } from 'react';
import useGameStore from '../../store/gameStore.js';
import { getStoryById } from '../../data/stories.js';
import { ACHIEVEMENTS } from '../../data/achievements.js';
import { ITEMS } from '../../data/items.js';
import StoryScrollModal from '../journey/StoryScrollModal.jsx';
import ItemDetailModal from '../inventory/ItemDetailModal.jsx';
import { createPortal } from 'react-dom';

export default function NotificationsModal({ onClose, onNavigateTab }) {
  const savedNotifications = useGameStore(s => s.savedNotifications || []);
  const removeSavedNotification = useGameStore(s => s.removeSavedNotification);
  const clearSavedNotifications = useGameStore(s => s.clearSavedNotifications);
  
  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleAction = (notif) => {
    if (notif.type === 'story' && notif.refId) {
      const story = getStoryById(notif.refId);
      if (story) setSelectedStory(story);
    } else if (notif.type === 'item') {
      // If it has refId, show item detail, otherwise go to inventory
      if (notif.refId && ITEMS[notif.refId]) {
        setSelectedItem(ITEMS[notif.refId]);
      } else {
        onNavigateTab('items');
        onClose();
      }
    } else if (notif.type === 'achievement') {
      if (notif.refId) {
        const ach = ACHIEVEMENTS.find(a => a.id === notif.refId);
        if (ach) setSelectedAchievement(ach);
        else {
          onNavigateTab('achieve');
          onClose();
        }
      } else {
        onNavigateTab('achieve');
        onClose();
      }
    } else if (notif.type === 'journey') {
      onNavigateTab('achieve');
      onClose();
    } else {
      onClose();
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'achievement': return '🏆';
      case 'story': return '📜';
      case 'item': return '💎';
      case 'level': return '⭐';
      case 'journey': return '🗺️';
      default: return '🔔';
    }
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4 anim-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-quest-bg border-2 border-quest-border flex flex-col relative h-[80vh] anim-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-quest-border bg-quest-panel">
          <h2 className="font-pixel text-quest-gold text-sm sm:text-base">🔔 NOTIFICACIONES</h2>
          <button
            onClick={onClose}
            className="text-quest-text hover:text-quest-gold transition-colors text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {savedNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-quest-textMuted opacity-50">
              <span className="text-4xl mb-4">📭</span>
              <p className="font-pixel text-[10px]">NO HAY NOTIFICACIONES</p>
            </div>
          ) : (
            savedNotifications.map(notif => (
              <div key={notif.id} className="card-pixel p-3 flex flex-col sm:flex-row gap-3 border-quest-borderLight hover:border-quest-gold transition-colors bg-quest-panel">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-2xl shrink-0">{getIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <div className="font-pixel text-[8px] text-quest-textDim uppercase">
                        {notif.type}
                      </div>
                      <div className="font-pixel text-[7px] text-quest-textMuted whitespace-nowrap">
                        {formatDate(notif.timestamp)}
                      </div>
                    </div>
                    <div className="font-pixel text-[10px] text-quest-text leading-relaxed">
                      {notif.msg}
                    </div>
                  </div>
                </div>
                <div className="flex sm:flex-col gap-2 shrink-0 justify-end sm:justify-center mt-2 sm:mt-0">
                  <button
                    onClick={() => handleAction(notif)}
                    className="btn-pixel-cyan py-1.5 px-3 text-[8px] flex-1 sm:flex-none"
                  >
                    VER
                  </button>
                  <button
                    onClick={() => removeSavedNotification(notif.id)}
                    className="btn-pixel-red py-1.5 px-3 text-[8px] sm:flex-none"
                    title="Eliminar notificación"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {savedNotifications.length > 0 && (
          <div className="p-4 border-t-2 border-quest-border bg-quest-panel">
            <button
              onClick={clearSavedNotifications}
              className="btn-pixel-red w-full py-2 text-[10px]"
            >
              🗑️ BORRAR TODAS
            </button>
          </div>
        )}

        {/* Sub-modals */}
        {selectedStory && (
          <StoryScrollModal
            story={selectedStory}
            onClose={() => setSelectedStory(null)}
          />
        )}

        {selectedItem && (
          <ItemDetailModal
            item={selectedItem}
            qty={0}
            onClose={() => setSelectedItem(null)}
            onUse={() => {
              setSelectedItem(null);
              onNavigateTab('items');
              onClose();
            }}
            actionText="IR AL INVENTARIO"
          />
        )}

        {selectedAchievement && createPortal(
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[11000] flex items-center justify-center p-4 anim-fade-in" onClick={() => setSelectedAchievement(null)}>
            <div className="bg-quest-card border-2 border-quest-gold shadow-[0_0_50px_rgba(255,215,0,0.15)] max-w-sm w-full p-6 text-center" onClick={e => e.stopPropagation()}>
              <div className="text-4xl mb-3">{selectedAchievement.icon}</div>
              <h2 className="text-lg font-pixel text-quest-gold mb-2">{selectedAchievement.name}</h2>
              <p className="text-xs font-pixel text-quest-textDim uppercase mb-6 leading-relaxed">{selectedAchievement.desc}</p>
              <button onClick={() => { setSelectedAchievement(null); onNavigateTab('achieve'); onClose(); }} className="btn-pixel-cyan w-full text-[10px] py-2 mb-2">IR A LOGROS</button>
              <button onClick={() => setSelectedAchievement(null)} className="btn-pixel-gray w-full text-[10px] py-2">CERRAR</button>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}
