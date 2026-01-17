
import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Skills from './components/Skills';
import ProjectsScroll from './components/ProjectsScroll';
import Contact from './components/Contact';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="relative flex min-h-screen flex-col selection:bg-primary selection:text-background-dark">
      <Header />
      <main className="flex-grow">
        <Hero />
        <ProjectsScroll />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default App;
