module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",     // ← חובה אם אתה עובד עם Next.js App Router
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}"     // ← רלוונטי לפרויקטים ישנים
  ],
  theme: {
    extend: {}
  },
  plugins: []
};
