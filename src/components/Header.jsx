import React from 'react';
import ThemeToggle from './ThemeToggle';

export default function Header({ theme, onToggleTheme }) {
  return (
    <header className="app-header">
      <div className="brand">
        <div>
          <p className="eyebrow">Mission Control Dashboard</p>
          <h1>Real-Time ISS and News Intelligence</h1>
        </div>
      </div>
      <div className="header-actions">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  );
}
