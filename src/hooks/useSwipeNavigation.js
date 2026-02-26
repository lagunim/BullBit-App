import { useState, useEffect, useCallback } from 'react';

const SWIPE_THRESHOLD = 50;
const MIN_HORIZONTAL_RATIO = 1.5; // horizontal movement must be 1.5x vertical to count as swipe

/**
 * Hook para navegación por deslizamiento lateral en móvil.
 * Deslizar a la izquierda = siguiente sección.
 * Deslizar a la derecha = sección anterior.
 * Solo se activa en viewports móviles (max-width: 768px).
 */
export function useSwipeNavigation(tabs, currentTabId, setTab) {
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleTouchStart = useCallback(
    (e) => {
      if (!isMobile) return;
      setTouchStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      });
    },
    [isMobile]
  );

  const handleTouchEnd = useCallback(
    (e) => {
      if (!isMobile || !touchStart) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStart.x;
      const dy = touch.clientY - touchStart.y;

      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      // Solo actuar si el movimiento fue principalmente horizontal
      if (absDx < SWIPE_THRESHOLD || absDx < absDy * MIN_HORIZONTAL_RATIO) {
        setTouchStart(null);
        return;
      }

      const currentIndex = tabs.findIndex((t) => t.id === currentTabId);
      if (currentIndex === -1) {
        setTouchStart(null);
        return;
      }

      if (dx > 0) {
        // Swipe derecha -> anterior
        if (currentIndex > 0) {
          setTab(tabs[currentIndex - 1].id);
        }
      } else {
        // Swipe izquierda -> siguiente
        if (currentIndex < tabs.length - 1) {
          setTab(tabs[currentIndex + 1].id);
        }
      }
      setTouchStart(null);
    },
    [isMobile, touchStart, tabs, currentTabId, setTab]
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    isMobile,
  };
}
