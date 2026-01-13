
import React from 'react';
import { TECHNOLOGIES } from '../constants';
import ScrollReveal from './ScrollReveal';

const Skills: React.FC = () => {
  return (
    <section className="py-12 px-4 border-y border-border-dark" style={{ backgroundColor: 'var(--skills-bg)' }}>
      <div className="mx-auto max-w-5xl">
        <ScrollReveal>
          <p className="text-center text-xs font-mono uppercase tracking-widest text-gray-500 mb-8">Core Technologies</p>
        </ScrollReveal>
        <div className="flex flex-wrap justify-center gap-4">
          {TECHNOLOGIES.map((tech, index) => (
            <ScrollReveal key={tech.name} delay={index * 50} direction="up" distance={30}>
              <div
                className="group flex items-center gap-3 rounded-full bg-surface-dark border border-border-dark px-5 py-3 transition-all hover:border-primary/50 hover:bg-surface-dark/80 cursor-default"
              >
                <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">{tech.icon}</span>
                <span className="text-sm font-medium text-gray-200">{tech.name}</span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
