
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-24 border-t border-border-dark">
      <div className="pt-16 pb-8 px-4 text-center">
        <h1 className="font-display font-black text-[10vw] md:text-[12vw] leading-none tracking-tighter text-border-dark opacity-50 uppercase select-none hover:text-primary transition-colors duration-700">
          Suraj Sarkar
        </h1>
        <div className="flex flex-col md:flex-row justify-between items-center mt-8 gap-4 text-xs font-mono text-gray-500 uppercase tracking-widest max-w-7xl mx-auto">
          <p>© {new Date().getFullYear()} Suraj Sarkar</p>
          <p>Built with Tailwind CSS & React</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
