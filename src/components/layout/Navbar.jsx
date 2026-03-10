/**
 * Navbar - Barra de navegación inferior de la aplicación
 * 
 * Navegación principal de la aplicación con 4 pestañas:
 * - INICIO: Vista principal de hábitos del día
 * - HISTORIAL: Registro de últimos 7 días
 * - ITEMS: Inventario de objetos
 * - LOGROS: Panel de logros
 * 
 * Estilo: Barra inferior fija con iconos y etiquetas,
 * compatible con dispositivos móviles (safe-area-inset-bottom)
 * 
 * @component
 * @param {Object} props
 * @param {string} props.activeTab - ID de la pestaña activa
 * @param {Function} props.onTabChange - Función llamada al cambiar de pestaña
 * @returns {JSX.Element} Barra de navegación inferior
 */
export default function Navbar({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'home',      label: 'INICIO',    icon: '🏠' },
    { id: 'history',   label: 'HISTORIAL', icon: '📅' },
    { id: 'items',     label: 'ITEMS',     icon: '🎒' },
    { id: 'achieve',   label: 'LOGROS',    icon: '🏆' },
  ];

  return (
    <nav style={{
      background: '#0a0a1e',
      borderTop: '2px solid #2a2a6a',
      display: 'flex',
      justifyContent: 'space-around',
      paddingBottom: 'env(safe-area-inset-bottom)',
      position: 'relative',
      zIndex: 1000,
      boxShadow: '0 -4px 10px rgba(0,0,0,0.5)'
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            flex: 1,
            padding: '12px 0',
            background: 'transparent',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
            transition: 'all 0.2s',
            opacity: activeTab === tab.id ? 1 : 0.4,
          }}
        >
          <span style={{ fontSize: 16 }}>{tab.icon}</span>
          <span style={{
            fontSize: 6,
            color: activeTab === tab.id ? '#00ff88' : '#e8e8ff',
            fontFamily: '"Press Start 2P", monospace',
          }}>
            {tab.label}
          </span>
          {activeTab === tab.id && (
            <div style={{
              width: 12,
              height: 2,
              background: '#00ff88',
              marginTop: 2,
              boxShadow: '0 0 5px #00ff88'
            }} />
          )}
        </button>
      ))}
    </nav>
  );
}
