/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0a0a',
          800: '#0d1117',
          700: '#111827',
          600: '#161b22',
          500: '#1f2937',
          400: '#374151',
          300: '#4b5563',
        },
        accent: {
          DEFAULT: '#06b6d4',
          hover: '#0891b2',
          light: '#22d3ee',
          glow: 'rgba(6, 182, 212, 0.25)',
        },
        panel: {
          bg: '#0d1117',
          card: '#161b22',
          border: '#30363d',
          text: '#c9d1d9',
          muted: '#8b949e',
          accent: '#58a6ff',
          green: '#3fb950',
          red: '#f85149',
          yellow: '#d29922',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
        'marquee-hover': 'marquee 30s linear infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(6,182,212,0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(6,182,212,0.4)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(10px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
