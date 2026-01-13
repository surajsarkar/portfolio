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
    // Deep space black with cool blue undertones
    'space-black': {
        primary: '#53d22d',
        backgroundLight: '#f6f8f6',
        backgroundDark: '#050508',
        surfaceDark: '#0a0a0f',
        borderDark: '#1a1a25',
        skillsBg: '#08080d',
        scrollbarTrack: 'rgba(10, 10, 15, 0.5)',
        scrollbarThumb: 'rgba(26, 26, 37, 0.8)',
    },

    // Original green-tinted dark theme
    'forest-dark': {
        primary: '#53d22d',
        backgroundLight: '#f6f8f6',
        backgroundDark: '#131712',
        surfaceDark: '#1c211b',
        borderDark: '#2d372a',
        skillsBg: '#161b15',
        scrollbarTrack: 'rgba(28, 33, 27, 0.5)',
        scrollbarThumb: 'rgba(45, 55, 42, 0.8)',
    },

    // Deep midnight blue theme
    'midnight-blue': {
        primary: '#3b82f6',
        backgroundLight: '#f0f4ff',
        backgroundDark: '#0a0a12',
        surfaceDark: '#0f0f1a',
        borderDark: '#1e1e3a',
        skillsBg: '#0c0c18',
        scrollbarTrack: 'rgba(10, 10, 18, 0.5)',
        scrollbarThumb: 'rgba(30, 30, 58, 0.8)',
    },
} as const;

// Get the active theme colors
export const theme = themes[ACTIVE_THEME];

// Export individual colors for convenience
export const {
    primary,
    backgroundLight,
    backgroundDark,
    surfaceDark,
    borderDark,
    skillsBg,
    scrollbarTrack,
    scrollbarThumb,
} = theme;
