/** @type {import('tailwindcss').Config} */
/** A themed colour: CSS variable holding an "R G B" triplet, alpha-aware. */
const v = name => `rgb(var(--${name}) / <alpha-value>)`;

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
        // Every themed colour is a CSS variable (src/app/globals.css) holding an
        // "R G B" triplet, so one class works in light AND dark and Tailwind's
        // opacity modifiers (bg-cyan-500/15) keep working. Change a colour in
        // one place: the variable.
        //
        //   cyan     → every interactive surface (buttons, links, focus, active)
        //   warning  → XP / rewards            success → correct / completion
        //   danger   → errors / wrong answers  surface/bg/text/border → neutral
        //   onaccent → white text on solid saturated fills (same in both themes)
        cyan: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: v('cyan-300'),  // emphasis text / hover
          400: v('cyan-400'),  // solid interactive fill + links/icons
          500: v('cyan-500'),  // brand mark + tint base (bg-cyan-500/10 …)
          600: v('cyan-600'),
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        success: { light: v('success-light'), DEFAULT: v('success'), dark: v('success-dark') },
        warning: { light: v('warning-light'), DEFAULT: v('warning'), dark: v('warning-dark') },
        danger:  { light: v('danger-light'),  DEFAULT: v('danger'),  dark: v('danger-dark') },
        surface: {
          50: v('surface-50'), 100: v('surface-100'), 200: v('surface-200'), 300: v('surface-300'),
          400: v('surface-400'), 500: v('surface-500'), 600: v('surface-600'), 700: v('surface-700'),
          800: v('surface-800'), 900: v('surface-900'), 950: v('surface-950'),
        },
        bg: { DEFAULT: v('bg') },
        text: {
          primary:   v('text-primary'),
          secondary: v('text-secondary'),
          muted:     v('text-muted'),
          inverse:   v('text-inverse'),
        },
        border: { DEFAULT: v('border'), light: v('border-light') },
        onaccent: '#ffffff',
      },
      boxShadow: {
        // Shadows are tinted to the navy background hue (never pure black) and
        // suggest a single top light source via the `edge` inset.
        'card': '0 1px 2px 0 rgb(var(--shadow) / 0.5), 0 10px 26px -12px rgb(var(--shadow) / 0.75)',
        'card-hover': '0 2px 6px 0 rgb(var(--shadow) / 0.55), 0 18px 40px -16px rgb(var(--shadow) / 0.85)',
        'edge': 'inset 0 1px 0 0 rgb(148 163 184 / 0.06)',
        'focus': '0 0 0 2px rgb(var(--bg)), 0 0 0 4px rgb(var(--cyan-400) / 0.55)',
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
