import React from 'react';
import { ArrowRight, ArrowUpRight, Mail, Cpu, Database, Code2 } from 'lucide-react';
import { HERO_DATA, PROFILE_DATA } from '../data/portfolioData';
import { useLanguage } from '../context/LanguageContext';
import { GithubIcon, GitlabIcon, LinkedinIcon } from './Icons';
import { Reveal } from './Reveal';

interface HeroProps {
  onOpenContact: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenContact }) => {
  const { t } = useLanguage();

  const socialLinks = [
    { key: 'github', label: 'GitHub', href: HERO_DATA.socials.github, icon: GithubIcon, external: true },
    { key: 'gitlab', label: 'GitLab', href: HERO_DATA.socials.gitlab, icon: GitlabIcon, external: true },
    { key: 'linkedin', label: 'LinkedIn', href: HERO_DATA.socials.linkedin, icon: LinkedinIcon, external: true },
    { key: 'email', label: 'Email', href: `mailto:${HERO_DATA.socials.email}`, icon: Mail, external: false },
  ];

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl">
          <Reveal aboveTheFold>
            {/* Status & Profile Chip */}
            <div className="inline-flex items-center gap-3 text-amber-400 text-xs font-label mb-8">
              <span className="w-2.5 h-2.5 bg-amber-400 shrink-0" aria-hidden="true" />
              <span>{t(HERO_DATA.availability)}</span>
            </div>

            {/* Main Headline with Elias Name */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
              <span className="block text-cyan-400 text-xs sm:text-sm font-label font-medium mb-5">
                {PROFILE_DATA.fullName} <span aria-hidden="true">·</span> {t(HERO_DATA.shortLocation)}
              </span>
              <span className="block text-white font-extrabold">
                {t(HERO_DATA.headline)}
              </span>
              <span
                className="block w-40 sm:w-72 h-1 bg-amber-400 my-3"
                aria-hidden="true"
              />
              <span className="text-outline block text-3xl sm:text-5xl lg:text-6xl">
                {t(HERO_DATA.headlineAccent)}
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
                className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-label font-bold text-sm transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2.5"
              >
                <span>{t({ es: 'Ver Proyectos', en: 'View Projects' })}</span>
                <ArrowRight className="w-5 h-5" />
              </a>

              <button
                onClick={onOpenContact}
                className="px-6 py-3.5 bg-transparent hover:bg-amber-500/10 border border-amber-500/60 text-amber-400 font-label font-semibold text-sm transition-all hover:border-amber-400 hover:text-amber-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
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
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="w-full sm:w-auto text-xs font-label text-amber-400 sm:mr-2">
                  {t({ es: 'Conectar /', en: 'Connect /' })}
                </span>
                {socialLinks.map(({ key, label, href, icon: Icon, external }) => (
                  <a
                    key={key}
                    href={href}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="group flex items-center gap-2 px-3 py-2 border border-slate-800 text-slate-300 hover:text-white hover:border-amber-500/60 hover:bg-amber-500/5 transition-all text-xs font-label"
                  >
                    <Icon className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-amber-400 transition-colors" />
                    <span>{label}</span>
                    {external && (
                      <>
                        <ArrowUpRight
                          className="w-3.5 h-3.5 shrink-0 text-slate-500 group-hover:text-amber-400 transition-colors"
                          aria-hidden="true"
                        />
                        <span className="sr-only">
                          {t({ es: '(se abre en una pestaña nueva)', en: '(opens in a new tab)' })}
                        </span>
                      </>
                    )}
                  </a>
                ))}
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
