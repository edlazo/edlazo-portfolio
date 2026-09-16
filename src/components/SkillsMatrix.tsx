import React, { useState } from 'react';
import { Server, Smartphone, Cpu, ShieldCheck, Sparkles } from 'lucide-react';
import { SKILL_CATEGORIES } from '../data/portfolioData';
import { useLanguage } from '../context/LanguageContext';
import { Reveal } from './Reveal';
import type { SkillCategory } from '../types/portfolio';

interface SkillsMatrixProps {
  categories?: SkillCategory[];
}

export const SkillsMatrix: React.FC<SkillsMatrixProps> = ({ categories = SKILL_CATEGORIES }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('all');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Server':
        return <Server className="w-5 h-5 text-amber-400" />;
      case 'Smartphone':
        return <Smartphone className="w-5 h-5 text-cyan-400" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-purple-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      default:
        return <Server className="w-5 h-5 text-amber-400" />;
    }
  };

  const filteredCategories =
    activeTab === 'all'
      ? categories
      : categories.filter((cat) => cat.id === activeTab);

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
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'all'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {t({ es: 'Todas', en: 'All Categories' })}
              </button>
              {SKILL_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    activeTab === cat.id
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
                    {getIcon(cat.icon)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-heading">
                      {t(cat.category)}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {t(cat.description)}
                    </p>
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
