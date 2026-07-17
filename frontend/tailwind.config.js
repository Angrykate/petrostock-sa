/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
    "./context/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#14325A",
          50: "#EAF1FB",
          100: "#D5E3F4",
          200: "#A8C4E4",
          300: "#7AA4D0",
          400: "#4F85B8",
          500: "#2F6799",
          600: "#1E4F7A",
          700: "#14325A",
          800: "#0F2744",
          900: "#0A1B30",
        },
        ink: {
          DEFAULT: "#1A2332",
          soft: "#3D4A5C",
          muted: "#5B6B7C",
          faint: "#8A97A8",
        },
        canvas: {
          DEFAULT: "#F1F4F8",
          card: "#FFFFFF",
          tint: "#E8EEF5",
        },
        line: {
          DEFAULT: "#D8DEE8",
          strong: "#B8C2D1",
        },
        accent: {
          DEFAULT: "#B8952F",
          soft: "#F7F0DB",
        },
        success: {
          DEFAULT: "#1E8E5A",
          soft: "#E6F5EE",
        },
        warning: {
          DEFAULT: "#C9841A",
          soft: "#FBF0DC",
        },
        danger: {
          DEFAULT: "#C63B3B",
          soft: "#FBEAEA",
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 2px rgba(20, 50, 90, 0.04), 0 1px 3px rgba(20, 50, 90, 0.06)",
        raised: "0 4px 16px rgba(20, 50, 90, 0.08)",
      },
      maxWidth: {
        shell: "1440px",
      },
    },
  },
  plugins: [],
};
