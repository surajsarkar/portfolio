
import React from 'react';
import ProjectCard from './ProjectCard';
import { PROJECTS } from '../constants';

const Projects: React.FC = () => {
  return (
    <section className="py-24 px-4 overflow-hidden" id="projects">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 max-w-5xl mx-auto">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Selected Projects</h2>
            <p className="text-gray-400 max-w-md">Highlighting work in NLP, high-throughput systems, and automation.</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-500 text-xs font-mono hidden md:block">SCROLL TO EXPLORE →</span>
            <a className="text-primary hover:text-white transition-colors text-sm font-bold flex items-center gap-1" href="#">
              View all repositories <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </a>
          </div>
        </div>
        <div className="relative w-full overflow-hidden">
          <div className="flex gap-6 overflow-x-auto pb-12 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {PROJECTS.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
