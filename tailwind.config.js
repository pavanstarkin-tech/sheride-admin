/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7F00FD',
          50: '#F6EEFF',
          100: '#EDDCFF',
          200: '#DCBAFF',
          300: '#C591FF',
          400: '#A753FD',
          500: '#7F00FD',
          600: '#6E00DE',
          700: '#5C00BC',
          800: '#480096',
          900: '#310068',
          950: '#1E0043',
        },
        golden: {
          DEFAULT: '#FFB001',
          50: '#FFF9E6',
          100: '#FFF0BF',
          200: '#FFE494',
          300: '#FFD664',
          400: '#FFC433',
          500: '#FFB001',
          600: '#E69E00',
          700: '#BF8300',
          800: '#996900',
          900: '#734F00',
        },
        softwhite: {
          DEFAULT: '#F6F6FE',
          50: '#FFFFFF',
          100: '#FAF9FE',
          200: '#F6F6FE',
          300: '#ECEBFA',
          400: '#DFDCF5',
        },
        brand: {
          purple: '#7F00FD',
          purpleDark: '#5C00BC',
          purpleLight: '#EDDCFF',
          golden: '#FFB001',
          goldenDark: '#E69E00',
          goldenLight: '#FFF0BF',
          softWhite: '#F6F6FE',
          darkText: '#180D2B',
          // Backwards compatibility aliases
          pink: '#7F00FD',
          darkPink: '#5C00BC',
          lightPink: '#F6EEFF',
          accentPink: '#EDDCFF',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Fraunces', 'Recoleta', 'Georgia', 'serif'],
        display: ['Fraunces', 'Recoleta', 'serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(127, 0, 253, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card-hover': '0 12px 28px -5px rgba(127, 0, 253, 0.09), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        'modal': '0 25px 50px -12px rgba(127, 0, 253, 0.25)',
        'golden': '0 4px 14px 0 rgba(255, 176, 1, 0.35)',
        'purple': '0 4px 14px 0 rgba(127, 0, 253, 0.35)',
      }
    },
  },
  plugins: [],
}

