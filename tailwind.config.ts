import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'Georgia', 'serif'],
      },
      colors: {
        'bg-primary': '#FAF9F6',
        'bg-secondary': '#FFFFFF',
        'bg-tertiary': '#F5F4F0',
        'text-primary': '#1A1A19',
        'text-secondary': '#6B6B66',
        'text-tertiary': '#9A9A94',
        'accent': '#2D5A4A',
        'accent-hover': '#234839',
        'accent-light': '#3D7A64',
        'correct': '#2D5A4A',
        'correct-bg': '#E8F0EC',
        'correct-border': '#4A8B73',
        'incorrect': '#C4553D',
        'incorrect-bg': '#FDF4F2',
        'border': '#E8E7E3',
        'border-dark': '#C5C4BE',
        'neutral': '#F0EFEB',
      },
      animation: {
        'shake': 'shake 0.5s ease-in-out',
        'pop': 'pop 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(26, 26, 25, 0.04), 0 1px 2px rgba(26, 26, 25, 0.06)',
        'card-hover': '0 8px 24px rgba(26, 26, 25, 0.12), 0 2px 8px rgba(26, 26, 25, 0.06)',
        'button': '0 4px 12px rgba(45, 90, 74, 0.2)',
      },
    },
  },
  plugins: [],
};

export default config;
