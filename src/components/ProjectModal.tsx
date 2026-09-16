import React from 'react';
import type { Project } from '../types/portfolio';
import { useLanguage } from '../context/LanguageContext';
import { useDialog } from '../hooks/useDialog';
import { X, ShieldCheck, Server, Sparkles } from 'lucide-react';
import { PhoneFrame } from './PhoneFrame';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  const { t } = useLanguage();
  const dialogRef = useDialog(Boolean(project), onClose);

  if (!project) return null;

  const isMobileApp = Boolean(project.isMobileApp);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        tabIndex={-1}
        className="relative w-full max-w-4xl max-h-[90vh] glass-panel bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 animate-dialog-in"
      >
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-slate-800 flex items-start justify-between bg-slate-900/50">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
                {isMobileApp ? 'Mobile AI Architecture' : 'Async Backend Core'}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {project.period}
              </span>
            </div>

            <h3 id="project-modal-title" className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              {project.title} — {t({ es: 'Blueprint de Arquitectura', en: 'Architectural Blueprint' })}
            </h3>
            <p className="text-sm text-slate-300 italic mt-1 font-medium">
              "{t(project.tagline)}"
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            aria-label={t({ es: 'Cerrar blueprint', en: 'Close blueprint' })}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div
          className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1"
          tabIndex={0}
          role="region"
          aria-label={t({ es: 'Detalle de la arquitectura', en: 'Architecture details' })}
        >
          {/* Visual Showcase Banner / Phone Frame */}
          <div className="rounded-2xl overflow-hidden border border-slate-800 p-4 bg-slate-950 flex items-center justify-center">
            {isMobileApp ? (
              <PhoneFrame
                imageSrc={project.image}
                altText={`${project.title} mobile view`}
              />
            ) : (
              <div className="w-full rounded-xl overflow-hidden border border-slate-800">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-64 sm:h-80 object-cover object-top"
                />
              </div>
            )}
          </div>

          {/* Stack Chips */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
              {t({ es: 'Tecnologías & Herramientas', en: 'Core Tech Stack & Tools' })}
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Architecture Overview */}
          {project.architectureOverview && (
            <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
              <h4 className="text-base font-bold text-white font-heading flex items-center gap-2">
                <Server className="w-5 h-5 text-amber-400" />
                <span>{t({ es: 'Diseño del Sistema y Visión General', en: 'System Design & Architecture Overview' })}</span>
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {t(project.architectureOverview.description)}
              </p>

              {project.architectureOverview.flowSteps && (
                <div className="pt-4 border-t border-slate-800/80">
                  <h5 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t({ es: 'Flujo de Peticiones y Datos', en: 'Request Lifecycle & Data Flow' })}</span>
                  </h5>
                  <ol className="space-y-2.5">
                    {project.architectureOverview.flowSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs text-slate-300">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{t(step)}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Detailed Technical Highlights */}
          <div>
            <h4 className="text-base font-bold text-white font-heading mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>{t({ es: 'Especificaciones Técnicas', en: 'Architectural Specifications' })}</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.highlights.map((h) => (
                <div
                  key={t(h.title)}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800"
                >
                  <h5 className="text-sm font-bold text-amber-400 font-heading mb-1.5">
                    {t(h.title)}
                  </h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {t(h.description)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex items-center justify-end bg-slate-900/80">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs font-mono transition-colors"
          >
            {t({ es: 'Cerrar Blueprint', en: 'Close Blueprint' })}
          </button>
        </div>
      </div>
    </div>
  );
};
