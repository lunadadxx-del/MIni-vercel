import React, { useState } from 'react';
import {
  Rocket,
  GitBranch,
  Layers,
  Terminal,
  ExternalLink,
  Github,
  Mail,
  Linkedin,
  Cpu,
  Server,
  Cloud,
  Shield,
  CheckCircle2,
  Code2,
  ArrowRight,
  Send
} from 'lucide-react';

export default function App() {
  const [formSent, setFormSent] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const currentVersion = 'Version 1.1';

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSent(true);
    setTimeout(() => setFormSent(false), 4000);
    setEmail('');
    setMessage('');
  };

  const skills = [
    { name: 'Docker Containerization', icon: Server, desc: 'Multi-stage builds, Alpine optimizations, dumb-init' },
    { name: 'GitHub Actions CI/CD', icon: Terminal, desc: 'Automated test matrices, workflow_dispatch triggers' },
    { name: 'React 18 & Vite', icon: Code2, desc: 'Modern reactive architecture, Tailwind styling' },
    { name: 'Node.js & Express API', icon: Cpu, desc: 'REST endpoints, server-side auth, rate limits' },
    { name: 'Render Cloud Deployment', icon: Cloud, desc: 'Static sites, Docker web services, deploy webhooks' },
    { name: 'DevOps Security', icon: Shield, desc: 'Secret masking, non-root users, least-privilege tokens' },
  ];

  const projects = [
    {
      title: 'DeployFlow — Mini Vercel',
      desc: 'Automated deployment management platform with real-time GitHub Actions workflow telemetry and Render orchestration.',
      tags: ['React', 'Docker', 'GitHub Actions', 'Express', 'Render'],
      link: 'https://github.com/lunadadxx-del/MIni-vercel'
    },
    {
      title: 'DeployFlow Demo Portfolio',
      desc: 'Demonstration project deployed end-to-end through the Mini Vercel platform using automated CI/CD.',
      tags: ['Vite', 'Tailwind CSS', 'Render Static Site', 'CI/CD'],
      link: '#'
    },
    {
      title: 'Cloud Microservices Pipeline',
      desc: 'Automated staging-to-production deployment pipeline with health checks and canary verifications.',
      tags: ['Docker', 'Linux', 'Node.js', 'CI/CD'],
      link: '#'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-[#0c101a]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white">DeployFlow</span>
              <span className="text-xs text-indigo-400 font-mono ml-2">Portfolio</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Version Badge (Key for demonstration) */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 font-mono font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{currentVersion}</span>
            </div>

            <a
              href="https://github.com/lunadadxx-del/MIni-vercel"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-all border border-slate-700"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Repository</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-950/30 via-transparent to-transparent -z-10" />
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <Rocket className="w-3.5 h-3.5 text-indigo-400" />
            <span>Deployed automatically through <strong>Mini Vercel Platform</strong></span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Building Resilient Cloud Systems with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Docker & CI/CD</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Hi, I'm a DevOps & Full-Stack Developer demonstrating automated web application deployment using GitHub Actions, Docker containerization, and Render cloud hosting.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <a
              href="#projects"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2"
            >
              <span>Explore Projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <a
              href="#contact"
              className="px-6 py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition-all"
            >
              Get In Touch
            </a>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-16 px-6 bg-[#0c101b]/50 border-y border-slate-800/60">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase font-mono tracking-wider text-indigo-400 font-semibold">Technical Expertise</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">DevOps & Full-Stack Capabilities</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {skills.map((skill) => {
              const Icon = skill.icon;
              return (
                <div
                  key={skill.name}
                  className="p-5 rounded-2xl bg-[#111726] border border-slate-800 hover:border-indigo-500/40 transition-all shadow-sm group"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">{skill.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{skill.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase font-mono tracking-wider text-purple-400 font-semibold">Featured Work</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">College Demonstration Projects</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div
                key={proj.title}
                className="p-6 rounded-2xl bg-[#111726] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-white">{proj.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{proj.desc}</p>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {proj.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <a
                    href={proj.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    <span>View Repository</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-6 bg-[#0c101b]/50 border-t border-slate-800/60">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <div className="space-y-2">
            <span className="text-xs uppercase font-mono tracking-wider text-emerald-400 font-semibold">Connect</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Get in Touch</h2>
            <p className="text-xs text-slate-400">
              Reach out for collaboration or college presentation inquiries.
            </p>
          </div>

          {formSent ? (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Thank you! Your message has been sent.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 text-left">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[#111726] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <textarea
                  rows="3"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Your Message..."
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[#111726] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>DeployFlow Demo Portfolio &bull; Live College DevOps Demonstration</p>
        <p className="text-[11px] text-slate-600 mt-1">
          Automated deployment powered by GitHub Actions CI/CD and Render Static Sites
        </p>
      </footer>
    </div>
  );
}
