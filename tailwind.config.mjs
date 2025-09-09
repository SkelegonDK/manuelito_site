/** @type {import('tailwindcss').Config} */

export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        
        // New brand colors from style-guide.md
        nintendbro: "#CC252C",    // Primary accent - Nintendo red
        jabro: "#FFFD74",         // Light theme background - bright yellow
        brony: "#614051",         // Subtext color - muted purple
        bluey: "#96C7F2",         // Secondary accent - sky blue (same as pblue)
        liquirice: "#303030",     // Dark theme background - deep charcoal
        
        
        white: {
          DEFAULT: "#F2F2F2",
        },
      },
      fontFamily: {
        mono: ["Alexandria", "monospace"],
        sans: ["Alexandria", "sans-serif"],
      },
      maxWidth: {
        "1/12": "8.333333%",
        "2/12": "16.666667%",
        "3/12": "25%",
        "4/12": "33.333333%",
        "5/12": "41.666667%",
        "6/12": "50%",
        "7/12": "58.333333%",
        "8/12": "66.666667%",
        "9/12": "75%",
        "10/12": "83.333333%",
        "10/12": "91.666667%",
        "12/12": "100%",
      },
      margin: {
        30: "7.3rem",
      },
      borderWidth: {
        1: "1px",
        3: "3px",
      },
      borderColor: {
        black: "#000",
        blackRad: "rgba(0,0,0,0.8)",
        whiteRad: "rgba(242, 242, 242, 0.8)",
      },
      typography: ({ theme }) => ({
        // Use this if you want the same spacing for all `.prose`
        DEFAULT: {
          css: {
            'h2, h3, h4': {
              marginTop: theme('spacing.8'),
              marginBottom: theme('spacing.4'),
            },
            p: {
              marginTop: theme('spacing.2'),
              marginBottom: theme('spacing.2'),
            },
            'h2 + p, h3 + p, h4 + p': {
              marginTop: theme('spacing.2'),
            },
            'p + h2, p + h3, p + h4': {
              marginTop: theme('spacing.8'),
            },
            'ul, ol': {
              marginTop: theme('spacing.2'),
              marginBottom: theme('spacing.2'),
            },
            blockquote: {
              marginTop: theme('spacing.4'),
              marginBottom: theme('spacing.4'),
            },
          },
        },

        // Or define a blog-only variant:
        blog: {
          css: {
            'h2, h3, h4': {
              marginTop: theme('spacing.8'),
              marginBottom: theme('spacing.4'),
            },
            p: {
              marginTop: theme('spacing.2'),
              marginBottom: theme('spacing.2'),
            },
            'h2 + p, h3 + p, h4 + p': { marginTop: theme('spacing.2') },
            'p + h2, p + h3, p + h4': { marginTop: theme('spacing.8') },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
