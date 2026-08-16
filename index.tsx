
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { theme, ACTIVE_THEME } from './theme';

// Inject theme CSS variables into document
const injectThemeStyles = () => {
  const style = document.createElement('style');
  style.id = 'theme-variables';
  style.textContent = `
    :root {
      --primary: ${theme.primary};
      --cream: ${theme.cream};
      --cream-muted: ${theme.creamMuted};
      --background-light: ${theme.backgroundLight};
      --background-dark: ${theme.backgroundDark};
      --surface-dark: ${theme.surfaceDark};
      --border-dark: ${theme.borderDark};
      --skills-bg: ${theme.skillsBg};
    }
    
    /* Update scrollbar to match theme */
    ::-webkit-scrollbar-track {
      background: ${theme.scrollbarTrack};
    }
    ::-webkit-scrollbar-thumb {
      background: ${theme.scrollbarThumb};
    }
    * {
      scrollbar-color: ${theme.scrollbarThumb} ${theme.scrollbarTrack};
    }
    
    /* Override body background */
    body {
      background-color: ${theme.backgroundDark} !important;
    }
  `;
  document.head.appendChild(style);

  // Update Tailwind config dynamically
  if ((window as any).tailwind?.config?.theme?.extend?.colors) {
    (window as any).tailwind.config.theme.extend.colors = {
      ...((window as any).tailwind.config.theme.extend.colors || {}),
      primary: theme.primary,
      cream: theme.cream,
      'cream-muted': theme.creamMuted,
      ink: theme.backgroundDark,
      'background-light': theme.backgroundLight,
      'background-dark': theme.backgroundDark,
      'surface-dark': theme.surfaceDark,
      'border-dark': theme.borderDark,
    };
  }

  console.log(`🎨 Theme loaded: ${ACTIVE_THEME}`);
};

// Inject theme before React renders
injectThemeStyles();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
