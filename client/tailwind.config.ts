import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        kirov: {
          900: '#0a0a1a',
          800: '#12122a',
          700: '#1a1a3e',
          600: '#252550',
          500: '#3a3a6a',
          400: '#5555aa',
          300: '#7777cc',
          200: '#9999dd',
          100: '#bbbbee',
          accent: '#00ff88',
          danger: '#ff3355',
          warning: '#ffaa00',
          info: '#33aaff',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
