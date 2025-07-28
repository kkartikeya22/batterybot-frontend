/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  // ✅ Safelist dynamic utility classes used across components
  safelist: [
    "max-w-[160px]",
    "max-w-0",
    "translate-x-0",
    "-translate-x-2",
    "opacity-0",
    "opacity-100",
    "w-20",
    "w-64",
  ],

  theme: {
    extend: {
      // ✅ Fonts
      fontFamily: {
        sans: ["Nunito", "sans-serif"],     // 👈 makes Nunito the default for font-sans
        nunito: ["Nunito", "sans-serif"],
      }, colors: {
        batteryBlue: "#1E90FF",
        batteryTeal: "#00E0B8",
        batteryGreen: "#32CD32",
        batteryPurple: "#7D5FFF",
      },

      // ✅ Custom Keyframes
      keyframes: {
        scrollBackground: {
          "0%": { backgroundPosition: "-800px 0px" },
          "100%": { backgroundPosition: "800px 0px" },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        popupRise: {
          "0%": {
            transform: "translateY(100%) scale(0.9)",
            opacity: "0",
          },
          "100%": {
            transform: "translateY(0) scale(1)",
            opacity: "1",
          },
        },
        typing: {
          from: { width: "0" },
          to: { width: "100%" },
        },
        bounceDot: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },

      // ✅ Custom Animations
      animation: {
        "scroll-bg": "scrollBackground 5s linear infinite",
        fadeIn: "fadeIn 1s ease-in-out",
        popupRise: "popupRise 0.35s ease-out",
        typing: "typing 3s steps(40, end) infinite",
        bounceDot: "bounceDot 1.2s infinite ease-in-out",
      },
    },
  },

  plugins: [],
};
