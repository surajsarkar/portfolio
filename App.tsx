import React, { Suspense, lazy } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Skills from './components/Skills';
import ProjectsScroll from './components/ProjectsScroll';
import EventHorizon from './components/EventHorizon';
import useConsoleEasterEgg from './components/useConsoleEasterEgg';

// Single WebGL cosmos layer — code-split so first paint stays light
const CosmicBackground = lazy(() => import('./components/CosmicBackground'));

const App: React.FC = () => {
  useConsoleEasterEgg();

  return (
    <div className="relative flex min-h-[100dvh] flex-col selection:bg-primary selection:text-background-dark">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      {/* One shared starfield for the entire journey */}
      <Suspense fallback={null}>
        <CosmicBackground
          fixed
          density={1}
          mouseParallax={0.32}
          drift={0.85}
          nebula
          opacity={1}
          className="!z-0"
        />
      </Suspense>

      {/* Fixed film grain — never on scroll containers */}
      <div className="cosmos-grain" aria-hidden="true" />

      <Header />
      <main id="main" className="relative z-[1] flex-grow">
        <Hero />
        <ProjectsScroll />
        <Skills />
        <EventHorizon />
      </main>
    </div>
  );
};

export default App;
