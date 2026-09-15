import React, { useState, useRef, useEffect } from 'react';
import { PROFILE_DATA } from '../data/portfolioData';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, GraduationCap, Mail, ChevronDown, UserCheck, ShieldCheck } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './Icons';

interface ProfileWidgetProps {
  onOpenAdminLogin?: () => void;
  isAdmin?: boolean;
}

export const ProfileWidget: React.FC<ProfileWidgetProps> = ({ onOpenAdminLogin, isAdmin }) => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={widgetRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 hover:border-amber-500/50 transition-all focus:outline-none group shadow-md"
        aria-label="Toggle user profile dropdown"
      >
        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-amber-500/40 shrink-0">
          <img
            src={PROFILE_DATA.avatar}
            alt={PROFILE_DATA.name}
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform"
          />
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-slate-950" />
        </div>

        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold text-white font-heading leading-tight group-hover:text-amber-400 transition-colors flex items-center gap-1">
            {PROFILE_DATA.name}
            {isAdmin && <ShieldCheck className="w-3 h-3 text-cyan-400 inline" />}
          </span>
          <span className="text-[10px] font-mono text-slate-400 leading-tight">
            {t(PROFILE_DATA.role)}
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-amber-400' : ''}`} />
      </button>

      {/* Profile Card Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-[#0c111d] border border-slate-700/90 rounded-3xl p-5 shadow-2xl z-50 transform origin-top-right transition-all duration-200 animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-lg shrink-0">
              <img
                src={PROFILE_DATA.avatar}
                alt={PROFILE_DATA.name}
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-base font-extrabold text-white font-heading">
                  {PROFILE_DATA.name}
                </h4>
                <UserCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-amber-400 font-mono">
                {t(PROFILE_DATA.role)}
              </p>
              <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{t(PROFILE_DATA.status)}</span>
              </div>
            </div>
          </div>

          <div className="py-4 space-y-2.5 text-xs text-slate-300 font-mono">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{t(PROFILE_DATA.location)}</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{t(PROFILE_DATA.education)}</span>
            </div>
          </div>

          {/* "¿Sos Elias?" / Admin Panel Entry Point */}
          {onOpenAdminLogin && (
            <div className="pb-3 pt-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenAdminLogin();
                }}
                className="w-full py-2 px-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-xs font-semibold text-cyan-300 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span>{isAdmin ? (language === 'es' ? 'Panel Admin' : 'Admin Panel') : (language === 'es' ? '¿Sos Elias?' : 'Are you Elias?')}</span>
                </div>
                <span className="text-[10px] text-cyan-400/80 underline font-mono">
                  {isAdmin ? 'Gestionar' : 'Acceder →'}
                </span>
              </button>
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:text-sky-400 transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a
                href="mailto:contact@devportfolio.com"
                className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:text-amber-400 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>

            <span className="text-[10px] font-mono text-slate-500">
              UNLaM Engineer
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

