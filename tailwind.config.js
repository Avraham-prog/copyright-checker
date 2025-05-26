module.exports = {
content: [
  './app/**/*.{js,ts,jsx,tsx,mdx}', // שימו לב לתיקיית `app`
  './pages/**/*.{js,ts,jsx,tsx,mdx}',
  './components/**/*.{js,ts,jsx,tsx,mdx}',
  // אם קיים src
  './src/**/*.{js,ts,jsx,tsx,mdx}',
],
  theme: {
    extend: {}
  },
  plugins: []
};
