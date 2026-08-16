import React, { useEffect, useState } from 'react';
import DobbyFace from './DobbyFace';

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleProjectsMouseEnter = () => {
    window.dispatchEvent(new CustomEvent('dobby-show-excited'));
  };
  const handleProjectsMouseLeave = () => {
    window.dispatchEvent(new CustomEvent('dobby-hide-excited'));
  };
  const handleContactMouseEnter = () => {
    window.dispatchEvent(new CustomEvent('dobby-show-love'));
  };
  const handleContactMouseLeave = () => {
    window.dispatchEvent(new CustomEvent('dobby-hide-love'));
  };

  const linkClass =
    'pressable rounded-full px-3 py-2 text-sm font-medium tracking-wide text-cream/70 hover:text-cream';

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex justify-center px-4 pt-5 md:pt-6">
      <nav
        className={`nav-glass relative flex max-h-16 items-center gap-5 overflow-hidden rounded-full px-5 py-2 md:gap-6 md:px-6 ${
          scrolled ? 'shadow-[0_12px_40px_rgba(12,12,11,0.55)]' : ''
        }`}
        style={{
          transition: 'box-shadow 280ms var(--ease-soft), background 280ms var(--ease-soft)',
        }}
        aria-label="Primary"
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              'linear-gradient(105deg, transparent 40%, rgba(235,230,220,0.06) 48%, rgba(235,230,220,0.1) 50%, rgba(235,230,220,0.06) 52%, transparent 60%)',
          }}
          aria-hidden="true"
        />

        <a
          className={linkClass}
          href="#projects"
          onMouseEnter={handleProjectsMouseEnter}
          onMouseLeave={handleProjectsMouseLeave}
        >
          Projects
        </a>

        <DobbyFace />

        <a
          className={linkClass}
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
