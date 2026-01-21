
import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Skills from './components/Skills';
import ProjectsScroll from './components/ProjectsScroll';
import EventHorizon from './components/EventHorizon';

const App: React.FC = () => {
  return (
    <div className="relative flex min-h-screen flex-col selection:bg-primary selection:text-background-dark">
      <Header />
      <main className="flex-grow">
        <Hero />
        <ProjectsScroll />
        <Skills />
        <EventHorizon />
      </main>
    </div>
  );
};

export default App;
