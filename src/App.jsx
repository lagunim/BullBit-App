/**
 * ============================================
 * COMPONENTE PRINCIPAL - APP.JSX
 * ============================================
 * Este es el componente raíz de toda la aplicación.
 * Gestiona:
 * - Autenticación de usuarios
 * - Navegación entre pestañas
 * - Carga inicial de datos
 * - Diseño responsivo (móvil vs escritorio)
 * - Sistema de notificaciones globales
 * - Flujos de recompensas (journey/daily)
 * 
 * ESTRUCTURA DE PESTAÑAS:
 * 1. INICIO: Hábitos del día, nivel, retos diarios
 * 2. HISTORIAL: Registro de hábitos completados
 * 3. ITEMS: Inventario del jugador
 * 4. LOGROS: Logros desbloqueados
 */

// ════════════════════════════════════════════════════════════════════════
// IMPORTS
// ════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react';

// Componentes hijos
import Header from './components/layout/Header.jsx';
import LevelProgress from './components/progress/LevelProgress.jsx';
import HabitList from './components/habits/HabitList.jsx';
import HabitHistory from './components/habits/HabitHistory.jsx';
import AchievementsPanel from './components/progress/AchievementsPanel.jsx';
import InventoryPanel from './components/inventory/InventoryPanel.jsx';
import DailyChallenge from './components/daily-mission/DailyChallenge.jsx';
import PlanCard from './components/plans/PlanCard.jsx';
import Notifications from './components/ui/Notifications.jsx';
import Auth from './components/auth/Auth.jsx';
import StoriesPanel from './components/journey/StoriesPanel.jsx';
import JourneyRewardFlow from './components/journey/JourneyRewardFlow.jsx';
import DailyRewardFlow from './components/daily-mission/DailyRewardFlow.jsx';
import StreakRewardModal from './components/progress/StreakRewardModal.jsx';
import DailyChoiceModal from './components/daily-mission/DailyChoiceModal.jsx';

// Utilidades
import { supabase } from './lib/supabase.js';
import useGameStore from './store/gameStore.js';

// ════════════════════════════════════════════════════════════════════════
// DEFINICIÓN DE PESTAÑAS
// ════════════════════════════════════════════════════════════════════════

/**
 * Definición de las pestañas de navegación.
 * Cada pestaña tiene:
 * - id: Identificador único
 * - label: Texto a mostrar
 * - icon: Emoji representativo
 */
const TABS = [
  { id: 'home', label: 'INICIO', icon: '🏠' },
  { id: 'history', label: 'HISTORIAL', icon: '📅' },
  { id: 'items', label: 'ITEMS', icon: '🎒' },
  { id: 'achieve', label: 'LOGROS', icon: '🏆' },
];

/**
 * Componente principal de la aplicación.
 * Maneja el ciclo de vida completo: carga, autenticación, navegación.
 */
