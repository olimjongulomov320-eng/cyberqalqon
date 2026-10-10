/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        // Brand colors — CyberQalqon identity
        // Primary: Electric Violet
        primary: {
          50:  '#f5f0ff',
          100: '#ebe6ff',
          200: '#d6ccff',
          300: '#b8a8ff',
          400: '#9575ff',
          500: '#7c3aed',  // Main primary - electric violet
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#3e1a7a',
          950: '#2e1065',
        },
        // Secondary: Bright Cobalt Blue
        secondary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',  // Main secondary - bright cobalt
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        cyan: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',  // Cyan
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        // Accent: Fresh Lime
        accent: {
          50:  '#f7fee7',
          100: '#ecfccb',
          300: '#d9f99d',
          400: '#bef264',
          500: '#a3e635',  // Lime
          600: '#84cc16',
          700: '#65a30d',
          800: '#4d7c0f',
          900: '#3f6212',
          950: '#2a4308',
        },
        // Semantic colors
        success: {
          light: '#4ade80',
          DEFAULT: '#22c55e',
          dark: '#16a34a',
        },
        warning: {
          light: '#fbbf24',
          DEFAULT: '#f59e0b',
          dark: '#d97706',
        },
        danger: {
          light: '#f87171',
          DEFAULT: '#ef4444',
          dark: '#dc2626',
        },
        // Surfaces — Deep navy family
        surface: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#080c14',  // Deepest navy
        },
        // Background — deep navy
        bg: {
          DEFAULT: '#080c14',
        },
        // Text
        text: {
          primary:   '#f8fafc',
          secondary: '#94a3b8',
          muted:     '#64748b',
          inverse:   '#080c14',
        },
        // Borders
        border: {
          DEFAULT: '#1e293b',
          light:   '#334155',
        },
      },
      boxShadow: {
        // Shadows with subtle violet tint
        'card': '0 1px 3px 0 rgb(8 12 20 / 0.4), 0 8px 24px -8px rgb(124 58 237 / 0.15)',
        'card-hover': '0 4px 12px 0 rgb(8 12 20 / 0.5), 0 16px 32px -12px rgb(124 58 237 / 0.2)',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'md': '10px',
        'lg': '14px',
        'xl': '18px',
        '2xl': '24px',
        'full': '9999px',
      },
      spacing: {
        '0': '0',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '9': '36px',
        '10': '40px',
        '11': '44px',
        '12': '48px',
        '14': '56px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        '28': '112px',
        '32': '128px',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.02em' }],
        'sm': ['0.8125rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        'base': ['0.9375rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'lg': ['1.0625rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        'xl': ['1.25rem', { lineHeight: '1.4', letterSpacing: '-0.015em' }],
        '2xl': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.02em' }],
        '3xl': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.025em' }],
        '4xl': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.03em' }],
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.035em' }],
        'display': ['clamp(1.875rem, 4vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '800' }],
      },
      transitionDuration: {
        '0': '0ms',
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.2, 0.9, 0.25, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.2, 0.9, 0.25, 1)',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #080c14 0%, #1e1b4b 50%, #080c14 100%)',
        'gradient-mesh': 'radial-gradient(ellipse at 20% 20%, rgba(124,58,237,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(37,99,235,0.15) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(6,182,212,0.1) 0%, transparent 60%)',
      },
      zIndex: {
        nav: '40',
        skip: '100',
      },
    },
  },
  plugins: [],
};