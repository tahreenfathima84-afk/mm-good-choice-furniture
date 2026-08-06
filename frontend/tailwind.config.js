/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        sand: '#F7F5F0',
        cream: '#F9F8F6',
        stone: '#E3DECF',
        matcha: '#E8E9E1',
        ink: '#2D2622',
        inksoft: '#5C524A',
        mutedwarm: '#8A8077',
        gold: '#D4AF37',
        copper: '#B87333',
        olive: '#6B705C',
        royal: '#1D3557',
        sky: '#A8DADC',
        espresso: '#3B2F2F'
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
        btn: ['Inter', 'sans-serif']
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'hero-zoom': { from: { transform: 'scale(1)' }, to: { transform: 'scale(1.1)' } },
        'float-slow': { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-24px)' } },
        'float-slower': { '0%,100%': { transform: 'translateY(0px) translateX(0px)' }, '50%': { transform: 'translateY(-40px) translateX(14px)' } },
        'shimmer': { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'pulse-soft': { '0%,100%': { opacity: '0.5' }, '50%': { opacity: '1' } }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'hero-zoom': 'hero-zoom 14s ease-out forwards',
        'float-slow': 'float-slow 7s ease-in-out infinite',
        'float-slower': 'float-slower 11s ease-in-out infinite',
        'shimmer': 'shimmer 3.5s linear infinite',
        'pulse-soft': 'pulse-soft 4s ease-in-out infinite'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
};
