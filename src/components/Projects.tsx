import React from 'react';
import type { Project } from '../types/portfolio';
import { FEATURED_PROJECTS } from '../data/portfolioData';
import { useLanguage } from '../context/LanguageContext';
import { FolderGit2, ArrowUpRight, Sparkles } from 'lucide-react';
import { PhoneFrame } from './PhoneFrame';

interface ProjectsProps {
  onSelectProject: (project: Project) => void;
  projects?: Project[];
}

export const Projects: React.FC<ProjectsProps> = ({ onSelectProject, projects = FEATURED_PROJECTS }) => {
  const { t } = useLanguage();

  return (
    <section id="projects" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono mb-3">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>{t({ es: 'Casos de Estudio & Trabajos', en: 'Case Studies & Works' })}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t({ es: 'Proyectos Destacados & Arquitectura', en: 'Featured Projects & Architecture' })}
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl">
            {t({
              es: 'Desglose detallado de aplicaciones reales con IA multi-modelo, proxies de seguridad e integración con FastAPI.',
              en: 'Detailed breakdowns of production apps featuring multi-model AI routing, zero-trust backend proxies, and FastAPI isolation.',
            })}
          </p>
        </div>

        {/* Projects Cards Grid */}
        <div className="space-y-12">
          {projects.map((project, idx) => {
            const isEven = idx % 2 === 0;
            const isMobileApp = project.id === 'semanita';

            return (
              <div
                key={project.id}
                className="glass-panel rounded-3xl border border-slate-800 hover:border-slate-700/80 transition-all duration-300 overflow-hidden group shadow-2xl"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  {/* Left Media Column */}
                  <div
                    className={`lg:col-span-6 relative overflow-hidden bg-slate-900/90 p-6 sm:p-8 flex flex-col justify-between items-center ${
                      isEven ? 'lg:order-1' : 'lg:order-2'
                    }`}
                  >
                    <div className="w-full relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                        {project.platforms.map((plat) => (
                          <span
                            key={plat}
                            className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700/60"
                          >
                            {plat}
                          </span>
                        ))}
                        {project.period && (
                          <span className="text-[11px] font-mono text-slate-500 ml-auto">
                            {project.period}
                          </span>
                        )}
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-heading group-hover:text-amber-400 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-amber-400/90 text-sm italic mt-1 font-medium">
                        "{t(project.tagline)}"
                      </p>
                    </div>

                    {/* Image / Device Showcase */}
                    <div className="my-6 w-full flex justify-center items-center">
                      {isMobileApp ? (
                        <PhoneFrame
                          imageSrc={project.image}
                          altText={`${project.title} mobile interface screenshot`}
                        />
                      ) : (
                        /* Web Browser Mockup Frame */
                        <div className="w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 group-hover:scale-[1.02] transition-transform duration-500">
                          {/* Browser Window Bar */}
                          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center gap-2">
                            <div className="flex gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                            </div>
                            <div className="mx-auto text-[10px] font-mono text-slate-500 bg-slate-950 px-3 py-0.5 rounded-md border border-slate-800/80">
                              https://kairos.app
                            </div>
                          </div>
                          <img
                            src={project.image}
                            alt={`${project.title} web platform visual`}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-56 sm:h-72 object-cover object-top"
                          />
                        </div>
                      )}
                    </div>

                    {/* Role Tag */}
                    <div className="w-full relative z-10 text-xs text-slate-400 font-mono flex items-center gap-2">
                      <span className="text-amber-500 font-bold">
                        {t({ es: 'ROL:', en: 'ROLE:' })}
                      </span>
                      <span>{t(project.role)}</span>
                    </div>
                  </div>

                  {/* Right Highlights & Technical Details Column */}
                  <div
                    className={`lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between ${
                      isEven ? 'lg:order-2' : 'lg:order-1'
                    }`}
                  >
                    <div>
                      {/* Stack Tags */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.stack.map((tech) => (
                          <span
                            key={tech}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      {/* Summary */}
                      <p className="text-sm text-slate-300 leading-relaxed mb-6 font-normal">
                        {t(project.summary)}
                      </p>

                      {/* Highlights */}
                      <div className="space-y-4 mb-8">
                        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>{t({ es: 'Aspectos Técnicos Clave', en: 'Key Technical Highlights' })}</span>
                        </h4>

                        <div className="space-y-3">
                          {project.highlights.map((item) => (
                            <div
                              key={t(item.title)}
                              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition-colors"
                            >
                              <div className="text-xs font-bold text-slate-200 font-heading mb-1">
                                {t(item.title)}
                              </div>
                              <div className="text-xs text-slate-400 leading-relaxed">
                                {t(item.description)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-mono">
                        {t({ es: 'Blueprint de Arquitectura', en: 'Architecture Blueprint' })}
                      </span>

                      <button
                        onClick={() => onSelectProject(project)}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono transition-all shadow-lg hover:shadow-amber-500/25 flex items-center gap-2 active:scale-95"
                      >
                        <span>{t({ es: 'Inspeccionar Arquitectura', en: 'Inspect Architecture' })}</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
