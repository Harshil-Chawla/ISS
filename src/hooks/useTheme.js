import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useLocalStorage } from './useLocalStorage';

export function useTheme() {
  const [theme, setTheme] = useLocalStorage('mission-dashboard-theme', 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      toast.success(`${next === 'dark' ? 'Dark' : 'Light'} mode enabled`);
      return next;
    });
  };

  return { theme, toggleTheme };
}
