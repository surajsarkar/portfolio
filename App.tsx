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
    <div className="relative flex min-h-[100dvh] flex-col selection:bg-cream/25 selection:text-ink">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      {/* One shared starfield for the entire journey */}
      <Suspense fallback={null}>
        <CosmicBackground
          fixed
          density={1.15}
          mouseParallax={0.22}
          drift={0.55}
          nebula
          accent="#d4c4a8"
          opacity={0.78}
          scrollDepth={160}
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
