import React, { useEffect } from 'react';
import { Terminal, ArrowLeft, FolderGit2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';

const MAX_PATH_LENGTH = 80;

// The path is only ever rendered as text (React escapes it), never as HTML.
const getRequestedPath = (): string => {
  let path = window.location.pathname;
  try {
    path = decodeURIComponent(path);
  } catch {
    // Malformed escape sequences: show the raw path instead.
  }
  return path.length > MAX_PATH_LENGTH ? `${path.slice(0, MAX_PATH_LENGTH)}…` : path;
};

export const NotFound: React.FC = () => {
  const { t } = useLanguage();
  const requestedPath = getRequestedPath();

  useEffect(() => {
    document.title = t({
      es: '404 — Página no encontrada · Elias Lazo',
      en: '404 — Page not found · Elias Lazo',
    });
  }, [t]);

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 font-sans flex flex-col relative overflow-hidden selection:bg-amber-500 selection:text-slate-950">
      {/* Background Ambient Glows */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"
        aria-hidden="true"
      />

      <header className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 transition-colors">
            <Terminal className="w-5 h-5" aria-hidden="true" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-100 font-heading group-hover:text-amber-400 transition-colors">
            Elias<span className="text-amber-500">.Dev</span>
          </span>
        </a>
        <LanguageToggle />
      </header>

      <main className="relative z-10 flex-1 flex items-center">
        <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono mb-5">
            {t({ es: 'Error 404', en: 'Error 404' })}
          </p>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            {t({ es: 'Página no encontrada', en: 'Page not found' })}
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-10 max-w-xl">
            {t({
              es: 'La ruta que buscás no existe o se movió. Probá volver al inicio.',
              en: "The page you're looking for doesn't exist or has moved. Try heading back home.",
            })}
          </p>

          {/* Terminal window */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl mb-10 animate-dialog-in">
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center gap-2" aria-hidden="true">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-3 text-[11px] font-mono text-slate-400">bash</span>
            </div>
            <pre className="p-5 sm:p-6 text-xs sm:text-sm font-mono leading-relaxed whitespace-pre-wrap break-all">
              <code>
                <span className="text-emerald-400">$</span> <span className="text-slate-200">cd {requestedPath}</span>
                {'\n'}
                <span className="text-rose-400">bash: cd: {requestedPath}: No such file or directory</span>
                {'\n'}
                <span className="text-emerald-400">$</span> <span className="text-slate-200">cd ~</span>
                <span className="inline-block w-2 h-4 align-middle ml-1 bg-amber-400 animate-pulse" aria-hidden="true" />
              </code>
            </pre>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="/"
              className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base transition-all shadow-xl shadow-amber-500/20 hover:shadow-amber-500/35 flex items-center gap-2.5"
            >
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
              <span>{t({ es: 'Volver al inicio', en: 'Back to home' })}</span>
            </a>
            <a
              href="/#projects"
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-base transition-all hover:border-amber-500/50 hover:text-white flex items-center gap-2"
            >
              <FolderGit2 className="w-5 h-5 text-amber-400" aria-hidden="true" />
              <span>{t({ es: 'Ver proyectos', en: 'View projects' })}</span>
            </a>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-slate-800/80 py-6">
        <p className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs font-mono text-slate-400">
          © {new Date().getFullYear()} Elias Lazo
        </p>
      </footer>
    </div>
  );
};
