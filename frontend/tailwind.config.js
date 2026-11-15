/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: '#FFFFFF',
        subtle: '#FAFAFA',
        hover: '#F5F5F5',
        border: '#E5E5E5',
        primary: '#171717',
        secondary: '#666666',
        success: {
          DEFAULT: '#15803D',
          light: '#F0FDF4',
          border: '#BBF7D0',
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#FEF2F2',
          border: '#FECACA',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif'
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'monospace'
        ]
      },
      borderRadius: {
        DEFAULT: '6px',
        md: '6px',
        lg: '8px',
      }
    },
  },
  plugins: [],
}
