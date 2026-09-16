import React, { useState } from 'react';
import { Cpu, Sparkles } from 'lucide-react';
import { SKILL_CATEGORIES } from '../data/portfolioData';
import { useLanguage } from '../context/LanguageContext';
import { Reveal } from './Reveal';
import { CategoryIcon } from '../lib/categoryIcons';
import type { SkillCategory } from '../types/portfolio';

interface SkillsMatrixProps {
  categories?: SkillCategory[];
}

export const SkillsMatrix: React.FC<SkillsMatrixProps> = ({ categories = SKILL_CATEGORIES }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('all');

  // Categories without skills (e.g. just created in the admin panel) stay hidden.
  const visibleCategories = categories.filter((cat) => cat.skills.length > 0);
  // The selected category may disappear after an admin edit: fall back to all.
  const selected = visibleCategories.some((cat) => cat.id === activeTab) ? activeTab : 'all';
  const filteredCategories =
    selected === 'all'
      ? visibleCategories
      : visibleCategories.filter((cat) => cat.id === selected);

  return (
    <section id="skills" className="py-20 relative bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-3">
                <Cpu className="w-3.5 h-3.5" />
                <span>{t({ es: 'Capacidades Técnicas', en: 'Technical Stack' })}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {t({ es: 'Matriz de Habilidades Técnicas', en: 'Technical Skills Matrix' })}
              </h2>
              <p className="text-slate-400 text-sm mt-2 max-w-xl">
                {t({
                  es: 'Estándares de desarrollo aplicados en arquitecturas backend, aplicaciones móviles e integraciones de IA.',
                  en: 'Development standards applied across backend architecture, mobile apps, and AI integrations.',
                })}
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('all')}
                aria-pressed={selected === 'all'}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selected === 'all'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {t({ es: 'Todas', en: 'All Categories' })}
              </button>
              {visibleCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  aria-pressed={selected === cat.id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    selected === cat.id
                      ? 'bg-slate-800 text-amber-400 border border-amber-500/30 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {t(cat.category).split(' & ')[0]}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Skills Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCategories.map((cat, idx) => (
            <Reveal key={cat.id} delay={(idx % 2) * 100} className="h-full">
              <div
                className="h-full glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group"
              >
                {/* Category Header */}
                <div className="flex items-center gap-3.5 mb-4 pb-4 border-b border-slate-800/80">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 group-hover:scale-105 transition-transform">
                    <CategoryIcon name={cat.icon} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-heading">
                      {t(cat.category)}
                    </h3>
                    {t(cat.description) && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {t(cat.description)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Skill Tags */}
                <div className="flex flex-wrap gap-2.5">
                  {cat.skills.map((skill) => (
                    <div
                      key={skill.name}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 border transition-all ${
                        skill.isPrimary
                          ? 'bg-slate-900 text-amber-300 border-amber-500/30 hover:border-amber-400/50 shadow-sm'
                          : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {skill.isPrimary && (
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                      <span>{skill.name}</span>
                      {skill.level && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({skill.level})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
