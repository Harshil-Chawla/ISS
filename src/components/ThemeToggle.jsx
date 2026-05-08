import React from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';

  return (
    <button className="theme-switch" onClick={onToggle} type="button">
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      {isDark ? 'Switch to Light' : 'Switch to Dark'}
    </button>
  );
}
