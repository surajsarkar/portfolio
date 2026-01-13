import React from 'react';
import DobbyFace from './DobbyFace';

const Header: React.FC = () => {
  // Trigger excited expression when hovering over Projects
  const handleProjectsMouseEnter = () => {
    window.dispatchEvent(new CustomEvent('dobby-show-excited'));
  };

  const handleProjectsMouseLeave = () => {
    window.dispatchEvent(new CustomEvent('dobby-hide-excited'));
  };

  // Trigger love expression when hovering over Contact
  const handleContactMouseEnter = () => {
    window.dispatchEvent(new CustomEvent('dobby-show-love'));
  };

  const handleContactMouseLeave = () => {
    window.dispatchEvent(new CustomEvent('dobby-hide-love'));
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4">
      <nav className="flex items-center gap-6 rounded-full bg-surface-dark/90 backdrop-blur-md border border-border-dark px-6 py-2 shadow-xl">
        <a
          className="text-sm font-semibold text-gray-300 hover:text-primary transition-colors uppercase tracking-wider"
          href="#projects"
          onMouseEnter={handleProjectsMouseEnter}
          onMouseLeave={handleProjectsMouseLeave}
        >
          Projects
        </a>
        <DobbyFace />
        <a
          className="text-sm font-semibold text-gray-300 hover:text-primary transition-colors uppercase tracking-wider"
          href="#contact"
          onMouseEnter={handleContactMouseEnter}
          onMouseLeave={handleContactMouseLeave}
        >
          Contact
        </a>
      </nav>
    </header>
  );
};

export default Header;
