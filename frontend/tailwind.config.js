/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        rms: {
          dark: '#0f1419',
          panel: '#161d26',
          border: '#2d3748',
          muted: '#718096',
          amber: '#f59e0b',
          'amber-dim': '#b45309',
          emerald: '#10b981',
          'emerald-dim': '#059669',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'rms': '0 4px 24px -4px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
        'rms-lg': '0 8px 40px -8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
        'glow-amber': '0 0 20px -4px rgba(245, 158, 11, 0.35)',
        'glow-emerald': '0 0 20px -4px rgba(16, 185, 129, 0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
