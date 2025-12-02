import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ===========================
      // 🎨 Colores corporativos
      // ===========================
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        secondary: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
          950: "#083344",
        },
        accent: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
          950: "#3b0764",
        },
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        danger: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },
      },

      // ===========================
      // 🔤 Tipografías
      // ===========================
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },

      // ===========================
      // 🔠 Tamaños de fuente extra
      // ===========================
      fontSize: {
        "2xs": "0.625rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
        "5xl": "3rem",
        "6xl": "3.75rem",
        "7xl": "4.5rem",
        "8xl": "6rem",
        "9xl": "8rem",
      },

      // ===========================
      // 📏 Spacing extra
      // ===========================
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "100": "25rem",
        "112": "28rem",
        "128": "32rem",
      },

      // ===========================
      // ⭕ Radius premium
      // ===========================
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },

      // ===========================
      // 🌫 Blur / Backdrop blur
      // ===========================
      blur: {
        xs: "2px",
      },
      backdropBlur: {
        xs: "2px",
        "3xl": "64px",
      },

      // ===========================
      // 🌀 Sombras premium / glow
      // ===========================
      boxShadow: {
        premium: "0 20px 60px -15px rgba(37, 99, 235, 0.3)",
        "premium-lg": "0 25px 80px -20px rgba(37, 99, 235, 0.4)",
        "premium-xl": "0 35px 100px -25px rgba(37, 99, 235, 0.5)",
        "inner-premium": "inset 0 2px 10px 0 rgba(37, 99, 235, 0.1)",
        glow: "0 0 20px rgba(37, 99, 235, 0.5)",
        "glow-lg": "0 0 40px rgba(37, 99, 235, 0.6)",

        // extras suaves / de refuerzo visual
        "glow-sm": "0 0 10px rgba(59, 130, 246, 0.3)",
        "glow-md": "0 0 20px rgba(59, 130, 246, 0.4)",
        // renombrada para no chocar con glow-lg existente
        "glow-lg-soft": "0 0 30px rgba(59, 130, 246, 0.5)",
        "glow-purple": "0 0 20px rgba(168, 85, 247, 0.4)",
        "glow-green": "0 0 20px rgba(34, 197, 94, 0.4)",
        "glow-red": "0 0 20px rgba(239, 68, 68, 0.4)",
      },

      // ===========================
      // 🖼 Fondos / Gradients
      // ===========================
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-premium":
          "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)",
        "gradient-premium-reverse":
          "linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)",
        "gradient-accent":
          "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
        "gradient-success":
          "linear-gradient(135deg, #22c55e 0%, #10b981 100%)",
        "gradient-dark":
          "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
      },

      // ===========================
      // ⏱ Duraciones transición
      // ===========================
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
        "900": "900ms",
      },

      // ===========================
      // ⏩ Curvas easing custom
      // ===========================
      transitionTimingFunction: {
        "bounce-in": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },

      // ===========================
      // 🔝 z-index altos
      // ===========================
      zIndex: {
        "60": "60",
        "70": "70",
        "80": "80",
        "90": "90",
        "100": "100",
      },

      // ===========================
      // 🎞 Keyframes
      // ===========================
      keyframes: {
        // Primera tanda (premium UI)
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseGlow: {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(37, 99, 235, 0.4)",
          },
          "50%": {
            boxShadow: "0 0 40px rgba(37, 99, 235, 0.8)",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },

        // Segunda tanda (skeletons, modales, etc.)
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "slide-in-from-top": {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-from-bottom": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "zoom-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },

      // ===========================
      // 🎬 Animaciones utilitarias
      // ===========================
      animation: {
        // pack premium
        "fade-in": "fadeIn 0.5s ease-in-out",
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "fade-in-down": "fadeInDown 0.6s ease-out",
        "slide-in-right": "slideInRight 0.6s ease-out",
        "slide-in-left": "slideInLeft 0.6s ease-out",
        "scale-in": "scaleIn 0.5s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        "bounce-slow": "bounce 3s infinite",
        "gradient-shift": "gradientShift 5s ease infinite",

        // pack UI skeleton / modal
        shimmer: "shimmer 2s infinite",
        "slide-in-from-top": "slide-in-from-top 0.3s ease-out",
        "slide-in-from-bottom": "slide-in-from-bottom 0.3s ease-out",
        "zoom-in": "zoom-in 0.3s ease-out",
        "pulse-soft": "pulse-soft 2s infinite",
      },
    },
  },

  // ===========================
  // 🔌 Plugins oficiales
  // ===========================
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
};

export default config;
