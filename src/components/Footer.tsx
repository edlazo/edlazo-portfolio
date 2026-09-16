import React from 'react';
import { Terminal, ArrowUp, Mail } from 'lucide-react';
import { HERO_DATA } from '../data/portfolioData';
import { GithubIcon, GitlabIcon, LinkedinIcon } from './Icons';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800/60">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Terminal className="w-4 h-4" />
            </div>
            <span className="text-base font-bold text-white font-heading">
              Dev<span className="text-amber-500">.Portfolio</span>
            </span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4 text-slate-400">
            <a
              href={HERO_DATA.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <GithubIcon className="w-5 h-5" />
            </a>
            <a
              href={HERO_DATA.socials.gitlab}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              aria-label="GitLab"
            >
              <GitlabIcon className="w-5 h-5 text-orange-400" />
            </a>
            <a
              href={HERO_DATA.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              aria-label="LinkedIn"
            >
              <LinkedinIcon className="w-5 h-5 text-sky-400" />
            </a>
            <a
              href={`mailto:${HERO_DATA.socials.email}`}
              className="hover:text-white transition-colors"
              aria-label="Email"
            >
              <Mail className="w-5 h-5 text-amber-400" />
            </a>
          </div>

          {/* Back to top */}
          <button
            onClick={scrollToTop}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 transition-all flex items-center gap-2 text-xs font-mono"
          >
            <span>Back to top</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-400 gap-4">
          <p>
            © {new Date().getFullYear()} Developer Portfolio. Built with Vite, React, TypeScript & Tailwind CSS.
          </p>
          <p className="flex items-center gap-2 text-slate-400">
            <span>Trunk-Based Delivery</span>
            <span>•</span>
            <span>WCAG AA Accessible</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
