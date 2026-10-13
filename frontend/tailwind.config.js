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
        // ── Palette ────────────────────────────────────────────────────────────
        // One interactive accent, locked project-wide: cyan. The brand mark is
        // the same cyan family, so the UI never fights the logo.
        //
        //   cyan     → every interactive surface (buttons, links, focus, active)
        //   warning  → XP / rewards            success → correct / completion
        //   danger   → errors / wrong answers  surface/bg/text/border → neutral
        //
        // Do not introduce a second accent hue. Violet, cobalt and lime were
        // removed from the old palette precisely so the accent cannot drift.

        // Accent: restrained cyan / teal
        cyan: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',  // brightest — hover / emphasis text
          400: '#22d3ee',  // solid interactive fill + links/icons on dark
          500: '#06b6d4',  // brand mark + tint base (bg-cyan-500/10 …)
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
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
        // Surfaces — cool navy family (one grey temperature across the app)
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
          950: '#080c14',  // deepest navy
        },
        // Background — deep navy (never pure black)
        bg: {
          DEFAULT: '#080c14',
        },
        // Text
        text: {
          primary:   '#f8fafc',
          secondary: '#94a3b8',
          // AA-checked on every surface it is used on (bg 6.44, surface-900
          // 5.88, surface-800 4.82) — the old #64748b failed all three.
          muted:     '#8296ad',
          inverse:   '#04121a',
        },
        // Borders
        border: {
          DEFAULT: '#1e293b',
          light:   '#334155',
        },
      },
      boxShadow: {
        // Shadows are tinted to the navy background hue (never pure black) and
        // suggest a single top light source via the `edge` inset.
        'card': '0 1px 2px 0 rgb(2 6 16 / 0.5), 0 10px 26px -12px rgb(2 6 16 / 0.75)',
        'card-hover': '0 2px 6px 0 rgb(2 6 16 / 0.55), 0 18px 40px -16px rgb(2 6 16 / 0.85)',
        'edge': 'inset 0 1px 0 0 rgb(148 163 184 / 0.06)',
        'focus': '0 0 0 2px rgb(8 12 20), 0 0 0 4px rgb(34 211 238 / 0.55)',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'md': '10px',
        'lg': '14px',
        'xl': '18px',
        '2xl': '22px',
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
        // Editorial display scale — landing / auth / celebration only.
        'display': ['clamp(2rem, 5.5vw, 3.25rem)', { lineHeight: '1.05', letterSpacing: '-0.035em', fontWeight: '800' }],
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
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
        'scale-in': 'scale-in 0.25s cubic-bezier(0.2, 0.9, 0.25, 1)',
      },
      zIndex: {
        nav: '40',
        overlay: '60',
        skip: '100',
      },
    },
  },
  plugins: [],
};
