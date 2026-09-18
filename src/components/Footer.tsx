import React from 'react';
import { Terminal, ArrowUp } from 'lucide-react';
import { SocialLinks } from './SocialLinks';

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
            <div className="w-8 h-8 bg-amber-500 flex items-center justify-center text-slate-950">
              <Terminal className="w-4 h-4" />
            </div>
            <span className="text-sm font-label font-bold text-white">
              Dev<span className="text-amber-400">.Portfolio</span>
            </span>
          </div>

          {/* Social Links */}
          <SocialLinks className="justify-center" />

          {/* Back to top */}
          <button
            onClick={scrollToTop}
            className="px-3 py-2 border border-slate-800 hover:border-amber-500/60 hover:bg-amber-500/5 text-slate-300 hover:text-amber-400 transition-all flex items-center gap-2 text-xs font-label"
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
