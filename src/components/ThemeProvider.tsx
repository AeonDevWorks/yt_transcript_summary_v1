import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem('yt-transcriber-theme') as ThemeType | null;
    return savedTheme || 'system';
  });

  const detectYouTubeTheme = useCallback((): 'light' | 'dark' => {
    const isDarkAttribute = document.documentElement.getAttribute('dark') === 'true';
    const isDarkClass = document.body.classList.contains('dark');
    const isDarkStyles = window.getComputedStyle(document.body).getPropertyValue('--yt-spec-base-background') === '#0f0f0f';
    const darkModeMetaTag = document.querySelector('meta[name="theme-color"][content="#0f0f0f"]');
    const isDarkMeta = darkModeMetaTag !== null;

    const isDark = isDarkAttribute || isDarkClass || isDarkStyles || isDarkMeta;
    
    const detectedTheme = isDark ? 'dark' : 'light';
    console.log('Detected YouTube theme:', detectedTheme, {
      isDarkAttribute,
      isDarkClass,
      isDarkStyles,
      isDarkMeta
    });
    return detectedTheme;
  }, []);

  const applyTheme = useCallback((newTheme: ThemeType) => {
    setTheme(newTheme);
    if (newTheme !== 'system') {
      localStorage.setItem('yt-transcriber-theme', newTheme);
    } else {
      localStorage.removeItem('yt-transcriber-theme');
    }
    
    console.log('Applied theme:', newTheme);

    // Apply the 'dark' class to the document element
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    const actualTheme = theme === 'system' ? detectYouTubeTheme() : theme;
    console.log('Current theme:', actualTheme);
    
    // Apply Tailwind classes on mount and theme change
    const root = document.documentElement;
    root.classList.remove('yt-transcriber-light', 'yt-transcriber-dark');
    root.classList.add(`yt-transcriber-${actualTheme}`);
  }, [theme, detectYouTubeTheme]);

  const toggleTheme = useCallback(() => {
    const currentTheme = theme === 'system' ? detectYouTubeTheme() : theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    console.log('Manually toggled theme from', currentTheme, 'to', newTheme);
  }, [theme, detectYouTubeTheme, applyTheme]);

  const actualTheme = theme === 'system' ? detectYouTubeTheme() : theme;

  return (
    <ThemeContext.Provider value={{ theme: actualTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};