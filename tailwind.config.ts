import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f',
        surface: '#13131a',
        surface2: '#1c1c28',
        border: '#2a2a3d',
        accent: '#6c63ff',
        accent2: '#a78bfa',
        success: '#22d3a0',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
