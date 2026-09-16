import React from 'react';
import { ArrowRight, Mail, Cpu, Database, Code2 } from 'lucide-react';
import { HERO_DATA, PROFILE_DATA } from '../data/portfolioData';
import { useLanguage } from '../context/LanguageContext';
import { GithubIcon, GitlabIcon, LinkedinIcon } from './Icons';
import { Reveal } from './Reveal';

interface HeroProps {
  onOpenContact: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenContact }) => {
  const { t } = useLanguage();

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl">
          <Reveal aboveTheFold>
            {/* Status & Profile Chip */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-700/80 text-amber-400 text-xs font-mono mb-8 shadow-inner">
              <div className="relative w-6 h-6 rounded-full overflow-hidden border border-amber-500/50 shrink-0">
                <img
                  src={PROFILE_DATA.avatar}
                  alt={PROFILE_DATA.name}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-slate-200 font-bold">{PROFILE_DATA.name}</span>
              <span className="text-slate-400" aria-hidden="true">|</span>
              <span className="text-slate-300">{t(HERO_DATA.availability)}</span>
            </div>

            {/* Main Headline with Elias Name */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
              <span className="block text-slate-300 text-2xl sm:text-4xl font-semibold mb-2">
                {t(HERO_DATA.greeting)}{' '}
                <span className="text-amber-400 font-bold">{HERO_DATA.name}</span>
              </span>
              <span className="block text-white font-extrabold">
                {t(HERO_DATA.headline)}
              </span>
              <span className="gradient-text-amber block mt-2 text-3xl sm:text-5xl lg:text-6xl">
                APIs, Mobile & AI Security
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-3xl mb-10 font-normal">
              {t(HERO_DATA.subheadline)}
            </p>
          </Reveal>

          <Reveal aboveTheFold>
            {/* Call to Actions */}
            <div className="flex flex-wrap items-center gap-4 mb-12">
              <a
                href="#projects"
                className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base transition-all shadow-xl shadow-amber-500/20 hover:shadow-amber-500/35 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2.5"
              >
                <span>{t({ es: 'Ver Proyectos', en: 'View Projects' })}</span>
                <ArrowRight className="w-5 h-5" />
              </a>

              <button
                onClick={onOpenContact}
                className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-base transition-all hover:border-amber-500/50 hover:text-white hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
              >
                <Mail className="w-5 h-5 text-amber-400" />
                <span>{t({ es: 'Contactarme', en: 'Get in Touch' })}</span>
              </button>
            </div>
          </Reveal>

          <Reveal aboveTheFold>
            {/* Social Links & Quick Tech Badges */}
            <div className="pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-6">
              {/* Socials */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono uppercase text-slate-400 tracking-wider mr-2">
                  {t({ es: 'Conectar:', en: 'Connect:' })}
                </span>
                <a
                  href={HERO_DATA.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-800 transition-all"
                  aria-label="GitHub Profile"
                >
                  <GithubIcon className="w-5 h-5" />
                </a>
                <a
                  href={HERO_DATA.socials.gitlab}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-800 transition-all"
                  aria-label="GitLab Profile"
                >
                  <GitlabIcon className="w-5 h-5 text-orange-400" />
                </a>
                <a
                  href={HERO_DATA.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-800 transition-all"
                  aria-label="LinkedIn Profile"
                >
                  <LinkedinIcon className="w-5 h-5 text-sky-400" />
                </a>
                <a
                  href={`mailto:${HERO_DATA.socials.email}`}
                  className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-800 transition-all"
                  aria-label="Send Email"
                >
                  <Mail className="w-5 h-5 text-amber-400" />
                </a>
              </div>

              {/* Quick Spec Highlights */}
              <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-amber-400" />
                  <span>FastAPI & Express</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-cyan-400" />
                  <span>React Native (Expo)</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span>Google Gemini AI</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
