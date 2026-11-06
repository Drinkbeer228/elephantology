/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        serif: ['var(--font-serif)'],
        mono: ['var(--font-mono)'],
      },
      colors: {
        paper: {
          DEFAULT: 'var(--bg-canvas)',
          warm: 'var(--bg-surface)',
          subtle: 'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
        },
        ink: {
          DEFAULT: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          inverse: 'var(--text-inverse)',
        },
        rule: {
          DEFAULT: 'var(--border-subtle)',
          subtle: 'var(--border-subtle)',
          strong: 'var(--border-strong)',
          emphasis: 'var(--border-emphasis)',
        },
        forest: {
          DEFAULT: 'var(--text-accent)',
          hover: 'var(--text-accent-hover)',
          subtle: 'var(--bg-accent-subtle)',
        },
      },
    },
  },
  plugins: [],
}
