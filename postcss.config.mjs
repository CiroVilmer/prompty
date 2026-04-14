/** @type {import('postcss').Config} */
const config = {
  plugins: {
    // postcss-import MUST run before @tailwindcss/postcss so bare package
    // @import specifiers (e.g. "tw-animate-css") are resolved via standard
    // Node resolution before Tailwind's strict style-condition resolver runs.
    "postcss-import": {},
    "@tailwindcss/postcss": {},
  },
};

export default config;
