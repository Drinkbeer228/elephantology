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
        pixel: ['Silkscreen', 'monospace'],
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          blue: '#38bdf8',    // лазурно-голубой — ссылки, DOI, цитаты (secondary)
          pink: '#10b981',    // историческое имя → изумрудный primary-акцент
          bg: '#0b0f17',      // базовый фон Modern Dark Editorial
          emerald: '#10b981', // научный акцент: статусы «УСТАНОВЛЕНО», теги, active
          azure: '#38bdf8',   // цитаты, DOI, ссылки
        },
        ink: {
          base: '#0b0f17',      // page background
          surface: '#111827',   // section surface
          elevated: '#1a2234',  // elevated card
          border: '#243046',    // hairline borders
        },
        kingdom: {
          bg: '#0b0f17',
          card: '#1a2234',
          surface: '#111827',
          border: '#243046',
          gold: '#38bdf8',
          accent: '#38bdf8',
          emerald: '#10b981',
          rose: '#fb7185',
          muted: '#94a3b8',
        }
      }
    }
  },
  plugins: [],
}
