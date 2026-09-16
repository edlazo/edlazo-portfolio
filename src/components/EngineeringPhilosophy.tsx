import React from 'react';
import { GitBranch, Sparkles, Lock, CheckCircle2, Workflow } from 'lucide-react';
import { WORKFLOW_ITEMS } from '../data/portfolioData';
import { useLanguage } from '../context/LanguageContext';
import { Reveal } from './Reveal';

export const EngineeringPhilosophy: React.FC = () => {
  const { t } = useLanguage();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'GitBranch':
        return <GitBranch className="w-5 h-5 text-cyan-400" />;
      case 'Lock':
        return <Lock className="w-5 h-5 text-emerald-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <section id="philosophy" className="py-20 relative bg-slate-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <Reveal>
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-3">
              <Workflow className="w-3.5 h-3.5" />
              <span>{t({ es: 'Mi Proceso', en: 'My Workflow' })}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {t({ es: 'Cómo Trabajo & Desarrollo', en: 'How I Work & Build' })}
            </h2>
            <p className="text-slate-400 text-sm mt-2 max-w-2xl">
              {t({
                es: 'Principios prácticos para llevar ideas desde el concepto inicial hasta productos funcionales y bien estructurados.',
                en: 'Practical principles for bringing ideas from initial concept to functional, well-structured products.',
              })}
            </p>
          </div>
        </Reveal>

        {/* Workflow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {WORKFLOW_ITEMS.map((item, idx) => (
            <Reveal key={item.id} delay={idx * 100} className="h-full">
              <div
                className="h-full glass-panel p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 group-hover:scale-105 transition-transform shrink-0">
                      {getIcon(item.icon)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white font-heading group-hover:text-amber-400 transition-colors">
                        {t(item.title)}
                      </h3>
                      <p className="text-[11px] font-mono text-amber-500 mt-0.5">
                        {t(item.subtitle)}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-6 font-normal">
                    {t(item.description)}
                  </p>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-800/80">
                  {item.points.map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t(pt)}</span>
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
