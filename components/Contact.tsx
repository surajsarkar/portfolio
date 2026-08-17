
import React, { useState } from 'react';
import { SOCIALS } from '../constants';
import ScrollReveal from './ScrollReveal';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Message sent! (Simulation)');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <section className="relative py-24 px-4 overflow-hidden" id="contact">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <ScrollReveal direction="left" distance={60}>
            <div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6">Let's collaborate</h2>
              <p className="text-gray-400 text-lg mb-12 leading-relaxed max-w-lg">
                If you need a hand building reliable backend systems or automating the boring stuff, feel free to say hello.
              </p>
              <div className="space-y-10">
                <div>
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">Contact Details</p>
                  <a className="flex items-center gap-4 group" href="mailto:hello@example.com">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-surface-dark border border-border-dark group-hover:border-primary group-hover:text-primary text-gray-400 transition-colors">
                      <span className="material-symbols-outlined">mail</span>
                    </div>
                    <span className="text-xl text-white font-medium group-hover:text-primary transition-colors">hello@example.com</span>
                  </a>
                </div>
                <div>
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">Social Profiles</p>
                  <div className="flex gap-4">
                    {SOCIALS.map((social) => (
                      <a
                        key={social.name}
                        className="group flex items-center justify-center w-12 h-12 rounded-full bg-surface-dark border border-border-dark hover:border-primary transition-colors"
                        href={social.url}
                        title={social.name}
                      >
                        <span className="material-symbols-outlined text-gray-400 group-hover:text-white transition-colors">{social.icon}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" distance={60} delay={200}>
            <div className="bg-surface-dark border border-border-dark rounded-[2rem] p-8 md:p-10 shadow-2xl relative group">
              <div className="absolute inset-0 bg-primary/5 rounded-[2rem] blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-8 right-8 p-2 opacity-10 pointer-events-none">
                <span className="material-symbols-outlined text-6xl text-primary">send</span>
              </div>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-mono font-bold text-gray-500 uppercase ml-1" htmlFor="name">Name</label>
                    <input
                      className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-gray-200 placeholder-gray-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                      id="name"
                      placeholder="John Doe"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono font-bold text-gray-500 uppercase ml-1" htmlFor="email">Email</label>
                    <input
                      className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-gray-200 placeholder-gray-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                      id="email"
                      placeholder="john@example.com"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold text-gray-500 uppercase ml-1" htmlFor="subject">Subject</label>
                  <input
                    className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-gray-200 placeholder-gray-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    id="subject"
                    placeholder="Project Inquiry"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold text-gray-500 uppercase ml-1" htmlFor="message">Message</label>
                  <textarea
                    className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-gray-200 placeholder-gray-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
                    id="message"
                    placeholder="Tell me about your project..."
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  ></textarea>
                </div>
                <button
                  className="w-full bg-primary text-background-dark font-bold text-base uppercase tracking-wider py-4 rounded-xl hover:opacity-90 hover:shadow-[0_0_20px_rgba(83,210,45,0.4)] transition-all mt-4"
                  type="submit"
                >
                  Send Message
                </button>
              </form>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default Contact;
