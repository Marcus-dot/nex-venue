/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Background colors
        background: {
          DEFAULT: "#D8D9D4", // Light mode background
          dark: "#161616"     // Dark mode background
        },

        // Accent color (same for both modes)
        accent: "#ff4306",

        // Card/Surface colors
        surface: {
          DEFAULT: "#ffffff",    // Light mode cards/surfaces
          secondary: "#f3f4f6",  // Light mode secondary surfaces
          dark: "#374151",       // Dark mode cards/surfaces
          "dark-secondary": "#1f2937" // Dark mode secondary surfaces
        },

        // Text colors
        text: {
          DEFAULT: "#1f2937",    // Light mode primary text
          secondary: "#6b7280",  // Light mode secondary text
          dark: "#ffffff",       // Dark mode primary text
          "dark-secondary": "#d1d5db" // Dark mode secondary text
        },

        // Border colors
        border: {
          DEFAULT: "#e5e7eb",    // Light mode borders
          dark: "#374151"        // Dark mode borders
        },

        // Input/Form colors
        input: {
          DEFAULT: "#f9fafb",    // Light mode input background
          border: "#d1d5db",     // Light mode input border
          dark: "#374151",       // Dark mode input background
          "border-dark": "#6b7280" // Dark mode input border
        },

        // Status colors (same for both modes)
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#3b82f6",

        // Gray scale adjustments for better contrast
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          850: "#1a202c", // Custom shade between 800 and 900
          900: "#111827",
          950: "#030712"
        }
      },
      fontFamily: {
        "rubik": ["Rubik-Regular", "sans-serif"],
        "rubik-bold": ["Rubik-Bold", "sans-serif"],
        "rubik-extrabold": ["Rubik-ExtraBold", "sans-serif"],
        "rubik-medium": ["Rubik-Medium", "sans-serif"],
        "rubik-semibold": ["Rubik-SemiBold", "sans-serif"],
        "rubik-light": ["Rubik-Light", "sans-serif"],
      },
      // Additional utilities for theme switching
      animation: {
        'theme-transition': 'theme-fade 200ms ease-in-out',
      },
      keyframes: {
        'theme-fade': {
          '0%': { opacity: '0.8' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}