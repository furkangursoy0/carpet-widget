import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './emails/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette
        ink: '#0F172A',
        sub: '#64748B',
        line: '#E4EAF3',
        rail: '#EBF0F7',
        surface: '#FFFFFF',
        bg: '#F8FAFC',
        brand: {
          DEFAULT: '#2458F5',
          dark: '#1D4ED8',
          light: '#EFF6FF',
          tint: '#EEF3FE',
          ink: '#1E3A8A',
        },
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(15, 23, 42, 0.03)',
        cardHover: '0 8px 24px rgba(15, 23, 42, 0.08)',
        brand: '0 6px 16px rgba(36, 88, 245, 0.20)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
