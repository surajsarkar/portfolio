
import React from 'react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const hasImage = !!project.imageUrl;

  return (
    <div className={`min-w-[85vw] md:min-w-[450px] flex-none snap-center group relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-surface-dark border border-border-dark transition-all duration-300 hover:border-primary/30 ${hasImage ? 'p-0' : 'p-8'}`}>
      {hasImage && (
        <div 
          className="h-40 w-full bg-cover bg-center opacity-60 group-hover:opacity-80 transition-opacity relative" 
          style={{ backgroundImage: `url('${project.imageUrl}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-surface-dark to-transparent"></div>
        </div>
      )}
      
      <div className={`${hasImage ? 'px-8 pb-8 pt-2' : ''} h-full flex flex-col`}>
        <div className="mb-auto">
          <div className="flex justify-between items-start mb-6">
            {!hasImage && (
              <div className="rounded-full bg-border-dark p-3 text-white group-hover:bg-primary group-hover:text-background-dark transition-colors shadow-lg">
                <span className="material-symbols-outlined">{project.icon}</span>
              </div>
            )}
            <a className="text-gray-500 hover:text-white transition-colors ml-auto" href={project.link}>
              <span className="material-symbols-outlined">open_in_new</span>
            </a>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            {project.description}
          </p>
          {project.caseStudyLink && (
            <a className="inline-flex items-center text-primary text-sm font-bold hover:underline mb-4" href={project.caseStudyLink}>
              Read Case Study
            </a>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-auto">
          {project.tags.map((tag) => (
            <span key={tag} className="px-3 py-1 rounded-full bg-border-dark/50 text-xs font-mono text-primary border border-primary/20">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
