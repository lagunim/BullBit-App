import { useState, useEffect } from 'react';
import { useSwipeNavigation } from '../hooks/useSwipeNavigation.js';
import Header from './Header.jsx';
import LevelProgress from './LevelProgress.jsx';
import HabitList from './HabitList.jsx';
import HabitHistory from './HabitHistory.jsx';
import AchievementsPanel from './AchievementsPanel.jsx';
import InventoryPanel from './InventoryPanel.jsx';
import Notifications from './Notifications.jsx';
import Auth from './Auth.jsx';
import { supabase } from '../lib/supabase.js';
import useGameStore from '../store/gameStore.js';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('home');

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      // Failsafe timeout
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 5000);

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

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // CHECK FOR MISSING ENV VARS
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

  // AUTH GATE
  if (!session) {
    return <Auth />;
  }

  const tabs = [
    { id: 'home',      label: 'INICIO',    icon: '🏠' },
    { id: 'history',   label: 'HISTORIAL', icon: '📅' },
    { id: 'items',     label: 'ITEMS',     icon: '🎒' },
    { id: 'achieve',   label: 'LOGROS',    icon: '🏆' },
  ];

  const swipeHandlers = useSwipeNavigation(tabs, tab, setTab);

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-quest-bg antialiased">
      <Header />

      <div
        className="flex-1 overflow-y-auto touch-pan-y"
        onTouchStart={swipeHandlers.onTouchStart}
        onTouchEnd={swipeHandlers.onTouchEnd}
      >
        <main className="max-w-[900px] w-full mx-auto p-3 sm:px-4">
          {tab === 'home' && (
            <div className="anim-fade-in">
              <LevelProgress />
              <HabitList />
            </div>
          )}
          {tab === 'history' && (
            <div className="anim-fade-in">
              <HabitHistory />
            </div>
          )}
          {tab === 'items' && (
            <div className="anim-fade-in">
              <InventoryPanel />
            </div>
          )}
          {tab === 'achieve' && (
            <div className="anim-fade-in">
              <AchievementsPanel />
            </div>
          )}
        </main>
      </div>

      {/* Bottom Navigation Menu */}
      <nav className="flex justify-around bg-quest-panel border-t-2 border-quest-border pb-[env(safe-area-inset-bottom)] shrink-0 z-[1000] shadow-[0_-4px_10px_rgba(0,0,0,0.5)]">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-opacity duration-200 cursor-pointer border-none bg-transparent ${
              tab === t.id ? 'opacity-100' : 'opacity-40 hover:opacity-70'
            }`}
          >
            <span className="text-base sm:text-lg">{t.icon}</span>
            <span className={`text-[6px] font-pixel sm:text-[7px] ${
              tab === t.id ? 'text-quest-green' : 'text-quest-text'
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
    </div>
  );
}
