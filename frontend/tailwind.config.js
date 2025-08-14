/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			
  			// Brand Colors
  			'airvik-black': '#020A18',
  			'airvik-midnight': '#10103C', 
  			'airvik-purple': '#4322AA',
  			'airvik-blue': '#133EE3',
  			'airvik-cyan': '#68D8FC',
  			'airvik-violet': '#B688FF',
  			'airvik-white': '#F8F9FE',
  			'airvik-white-pure': '#FFFFFF',
  			'airvik-bluehover': '#002bcd',
  			
  			// Brand Gray Scale
  			'gray-100': '#F8F9FE',
  			'gray-200': '#E6E8F7',
  			'gray-300': '#D6D6E1',
  			'gray-400': '#B0B8CF',
  			'gray-500': '#888FA3',
  			'gray-600': '#484F5E',
  			'gray-700': '#333747',
  			'gray-800': '#121624',
  			'gray-900': '#0A0F1A',
  			'gray-950': '#020A18',
  			
  			// Secondary Colors
  			'blue-mid': '#006CFF',
  			'blue-light': '#D1D8FA',
  			'cyan-light': '#B2ECFF',
  			'purple-light': '#C58FFF',
  			'pink-light': '#DECFFF',
  			
  			// Status Colors
  			'status-available': '#68D8FC',
  			'status-occupied': '#133EE3',
  			'status-maintenance': '#B688FF',
  			'status-unavailable': '#B12A2A',
  			
  			// Feedback Colors
  			'success': '#4E7638',
  			'warning': '#CB7B2B',
  			'error': '#B12A2A',
  			'info': '#D1D8FA',
  		},
  		
  		// Brand Gradients
  		backgroundImage: {
  			'gradient-dark-1': 'linear-gradient(135deg, #020A18 0%, #4322AA 100%)',
  			'gradient-dark-2': 'linear-gradient(135deg, #10103C 0%, #133EE3 100%)',
  			'gradient-mid': 'linear-gradient(135deg, #4322AA 0%, #68D8FC 100%)',
  			'gradient-light-1': 'linear-gradient(135deg, #B688FF 0%, #F8F9FE 100%)',
  			'gradient-light-2': 'linear-gradient(135deg, #D1D8FA 0%, #B2ECFF 100%)',
  			'gradient-light-3': 'linear-gradient(135deg, #133EE3 0%, #68D8FC 100%)',
  			
  			// Pattern overlay
  			'pattern': `radial-gradient(circle at 20% 80%, #133EE3 0%, transparent 50%),
  			            radial-gradient(circle at 80% 20%, #4322AA 0%, transparent 50%),
  			            radial-gradient(circle at 40% 40%, #68D8FC 0%, transparent 50%)`,
  		},
  		
  		// Typography
  		fontFamily: {
  			sans: [
  				'SF Pro Display',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'system-ui',
  				'sans-serif'
  			],
  			'sf-pro': [
  				'SF Pro Display',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'system-ui',
  				'sans-serif'
  			],
  			'primary': ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
  			'secondary': ['Inter', 'SF Pro Display', '-apple-system', 'sans-serif'],
  		},
  		
  		// Font sizes matching brand
  		fontSize: {
  			'hero': '72px',
  			'display': '60px',
  		},
  		
  		// Spacing system
  		spacing: {
  			'space-0': '0',
  			'space-1': '4px',
  			'space-2': '8px',
  			'space-3': '12px',
  			'space-4': '16px',
  			'space-5': '20px',
  			'space-6': '24px',
  			'space-8': '32px',
  			'space-10': '40px',
  			'space-12': '48px',
  			'space-16': '64px',
  			'space-20': '80px',
  			'space-24': '96px',
  		},
  		
  		// Border radius
  		borderRadius: {
  			'radius-none': '0',
  			'radius-xs': '4px',
  			'radius-sm': '6px',
  			'radius-md': '8px',
  			'radius-lg': '12px',
  			'radius-xl': '16px',
  			'radius-2xl': '24px',
  			'radius-full': '9999px',
  		},
  		
  		// Box shadows
  		boxShadow: {
  			'xs': '0 1px 2px 0 rgba(2, 10, 24, 0.05)',
  			'sm': '0 1px 3px 0 rgba(2, 10, 24, 0.1), 0 1px 2px 0 rgba(2, 10, 24, 0.06)',
  			'md': '0 4px 6px -1px rgba(2, 10, 24, 0.1), 0 2px 4px -1px rgba(2, 10, 24, 0.06)',
  			'lg': '0 10px 15px -3px rgba(2, 10, 24, 0.1), 0 4px 6px -2px rgba(2, 10, 24, 0.05)',
  			'xl': '0 20px 25px -5px rgba(2, 10, 24, 0.1), 0 10px 10px -5px rgba(2, 10, 24, 0.04)',
  			'2xl': '0 25px 50px -12px rgba(2, 10, 24, 0.25)',
  			
  			// Glow effects
  			'glow-primary': '0 0 20px rgba(67, 34, 170, 0.4)',
  			'glow-blue': '0 0 20px rgba(19, 62, 227, 0.4)',
  			'glow-cyan': '0 0 20px rgba(104, 216, 252, 0.4)',
  		},
  		
  		// Animation timing
  		transitionDuration: {
  			'instant': '0ms',
  			'fast': '150ms',
  			'normal': '250ms',
  			'slow': '350ms',
  			'slower': '500ms',
  		},
  		
  		// Animation easing
  		transitionTimingFunction: {
  			'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  			'out': 'cubic-bezier(0, 0, 0.2, 1)',
  			'in': 'cubic-bezier(0.4, 0, 1, 1)',
  			'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  		},
  		
  		// Custom animations
  		animation: {
  			'fade-in': 'fadeIn 250ms ease-out',
  			'slide-in-right': 'slideInRight 250ms ease-out',
  			'slide-in-left': 'slideInLeft 250ms ease-out',
  			'slide-in-up': 'slideInUp 250ms ease-out',
  			'modal-in': 'modalIn 250ms ease-out',
  			'spin': 'spin 1s linear infinite',
  			'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  		},
  		
  		// Keyframes
  		keyframes: {
  			fadeIn: {
  				'0%': { opacity: '0' },
  				'100%': { opacity: '1' },
  			},
  			slideInRight: {
  				'0%': { transform: 'translateX(100%)', opacity: '0' },
  				'100%': { transform: 'translateX(0)', opacity: '1' },
  			},
  			slideInLeft: {
  				'0%': { transform: 'translateX(-100%)', opacity: '0' },
  				'100%': { transform: 'translateX(0)', opacity: '1' },
  			},
  			slideInUp: {
  				'0%': { transform: 'translateY(100%)', opacity: '0' },
  				'100%': { transform: 'translateY(0)', opacity: '1' },
  			},
  			modalIn: {
  				'0%': { opacity: '0', transform: 'scale(0.95) translateY(10px)' },
  				'100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
  			},
  		},
  	}
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};