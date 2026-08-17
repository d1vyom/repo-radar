import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        border: 'hsl(var(--border))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          hover: 'hsl(var(--primary-hover))',
          glow: 'hsl(var(--primary-glow))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          hover: 'hsl(var(--accent-hover))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          hover: 'hsl(var(--warning-hover))',
        },
        danger: {
          DEFAULT: 'hsl(var(--danger))',
          hover: 'hsl(var(--danger-hover))',
        },
        surface: {
          1: 'hsl(var(--surface-1))',
          2: 'hsl(var(--surface-2))',
          3: 'hsl(var(--surface-3))',
        },
        input: {
          bg: 'hsl(var(--input-bg))',
          border: 'hsl(var(--input-border))',
          focus: 'hsl(var(--input-focus))',
        },
        code: {
          bg: 'hsl(var(--code-bg))',
          border: 'hsl(var(--code-border))',
        },
      },
      borderColor: {
        DEFAULT: 'hsl(var(--border))',
      },
      container: {
        center: true,
        padding: '1rem',
        screens: {
          '2xl': '1400px',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;