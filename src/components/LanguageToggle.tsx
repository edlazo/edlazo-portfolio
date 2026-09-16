import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center bg-slate-900/90 p-1 rounded-full border border-slate-700/80 shadow-inner">
      <div className="hidden sm:flex items-center pl-2.5 pr-1 text-slate-400">
        <Globe className="w-3.5 h-3.5 text-amber-400" />
      </div>

      <button
        onClick={() => setLanguage('es')}
        className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold transition-all ${
          language === 'es'
            ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
            : 'text-slate-400 hover:text-white'
        }`}
        aria-label="ES - Español"
      >
        ES
      </button>

      <button
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold transition-all ${
          language === 'en'
            ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
            : 'text-slate-400 hover:text-white'
        }`}
        aria-label="EN - English"
      >
        EN
      </button>
    </div>
  );
};
