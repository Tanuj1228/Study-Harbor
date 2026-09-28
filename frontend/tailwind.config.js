/** @type {import('tailwindcss').Config} */
export default {
  // CRITICAL: Tells Tailwind which files to scan for class names
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // You can add custom colors, fonts, spacing, etc., here.
      // Example: Adding a custom color palette
      colors: {
        'indigo-portal': '#4f46e5',
        'red-holiday': '#ef4444',
      }
    },
  },
  plugins: [],
}