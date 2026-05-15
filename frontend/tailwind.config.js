/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F172A",
        muted: "#64748B",
        line: "#E2E8F0",
        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA"
        }
      },
      boxShadow: {
        glow: "0 24px 80px rgba(79, 70, 229, 0.22)",
        soft: "0 18px 60px rgba(15, 23, 42, 0.08)",
        card: "0 10px 30px rgba(15, 23, 42, 0.08)"
      },
      backgroundImage: {
        "app-radial": "radial-gradient(circle at top left, rgba(99,102,241,0.18), transparent 32%), radial-gradient(circle at top right, rgba(16,185,129,0.12), transparent 28%)"
      }
    }
  },
  plugins: []
};