export default function App() {
  // ════════════════════════════════════════════════════════════════════════
  // ESTADO DE LA APLICACIÓN
  // ════════════════════════════════════════════════════════════════════════

  /** Sesión actual del usuario (null si no está autenticado) */
  const [session, setSession] = useState(null);

  /** Estado de carga inicial */
  const [loading, setLoading] = useState(true);

  /** Pestaña activa actualmente */
  const [tab, setTab] = useState('home');

  /** Control del panel de historias */
  const [storiesPanelOpen, setStoriesPanelOpen] = useState(false);

  /** Función para inicializar el store del juego */
  const { init, dailyOptions, dailySelectionMade, currentDaily, selectDaily } = useGameStore();

  /** Efecto visual de rebote al cambiar pestañas (en móvil) */
  const [bounceOffset, setBounceOffset] = useState(0);

  /** Detecta si estamos en vista móvil (< 768px) */
  const [isMobileView, setIsMobileView] = useState(false);

  /** Referencias para manejar gestos táctiles */
  const touchStartRef = useRef({ x: 0, y: 0 });

  /** Evita reinicializar el store múltiples veces para el mismo usuario */
  const lastInitializedUserIdRef = useRef(null);

  /** Timer para el efecto de rebote */
  const bounceTimer = useRef(null);

  // ════════════════════════════════════════════════════════════════════════
  // EFECTOS (LIFECYCLE)
  // ════════════════════════════════════════════════════════════════════════

  /**
   * Efecto: Detectar tamaño de pantalla
   * Se ejecuta al montar y cuando cambia el tamaño de la ventana.
   * Usa matchMedia para detectar viewports móviles.
   */
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const matcher = window.matchMedia('(max-width: 768px)');
    const handler = (ev) => setIsMobileView(ev.matches);
    setIsMobileView(matcher.matches);
    matcher.addEventListener('change', handler);
    return () => matcher.removeEventListener('change', handler);
  }, []);

  /**
   * Effect: Verificar autenticación al iniciar
   * 1. Intenta obtener la sesión actual de Supabase
   * 2. Establece un timeout de 5 segundos por seguridad
   * 3. Se suscribe a cambios de estado de autenticación
   */
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

    // Suscribirse a cambios de autenticación (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => setSession(session));

    // Limpiar suscripción al desmontar
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  /**
   * Effect: Inicializar store cuando hay sesión
   * Cuando el usuario inicia sesión, cargamos sus datos.
   */
  useEffect(() => {
    const userId = session?.user?.id ?? null;

    if (!userId) {
      lastInitializedUserIdRef.current = null;
      return;
    }

    if (lastInitializedUserIdRef.current === userId) {
      return;
    }

    lastInitializedUserIdRef.current = userId;
    init(userId);
  }, [session, init]);

  /**
   * Effect: Limpiar timer de rebote al desmontar
   * Evita memory leaks con timeouts pendientes.
   */
  useEffect(() => {
    return () => {
      if (bounceTimer.current) {
        clearTimeout(bounceTimer.current);
      }
    };
  }, []);

  // ════════════════════════════════════════════════════════════════════════
  // FUNCIONES DE NAVEGACIÓN
  // ════════════════════════════════════════════════════════════════════════

  /**
   * Índice de la pestaña actual en el array TABS.
   * Se usa para calcular el desplazamiento horizontal.
   */
  const currentIndex = Math.max(0, TABS.findIndex(t => t.id === tab));

  /**
   * Aplica un efecto de rebote visual.
   * Se usa cuando el usuario intenta navegar más allá de los límites
   * o cuando cambia de pestaña.
   * 
   * @param {number} direction - Dirección del rebote (-1 o 1)
   */
  const applyBounce = (direction) => {
    if (bounceTimer.current) clearTimeout(bounceTimer.current);
    setBounceOffset(direction * 14);
    bounceTimer.current = setTimeout(() => {
      setBounceOffset(0);
      bounceTimer.current = null;
    }, 220);
  };

  /**
   * Maneja el inicio de un gesto táctil.
   * Guarda las coordenadas iniciales del toque.
   */
  const handleTouchStart = (event) => {
    const touch = event.touches?.[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  /**
   * Maneja el final de un gesto táctil.
   * Determina si fue un swipe horizontal o vertical.
   * 
   * LÓGICA:
   * 1. Si el movimiento es más vertical que horizontal → ignorar
   * 2. Si el movimiento es menor a 60px → considerar como tap
   * 3. Si es un swipe válido → cambiar de pestaña
   * 4. Si estamos en el borde → aplicar rebote
   */
  const handleTouchEnd = (event) => {
    const touch = event.changedTouches?.[0];
    if (!touch) return;
    const { x: startX, y: startY } = touchStartRef.current;
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;

    // Movimiento más vertical que horizontal o muy pequeño
    if (Math.abs(dx) < Math.abs(dy) || Math.abs(dx) < 60) {
      if (Math.abs(dx) > 10) {
        applyBounce(dx < 0 ? -1 : 1);
      }
      return;
    }

    // Determinar dirección del swipe
    const direction = dx < 0 ? 1 : -1;
    const targetIndex = Math.max(0, Math.min(TABS.length - 1, currentIndex + direction));

    // Si no hay cambio de pestaña, aplicar rebote
    if (targetIndex === currentIndex) {
      applyBounce(direction * -1);
      return;
    }

    // Limpiar timer y cambiar de pestaña
    if (bounceTimer.current) {
      clearTimeout(bounceTimer.current);
      bounceTimer.current = null;
    }
    setBounceOffset(0);
    setTab(TABS[targetIndex].id);
  };

  /**
   * Maneja el cambio de pestaña mediante botones.
   * Limpia cualquier animación de rebote pendiente.
   */
  const handleTabChange = (newTab) => {
    if (bounceTimer.current) {
      clearTimeout(bounceTimer.current);
      bounceTimer.current = null;
    }
    setBounceOffset(0);
    setTab(newTab);
  };

  // ════════════════════════════════════════════════════════════════════════
  // RENDERIZADO CONDICIONAL
  // ════════════════════════════════════════════════════════════════════════

  /** Verifica si las variables de entorno de Supabase están configuradas */
  const isEnvMissing = !import.meta.env.PUBLIC_SUPABASE_URL || !import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  // Pantalla de error si falta configuración
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

  // Pantalla de carga inicial
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

  // Si no hay sesión, mostrar componente de autenticación
  if (!session) {
    return <Auth />;
  }

  // Configurar handlers táctiles (siempre activos para evitar problemas de detección inicial)
  const touchHandlers = { onTouchStart: handleTouchStart, onTouchEnd: handleTouchEnd };

  // ════════════════════════════════════════════════════════════════════════
  // RENDERIZADO PRINCIPAL
  // ════════════════════════════════════════════════════════════════════════

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-quest-bg antialiased">
      {/* Header fijo en la parte superior */}
      <Header onNavigate={handleTabChange} />

      {/* Área de contenido principal con navegación horizontal */}
      <div className="flex-1 overflow-hidden relative">
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ 
            transform: `translateX(calc(-${currentIndex * 100}% + ${bounceOffset}px))`,
            touchAction: 'pan-y' // Permite scroll vertical pero delega el horizontal a JS
          }}
          {...touchHandlers}
        >
          {/* PESTAÑA 1: INICIO */}
          <section className="w-full flex-shrink-0">
            <div className="h-full overflow-y-auto">
              <main className="max-w-[900px] w-full mx-auto p-3 sm:px-4">
                <div className="anim-fade-in">
                  <div className="mb-2">
                    <h2 className="text-[10px] sm:text-xs font-pixel text-quest-gold uppercase tracking-wider">🌟 Aventura del Viajero</h2>
                  </div>
                  <LevelProgress onOpenStories={() => setStoriesPanelOpen(true)} />
                  <DailyChallenge />
                  <PlanCard />
                  <HabitList />
                </div>
              </main>
            </div>
          </section>

          {/* PESTAÑA 2: HISTORIAL */}
          <section className="w-full flex-shrink-0">
            <div className="h-full overflow-y-auto">
              <main className="max-w-[900px] w-full mx-auto p-3 sm:px-4">
                <div className="anim-fade-in">
                  <HabitHistory />
                </div>
              </main>
            </div>
          </section>

          {/* PESTAÑA 3: ITEMS */}
          <section className="w-full flex-shrink-0">
            <div className="h-full overflow-y-auto">
              <main className="max-w-[900px] w-full mx-auto p-3 sm:px-4">
                <div className="anim-fade-in">
                  <InventoryPanel />
                </div>
              </main>
            </div>
          </section>

          {/* PESTAÑA 4: LOGROS */}
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

      {/* Barra de navegación inferior */}
      <nav
        className={`flex justify-around bg-quest-panel border-t-2 border-quest-border pb-[env(safe-area-inset-bottom)] shrink-0 z-[1000] shadow-[0_-4px_10px_rgba(0,0,0,0.5)] ${storiesPanelOpen ? 'pointer-events-none' : ''}`}
      >
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

      {/* Componentes overlays */}
      <Notifications />

      {/* Flujo de recompensas de viaje (aparece al subir de nivel) */}
      <JourneyRewardFlow />

      {/* Flujo de recompensas diarias (aparece al completar daily) */}
      <DailyRewardFlow />

      {/* Modal de recompensa por racha múltiplo de 3 */}
      <StreakRewardModal />

      {/* Modal de elección de misión diaria (aparece al abrir app por primera vez en el día) */}
      {(() => {
        const shouldShowModal = dailyOptions &&
          dailyOptions.length > 0 &&
          !dailySelectionMade &&
          !currentDaily;

        return shouldShowModal && (
          <DailyChoiceModal
            options={dailyOptions}
            onSelect={(dailyId) => selectDaily(dailyId)}
          />
        );
      })()}

      {/* Panel de historias (se abre al hacer clic en LevelProgress) */}
      {storiesPanelOpen && (
        <StoriesPanel onClose={() => setStoriesPanelOpen(false)} />
      )}
    </div>
  );
}
