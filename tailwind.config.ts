import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0A0A0F',
          secondary: '#12121A',
          tertiary: '#1A1A25',
          elevated: '#22222F',
        },
        gold: {
          50: '#FFF9E6',
          100: '#F4E4A0',
          200: '#E8D080',
          300: '#DCBC60',
          400: '#D4AF37',
          500: '#B8960B',
          600: '#9A7D09',
          700: '#7C6407',
          800: '#5E4B05',
          900: '#403203',
        },
        accent: {
          blue: '#4A90D9',
          green: '#4ADE80',
          red: '#DC143C',
          orange: '#FF8C00',
          purple: '#9370DB',
          teal: '#20B2AA',
          crimson: '#8B0000',
        },
        text: {
          primary: '#E8E6E1',
          secondary: '#A0A0A0',
          muted: '#666666',
          inverse: '#0A0A0F',
        },
        border: {
          subtle: 'rgba(255,255,255,0.06)',
          medium: 'rgba(255,255,255,0.12)',
          strong: 'rgba(255,255,255,0.20)',
          gold: 'rgba(212,175,55,0.25)',
        }
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'kpi': ['2.5rem', { lineHeight: '1', fontWeight: '800' }],
        'section-title': ['2.25rem', { lineHeight: '1.2', fontWeight: '300' }],
        'label': ['0.6875rem', { lineHeight: '1', fontWeight: '700', letterSpacing: '0.15em' }],
      },
      boxShadow: {
        'gold-sm': '0 0 10px rgba(212,175,55,0.15)',
        'gold-md': '0 0 20px rgba(212,175,55,0.2)',
        'gold-lg': '0 0 40px rgba(212,175,55,0.3)',
        'card': '0 4px 24px rgba(0,0,0,0.3)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'slide-in': 'slideIn 0.3s ease forwards',
        'pulse-gold': 'pulseGold 2s ease infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(212,175,55,0.4)' },
          '50%': { boxShadow: '0 0 16px rgba(212,175,55,0.6)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config

