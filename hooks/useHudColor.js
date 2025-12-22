import { useEffect } from 'react';

const useHudColor = () => {
  useEffect(() => {
    // Load saved color from localStorage on mount
    const savedSettings = localStorage.getItem('USER_SETTINGS');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.hud_colour) {
          document.documentElement.style.setProperty('--hud-color', settings.hud_colour);
        } else {
          // Set default if not found
          document.documentElement.style.setProperty('--hud-color', '#00ff41');
        }
      } catch (e) {
        console.error('Error loading HUD color:', e);
        document.documentElement.style.setProperty('--hud-color', '#00ff41');
      }
    } else {
      // Set default if no settings found
      document.documentElement.style.setProperty('--hud-color', '#00ff41');
    }
  }, []);
};

export default useHudColor;
