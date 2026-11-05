export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./docs/**/*.html",
    "./assets/**/*.js",
    "./*.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        archive: {
          paper: '#FBF9F5',
          limestone: '#F2EFE9',
          surface: '#EAE5DC',
          border: '#DED8CD',
          borderStrong: '#C5BDB0',
          ink: '#1C1917',
          inkSoft: '#44403C',
          muted: '#78716C',
          forest: '#14532D',
          forestHover: '#166534',
          terracotta: '#9A3412',
          bronze: '#78350F',
          lapis: '#1E3A8A',
        },
        kingdom: {
          bg: '#FBF9F5',
          card: '#F2EFE9',
          surface: '#EAE5DC',
          border: '#DED8CD',
          gold: '#14532D',
          accent: '#9A3412',
          emerald: '#14532D',
          rose: '#9A3412',
          muted: '#78716C',
        }
      }
    }
  },
  plugins: [],
}

