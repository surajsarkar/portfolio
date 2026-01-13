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
      <nav
        className="relative flex items-center gap-6 rounded-full px-6 py-2.5 shadow-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.02) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 40px rgba(83, 210, 45, 0.05)'
        }}
      >
        {/* Glass shine effect */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.08) 45%, rgba(255, 255, 255, 0.12) 50%, rgba(255, 255, 255, 0.08) 55%, transparent 60%)',
          }}
        />
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
