/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      colors: {
        quest: {
          bg: '#0a0a1a',
          panel: '#12122a',
          card: '#1a1a3e',
          border: '#2a2a6e',
          borderLight: '#4040a0',
          green: '#00e676',
          greenDark: '#00a050',
          gold: '#ffd700',
          goldDark: '#cc9900',
          red: '#ff1744',
          redDark: '#cc0000',
          blue: '#448aff',
          purple: '#e040fb',
          orange: '#ff9100',
          cyan: '#00e5ff',
          text: '#e8e8ff',
          textDim: '#8888bb',
          textMuted: '#4444aa',
        },
      },
      boxShadow: {
        pixel: '4px 4px 0px rgba(0,0,0,0.8)',
        'pixel-sm': '2px 2px 0px rgba(0,0,0,0.8)',
        'pixel-glow-green': '0 0 12px rgba(0,230,118,0.4)',
        'pixel-glow-gold': '0 0 12px rgba(255,215,0,0.4)',
        'pixel-glow-red': '0 0 12px rgba(255,23,68,0.4)',
        'pixel-glow-blue': '0 0 12px rgba(68,138,255,0.4)',
        'pixel-glow-purple': '0 0 12px rgba(224,64,251,0.4)',
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
