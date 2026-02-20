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
