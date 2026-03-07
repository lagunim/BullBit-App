/**
 * StoryScrollModal - Modal estilo pergamino para leer historias
 * 
 * Modal decorativo que simula un pergamino antiguo para la lectura
 * de historias desbloqueadas. Incluye animaciones de despliegue
 * y estilos visuales temáticos (tinta, bordes dorados, textura).
 * 
 * Props:
 * - story: Objeto con {id, title, content} de la historia
 * - onClose: Función llamada al cerrar el modal
 * - journeyNumber: (opcional) número de viaje a mostrar en el encabezado
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.story - Objeto de la historia a mostrar
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {number} props.journeyNumber - (opcional) Número del viaje
 * @returns {JSX.Element|null} Modal de pergamino o null si no hay historia
 */
import { useEffect, useRef, useState } from 'react';

/**
 * StoryScrollModal — parchment/pergamino-style modal for reading a story.
 *
 * Props:
 *   story   — { id, title, content }
 *   onClose — called when user dismisses the modal
 *   journeyNumber — optional journey number to show in header
 */
export default function StoryScrollModal({ story, onClose, journeyNumber }) {
  const overlayRef = useRef(null);
  const [visible, setVisible] = useState(false);

  // Trigger mount animation
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 260);
  }

  if (!story) return null;

  return (
    <>
      <style>{`
        @keyframes scroll-unroll {
          from { transform: scaleY(0.05) translateY(-10px); opacity: 0; }
          to   { transform: scaleY(1)    translateY(0);     opacity: 1; }
        }
        @keyframes scroll-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .scroll-unroll-enter {
          animation: scroll-unroll 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-origin: top center;
        }
        .scroll-content-fade {
          animation: scroll-fade-in 0.3s ease 0.18s both;
        }
        .scroll-unroll-exit {
          animation: scroll-unroll 0.22s cubic-bezier(0.7, 0, 0.84, 0) reverse forwards;
          transform-origin: top center;
        }
        .parchment-texture {
          background-image:
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 22px,
              rgba(120, 80, 20, 0.07) 22px,
              rgba(120, 80, 20, 0.07) 23px
            ),
            radial-gradient(ellipse at 20% 30%, rgba(180, 120, 40, 0.08) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 70%, rgba(140, 90, 20, 0.06) 0%, transparent 50%),
            linear-gradient(170deg, #2a1a04 0%, #1c1003 40%, #140d02 70%, #1e1505 100%);
        }
        .scroll-rod {
          background: linear-gradient(180deg,
            #c8922a 0%, #f0c050 20%, #e8a830 35%, #b07020 50%,
            #e8a830 65%, #f0c050 80%, #c8922a 100%
          );
          box-shadow: inset 0 1px 2px rgba(255,255,200,0.4), 0 2px 6px rgba(0,0,0,0.6);
        }
        .ink-text {
          color: #c8a86a;
          text-shadow: 0 0 8px rgba(200, 160, 80, 0.2);
          line-height: 1.85;
        }
        .ink-title {
          color: #f0c050;
          text-shadow: 0 0 10px rgba(240, 180, 50, 0.35);
        }
        .scroll-border {
          border: 2px solid #a07830;
          box-shadow:
            inset 0 0 0 1px rgba(80, 50, 0, 0.5),
            0 0 0 3px #0d0a04,
            0 0 0 5px #6a4a10,
            0 8px 32px rgba(0, 0, 0, 0.8),
            0 0 60px rgba(160, 120, 48, 0.15);
        }
        .corner-ornament::before,
        .corner-ornament::after {
          content: '❧';
          position: absolute;
          font-size: 10px;
          color: #a07830;
          opacity: 0.7;
        }
        .scroll-body::-webkit-scrollbar { width: 4px; }
        .scroll-body::-webkit-scrollbar-track { background: rgba(80, 50, 0, 0.3); }
        .scroll-body::-webkit-scrollbar-thumb {
          background: #a07830;
          border-radius: 2px;
        }
      `}</style>

      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[600] backdrop-blur-sm flex items-center justify-center p-4"
        style={{
          background: 'rgba(0,0,0,0.50)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.26s ease',
        }}
        onClick={handleClose}
      >
        {/* Scroll container */}
        <div
          className={`relative w-full max-w-sm flex flex-col ${visible ? 'scroll-unroll-enter' : ''}`}
          style={{ maxHeight: '88vh' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Top rod */}
          <div
            className="scroll-rod w-full h-4 rounded-full shrink-0"
            style={{ zIndex: 2 }}
          />

          {/* Scroll body */}
          <div
            className="parchment-texture scroll-border relative flex flex-col"
            style={{
              borderRadius: '2px',
              marginTop: '-4px',
              marginBottom: '-4px',
              zIndex: 1,
            }}
          >
            {/* Inner border decorative frame */}
            <div
              className="absolute inset-[6px] pointer-events-none"
              style={{
                border: '1px solid rgba(160, 120, 48, 0.3)',
                borderRadius: '1px',
              }}
            />

            {/* Content */}
            <div className="scroll-content-fade px-6 pt-5 pb-5 flex flex-col gap-4">
              {/* Journey label */}
              {journeyNumber != null && (
                <div className="flex justify-center">
                  <div
                    className="font-pixel text-[7px] tracking-[0.2em] px-3 py-1"
                    style={{
                      color: '#a07830',
                      border: '1px solid rgba(160, 120, 48, 0.5)',
                      background: 'rgba(80, 50, 0, 0.4)',
                    }}
                  >
                    — VIAJE {journeyNumber} —
                  </div>
                </div>
              )}

              {/* Title */}
              <div className="text-center">
                <div
                  className="ink-title font-pixel text-[11px] tracking-wide leading-snug"
                  style={{ fontVariant: 'small-caps' }}
                >
                  {story.title}
                </div>
                {/* Decorative divider */}
                <div className="flex items-center gap-2 mt-3 justify-center opacity-60">
                  <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, #a07830)' }} />
                  <span className="font-pixel text-[8px]" style={{ color: '#a07830' }}>✦</span>
                  <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, #a07830, transparent)' }} />
                </div>
              </div>

              {/* Story text — scrollable */}
              <div
                className="scroll-body overflow-y-auto"
                style={{ maxHeight: '46vh', paddingRight: '4px' }}
              >
                {story.content.split('\n\n').map((para, i) => (
                  <p
                    key={i}
                    className="ink-text font-pixel text-[7.5px] mb-3 last:mb-0"
                    style={{ textAlign: 'justify', textIndent: '1.2em' }}
                  >
                    {para.trim()}
                  </p>
                ))}
              </div>

              {/* Bottom divider */}
              <div className="flex items-center gap-2 justify-center opacity-50">
                <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, #a07830)' }} />
                <span className="font-pixel text-[7px]" style={{ color: '#a07830' }}>❧</span>
                <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, #a07830, transparent)' }} />
              </div>

              {/* Close button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleClose}
                  className="font-pixel text-[8px] px-6 py-2 transition-all duration-150 hover:brightness-125 active:scale-95"
                  style={{
                    background: 'linear-gradient(180deg, rgba(80,50,0,0.9), rgba(40,25,0,0.9))',
                    border: '2px solid #a07830',
                    color: '#f0c050',
                    boxShadow: '0 2px 0 #3a2800, 0 0 8px rgba(160,120,48,0.2)',
                    letterSpacing: '0.1em',
                  }}
                >
                  CERRAR PERGAMINO
                </button>
              </div>
            </div>
          </div>

          {/* Bottom rod */}
          <div
            className="scroll-rod w-full h-4 rounded-full shrink-0"
            style={{ zIndex: 2 }}
          />
        </div>
      </div>
    </>
  );
}
