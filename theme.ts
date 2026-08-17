// Theme Configuration File
// Switch between themes by changing ACTIVE_THEME below

export type ThemeName = 'space-black' | 'forest-dark' | 'midnight-blue';

// ========================================
// 🎨 CHANGE THIS TO SWITCH THEMES
// ========================================
export const ACTIVE_THEME: ThemeName = 'space-black';

// ========================================
// Theme Definitions
// ========================================

export const themes = {
    // Warm off-black with cream type and a quiet sage accent
    'space-black': {
        primary: '#7d9a68',
        cream: '#ebe6dc',
        creamMuted: '#9a9488',
        backgroundLight: '#f4f1ea',
        backgroundDark: '#0c0c0b',
        surfaceDark: '#141412',
        borderDark: '#2a2924',
        skillsBg: '#0c0c0b',
        scrollbarTrack: 'rgba(12, 12, 11, 0.5)',
        scrollbarThumb: 'rgba(42, 41, 36, 0.85)',
    },

    // Green-tinted dark, same cream type
    'forest-dark': {
        primary: '#7d9a68',
        cream: '#ebe6dc',
        creamMuted: '#9a9488',
        backgroundLight: '#f4f1ea',
        backgroundDark: '#121410',
        surfaceDark: '#1a1c18',
        borderDark: '#2c3028',
        skillsBg: '#121410',
        scrollbarTrack: 'rgba(18, 20, 16, 0.5)',
        scrollbarThumb: 'rgba(44, 48, 40, 0.85)',
    },

    // Cooler night, same cream type
    'midnight-blue': {
        primary: '#7d9a68',
        cream: '#ebe6dc',
        creamMuted: '#9a9488',
        backgroundLight: '#f0f4ff',
        backgroundDark: '#0b0c10',
        surfaceDark: '#12141a',
        borderDark: '#262830',
        skillsBg: '#0b0c10',
        scrollbarTrack: 'rgba(11, 12, 16, 0.5)',
        scrollbarThumb: 'rgba(38, 40, 48, 0.85)',
    },
} as const;

// Get the active theme colors
export const theme = themes[ACTIVE_THEME];

// Export individual colors for convenience
export const {
    primary,
    cream,
    creamMuted,
    backgroundLight,
    backgroundDark,
    surfaceDark,
    borderDark,
    skillsBg,
    scrollbarTrack,
    scrollbarThumb,
} = theme;
