/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/frontend/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#14162B", // fundo — céu noturno, não o preto genérico
          surface: "#1B1E3D",
          raised: "#232752",
          line: "#31356B",
        },
        paper: {
          DEFAULT: "#F3F1FA",
          dim: "#A6A2CC",
          faint: "#6E6B99",
        },
        spark: {
          DEFAULT: "#F2B84B", // faísca — a pergunta, o momento "espera... como assim?"
          dim: "#8A6A2E",
        },
        bloom: {
          DEFAULT: "#6FCF97", // descoberta / conexão feita
        },
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        body: ["Work Sans", "system-ui", "sans-serif"],
      },
      maxWidth: {
        prose: "38rem",
      },
    },
  },
  plugins: [],
};
