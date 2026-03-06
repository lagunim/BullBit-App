import { useState, useEffect, useRef } from 'react';
import Header from './Header.jsx';
import LevelProgress from './LevelProgress.jsx';
import HabitList from './HabitList.jsx';
import HabitHistory from './HabitHistory.jsx';
import AchievementsPanel from './AchievementsPanel.jsx';
import InventoryPanel from './InventoryPanel.jsx';
import DailyChallenge from './DailyChallenge.jsx';
import Notifications from './Notifications.jsx';
import Auth from './Auth.jsx';
import StoriesPanel from './StoriesPanel.jsx';
import JourneyRewardFlow from './JourneyRewardFlow.jsx';
import { supabase } from '../lib/supabase.js';
import useGameStore from '../store/gameStore.js';

const TABS = [
  { id: 'home', label: 'INICIO', icon: '🏠' },
  { id: 'history', label: 'HISTORIAL', icon: '📅' },
  { id: 'items', label: 'ITEMS', icon: '🎒' },
  { id: 'achieve', label: 'LOGROS', icon: '🏆' },
];

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('home');
  const [storiesPanelOpen, setStoriesPanelOpen] = useState(false);
  const { init } = useGameStore();
  const [bounceOffset, setBounceOffset] = useState(0);
  const [isMobileView, setIsMobileView] = useState(false);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const bounceTimer = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const matcher = window.matchMedia('(max-width: 768px)');
    const handler = (ev) => setIsMobileView(ev.matches);
    setIsMobileView(matcher.matches);
    matcher.addEventListener('change', handler);
    return () => matcher.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const timeout = setTimeout(() => setLoading(false), 5000);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        clearTimeout(timeout);
        setSession(session);
      } catch (err) {
        clearTimeout(timeout);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => setSession(session));

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session) {
      init(session.user.id);
    }
  }, [session, init]);

  useEffect(() => {
    return () => {
      if (bounceTimer.current) {
        clearTimeout(bounceTimer.current);
      }
    };
  }, []);

  const currentIndex = Math.max(0, TABS.findIndex(t => t.id === tab));

  const applyBounce = (direction) => {
    if (bounceTimer.current) clearTimeout(bounceTimer.current);
    setBounceOffset(direction * 14);
    bounceTimer.current = setTimeout(() => {
      setBounceOffset(0);
      bounceTimer.current = null;
    }, 220);
  };

  const handleTouchStart = (event) => {
    const touch = event.touches?.[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event) => {
    const touch = event.changedTouches?.[0];
    if (!touch) return;
    const { x: startX, y: startY } = touchStartRef.current;
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    if (Math.abs(dx) < Math.abs(dy) || Math.abs(dx) < 60) {
      if (Math.abs(dx) > 10) {
        applyBounce(dx < 0 ? -1 : 1);
      }
      return;
    }

    const direction = dx < 0 ? 1 : -1;
    const targetIndex = Math.max(0, Math.min(TABS.length - 1, currentIndex + direction));
    if (targetIndex === currentIndex) {
      applyBounce(direction * -1);
      return;
    }
    if (bounceTimer.current) {
      clearTimeout(bounceTimer.current);
      bounceTimer.current = null;
    }
    setBounceOffset(0);
    setTab(TABS[targetIndex].id);
  };

  const handleTabChange = (newTab) => {
    if (bounceTimer.current) {
      clearTimeout(bounceTimer.current);
      bounceTimer.current = null;
    }
    setBounceOffset(0);
    setTab(newTab);
  };

  const isEnvMissing = !import.meta.env.PUBLIC_SUPABASE_URL || !import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (isEnvMissing) {
    return (
      <div className="min-h-screen bg-quest-bg flex flex-col items-center justify-center font-pixel text-quest-red p-10 text-center gap-6">
        <div className="text-4xl animate-bounce">⚠️</div>
        <div className="text-xl border-2 border-quest-red p-6 bg-quest-red/10 shadow-[0_0_20px_rgba(255,0,0,0.3)]">
          ERROR DE CONFIGURACIÓN
        </div>
        <div className="text-[10px] leading-relaxed max-w-md">
          Las variables de entorno de <span className="text-quest-gold">Supabase</span> no están llegando a la aplicación.
          <br /><br />
          <span className="text-white bg-quest-red px-2 py-1">SOLUCIÓN:</span>
          <br />
          Detén el servidor pulsando <kbd className="bg-zinc-800 px-1 rounded">Ctrl+C</kbd> y vuelve a ejecutar:
          <br />
          <code className="text-quest-cyan block mt-2 p-2 bg-black/50 border border-quest-border">npm run dev</code>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-quest-bg flex flex-col items-center justify-center font-pixel text-quest-gold gap-4">
        <div className="text-[10px] animate-pulse">CARGANDO AVENTURA...</div>
        <div className="w-16 progress-bar h-1">
          <div className="progress-bar-fill w-full bg-quest-gold animate-[loading_1s_infinite_linear]" />
        </div>
        <style>{`
          @keyframes loading {
            from { transform: translateX(-100%); }
            to { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  const touchHandlers = isMobileView
    ? { onTouchStart: handleTouchStart, onTouchEnd: handleTouchEnd }
    : {};

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-quest-bg antialiased">
      <Header />

      <div className="flex-1 overflow-hidden relative">
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(calc(-${currentIndex * 100}% + ${bounceOffset}px))` }}
          {...touchHandlers}
        >
          <section className="w-full flex-shrink-0">
            <div className="h-full overflow-y-auto">
              <main className="max-w-[900px] w-full mx-auto p-3 sm:px-4">
                <div className="anim-fade-in">
                  <LevelProgress onOpenStories={() => setStoriesPanelOpen(true)} />
                  <DailyChallenge />
                  <HabitList />
                </div>
              </main>
            </div>
          </section>

          <section className="w-full flex-shrink-0">
            <div className="h-full overflow-y-auto">
              <main className="max-w-[900px] w-full mx-auto p-3 sm:px-4">
                <div className="anim-fade-in">
                  <HabitHistory />
                </div>
              </main>
            </div>
          </section>

          <section className="w-full flex-shrink-0">
            <div className="h-full overflow-y-auto">
              <main className="max-w-[900px] w-full mx-auto p-3 sm:px-4">
                <div className="anim-fade-in">
                  <InventoryPanel />
                </div>
              </main>
            </div>
          </section>

          <section className="w-full flex-shrink-0">
            <div className="h-full overflow-y-auto">
              <main className="max-w-[900px] w-full mx-auto p-3 sm:px-4">
                <div className="anim-fade-in">
                  <AchievementsPanel />
                </div>
              </main>
            </div>
          </section>
        </div>
      </div>

      <nav className="flex justify-around bg-quest-panel border-t-2 border-quest-border pb-[env(safe-area-inset-bottom)] shrink-0 z-[1000] shadow-[0_-4px_10px_rgba(0,0,0,0.5)]">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-opacity duration-200 cursor-pointer border-none bg-transparent ${tab === t.id ? 'opacity-100' : 'opacity-40 hover:opacity-70'
              }`}
          >
            <span className="text-xl sm:text-lg">{t.icon}</span>
            <span className={`text-xs font-pixel sm:text-[7px] ${tab === t.id ? 'text-quest-green' : 'text-quest-text'
              }`}>
              {t.label}
            </span>
            {tab === t.id && (
              <div className="w-3 h-0.5 bg-quest-green mt-0.5 shadow-[0_0_5px_theme(colors.quest.green)]" />
            )}
          </button>
        ))}
      </nav>

      <Notifications />

      {/* Global journey reward flow — mounts story scroll then item choice */}
      <JourneyRewardFlow />

      {/* Stories panel — opened by clicking the LevelProgress card */}
      {storiesPanelOpen && (
        <StoriesPanel onClose={() => setStoriesPanelOpen(false)} />
      )}
    </div>
  );
}
