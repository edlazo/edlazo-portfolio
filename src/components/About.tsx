import React from 'react';
import { MapPin, GraduationCap, Heart, User, CheckCircle2, Compass } from 'lucide-react';
import { ABOUT_DATA, PROFILE_DATA } from '../data/portfolioData';
import { useLanguage } from '../context/LanguageContext';

export const About: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="about" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono mb-3">
            <User className="w-3.5 h-3.5" />
            <span>{t(ABOUT_DATA.title)}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t(ABOUT_DATA.subtitle)}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Story Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel p-8 rounded-3xl relative overflow-hidden space-y-6 border border-slate-800">
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Photo & Profile Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-4 border-b border-slate-800/80">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-500/60 shadow-xl shrink-0 group">
                  <img
                    src={PROFILE_DATA.avatar}
                    alt={PROFILE_DATA.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-md" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-heading">
                    {PROFILE_DATA.name}
                  </h3>
                  <p className="text-xs text-amber-400 font-mono mt-0.5">
                    {t(PROFILE_DATA.role)}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-2 font-mono text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-[11px]">
                      <MapPin className="w-3 h-3" />
                      <span>{t(PROFILE_DATA.location)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 text-[11px]">
                      <GraduationCap className="w-3 h-3" />
                      <span>{t(PROFILE_DATA.education)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio Paragraphs */}
              <div className="space-y-4 text-slate-200 text-base leading-relaxed font-normal">
                <p>{t(ABOUT_DATA.bio)}</p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {t(ABOUT_DATA.bioSecondary)}
                </p>
              </div>

              {/* Personal Interests Banner */}
              <div className="pt-6 border-t border-slate-800/80">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-2">
                  <Heart className="w-4 h-4" />
                  <span className="uppercase tracking-wider">
                    {t({ es: 'Más allá del código', en: 'Beyond Coding' })}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  {t(ABOUT_DATA.personalInterests)}
                </p>
              </div>
            </div>
          </div>

          {/* Pillars Column */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>{t({ es: 'Lo que guía mi trabajo', en: 'What Guides My Work' })}</span>
            </h3>

            {ABOUT_DATA.pillars.map((pillar) => (
              <div
                key={t(pillar.title)}
                className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-amber-500/30 transition-all duration-300 group"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-heading group-hover:text-amber-400 transition-colors">
                      {t(pillar.title)}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1">
                      {t(pillar.description)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
