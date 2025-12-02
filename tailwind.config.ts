import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                matrix: {
                    green: {
                        primary: '#00ff41',
                        light: '#39ff14',
                        dark: '#00cc33',
                        glow: 'rgba(0, 255, 65, 0.5)',
                        subtle: 'rgba(0, 255, 65, 0.1)',
                    },
                    black: {
                        pure: '#000000',
                        dark: '#0a0a0a',
                        darker: '#050505',
                    },
                },
            },
            fontFamily: {
                sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Courier New', 'monospace'],
            },
            animation: {
                'glow-pulse': 'glowPulse 2s ease-in-out infinite',
                'fade-in-up': 'fadeInUp 0.6s ease-out',
                'matrix-scan': 'matrixScan 20s linear infinite',
            },
            keyframes: {
                glowPulse: {
                    '0%, 100%': { textShadow: '0 0 10px rgba(0, 255, 65, 0.5)' },
                    '50%': { textShadow: '0 0 20px rgba(0, 255, 65, 0.5), 0 0 30px rgba(0, 255, 65, 0.5)' },
                },
                fadeInUp: {
                    from: { opacity: '0', transform: 'translateY(30px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                matrixScan: {
                    '0%': { backgroundPosition: '0 0' },
                    '100%': { backgroundPosition: '50px 50px' },
                },
            },
            backgroundImage: {
                'gradient-matrix': 'linear-gradient(135deg, #00cc33, #00ff41)',
            },
        },
    },
    plugins: [],
};

export default config;
