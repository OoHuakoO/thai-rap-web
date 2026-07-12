import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		fontFamily: {
  			sans: [
  				'var(--font-inter)',
  				'var(--font-sarabun)',
  				'sans-serif'
  			],
  			thai: [
  				'var(--font-sarabun)',
  				'sans-serif'
  			]
  		},
  		colors: {
  			orange: 'rgb(var(--color-orange) / <alpha-value>)',
  			'orange-light': 'rgb(var(--color-orange-light) / <alpha-value>)',
  			'orange-dark': 'rgb(var(--color-orange-dark) / <alpha-value>)',
  			cream: 'rgb(var(--color-cream) / <alpha-value>)',
  			'cream-soft': 'rgb(var(--color-cream-soft) / <alpha-value>)',
  			'cream-light': 'rgb(var(--color-cream-light) / <alpha-value>)',
  			charcoal: 'rgb(var(--color-charcoal) / <alpha-value>)',
  			white: 'rgb(var(--color-white) / <alpha-value>)',
  			purple: 'rgb(var(--color-purple) / <alpha-value>)',
  			'purple-banner': 'rgb(var(--color-purple-banner) / <alpha-value>)',
  			'dark-nav': 'rgb(var(--color-dark-nav) / <alpha-value>)',
  			'text-main': 'rgb(var(--color-text-main) / <alpha-value>)',
  			'score-green': 'rgb(var(--color-score-green) / <alpha-value>)',
  			'score-red': 'rgb(var(--color-score-red) / <alpha-value>)',
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
