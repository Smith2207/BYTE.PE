import type { Config } from "tailwindcss";

// Los tokens de color (--primary, --accent, etc. en globals.css) guardan un
// oklch(...) completo, no los canales sueltos — por eso el patrón clásico de
// shadcn (`hsl(var(--x) / <alpha-value>)`) no sirve acá: generaría
// `oklch(oklch(...) / 0.5)`, inválido. Sintaxis de color relativo de CSS
// (`oklch(from <color> l c h / A)`) sí puede tomar ese oklch(...) completo y
// solo pisarle el alfa — así `bg-primary/40` genera CSS real en vez de
// desaparecer en silencio (bug documentado en el README, antes "parcheado"
// caso por caso en vez de arreglado en la raíz).
function conAlfa(variable: string) {
  return `oklch(from var(${variable}) l c h / <alpha-value>)`;
}

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: conAlfa('--background'),
  			foreground: conAlfa('--foreground'),
  			card: {
  				DEFAULT: conAlfa('--card'),
  				foreground: conAlfa('--card-foreground')
  			},
  			popover: {
  				DEFAULT: conAlfa('--popover'),
  				foreground: conAlfa('--popover-foreground')
  			},
  			primary: {
  				DEFAULT: conAlfa('--primary'),
  				foreground: conAlfa('--primary-foreground')
  			},
  			secondary: {
  				DEFAULT: conAlfa('--secondary'),
  				foreground: conAlfa('--secondary-foreground')
  			},
  			muted: {
  				DEFAULT: conAlfa('--muted'),
  				foreground: conAlfa('--muted-foreground')
  			},
  			accent: {
  				DEFAULT: conAlfa('--accent'),
  				foreground: conAlfa('--accent-foreground')
  			},
  			destructive: {
  				DEFAULT: conAlfa('--destructive'),
  				foreground: conAlfa('--destructive-foreground')
  			},
  			border: conAlfa('--border'),
  			input: conAlfa('--input'),
  			ring: conAlfa('--ring'),
  			chart: {
  				'1': conAlfa('--chart-1'),
  				'2': conAlfa('--chart-2'),
  				'3': conAlfa('--chart-3'),
  				'4': conAlfa('--chart-4'),
  				'5': conAlfa('--chart-5')
  			},
  			sidebar: {
  				DEFAULT: conAlfa('--sidebar'),
  				foreground: conAlfa('--sidebar-foreground'),
  				primary: conAlfa('--sidebar-primary'),
  				'primary-foreground': conAlfa('--sidebar-primary-foreground'),
  				accent: conAlfa('--sidebar-accent'),
  				'accent-foreground': conAlfa('--sidebar-accent-foreground'),
  				border: conAlfa('--sidebar-border'),
  				ring: conAlfa('--sidebar-ring')
  			}
  		},
  		fontFamily: {
  			sans: ['var(--font-sans)', 'sans-serif'],
  			display: ['var(--font-display)', 'sans-serif'],
  			heading: ['var(--font-heading)', 'sans-serif'],
  			mono: ['var(--font-mono)', 'monospace']
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
  			},
  			float: {
  				'0%, 100%': { transform: 'translateY(0px)' },
  				'50%': { transform: 'translateY(-16px)' }
  			},
  			'gradient-x': {
  				'0%, 100%': { backgroundPosition: '0% 50%' },
  				'50%': { backgroundPosition: '100% 50%' }
  			},
  			shimmer: {
  				'0%': { backgroundPosition: '-200% 0' },
  				'100%': { backgroundPosition: '200% 0' }
  			},
  			'pulse-glow': {
  				'0%, 100%': { opacity: '0.6' },
  				'50%': { opacity: '1' }
  			},
  			'float-up': {
  				'0%': { transform: 'translateY(0)', opacity: '0' },
  				'12%': { opacity: '0.8' },
  				'88%': { opacity: '0.8' },
  				'100%': { transform: 'translateY(-140px)', opacity: '0' }
  			},
  			'spin-slow': {
  				'0%': { transform: 'rotate(0deg)' },
  				'100%': { transform: 'rotate(360deg)' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			float: 'float 6s ease-in-out infinite',
  			'gradient-x': 'gradient-x 6s ease infinite',
  			shimmer: 'shimmer 3s linear infinite',
  			'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
  			'float-up': 'float-up linear infinite',
  			'spin-slow': 'spin-slow 50s linear infinite',
  			'spin-slow-reverse': 'spin-slow 70s linear infinite reverse'
  		},
  		backgroundSize: {
  			'300%': '300% 300%'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
