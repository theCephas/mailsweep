import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        surface: 'hsl(var(--surface))',
        border: 'hsl(var(--border))',
        primary: 'hsl(var(--primary))',
        text: 'hsl(var(--text))',
        muted: 'hsl(var(--muted))',
        accent: 'hsl(var(--accent))',
        danger: 'hsl(var(--danger))',
        success: 'hsl(var(--success))',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      boxShadow: {
        'primary-glow': '0 0 30px hsl(var(--primary) / 0.35)',
        'primary-glow-lg': '0 0 60px hsl(var(--primary) / 0.45)',
        soft: '0 20px 60px hsl(var(--shadow) / 0.25)',
      },
    },
  },
  plugins: [],
}
export default config
