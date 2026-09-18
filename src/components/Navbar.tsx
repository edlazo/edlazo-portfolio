import React, { useState, useEffect } from 'react';
import { Terminal, Menu, X, Mail } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { ProfileWidget } from './ProfileWidget';

interface NavbarProps {
  onOpenContact: () => void;
  onOpenAdminLogin?: () => void;
  isAdmin?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenContact, onOpenAdminLogin, isAdmin }) => {
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: t({ es: 'Sobre Mí', en: 'About' }), href: '#about' },
    { label: t({ es: 'Habilidades', en: 'Skills' }), href: '#skills' },
    { label: t({ es: 'Proyectos', en: 'Projects' }), href: '#projects' },
    { label: t({ es: 'Mi Proceso', en: 'Workflow' }), href: '#philosophy' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass-nav py-3 shadow-2xl' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Brand / Logo */}
          <a
            href="#"
            className="flex items-center gap-2.5 group shrink-0"
          >
            <div className="w-10 h-10 bg-amber-500 flex items-center justify-center text-slate-950 group-hover:bg-amber-400 transition-all">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-label font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                Elias<span className="text-amber-400">.Dev</span>
              </span>
              <span className="block text-[10px] text-slate-400 font-mono tracking-widest uppercase">
                Backend & AI Engineer
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Principal">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs font-label font-medium text-slate-300 hover:text-amber-400 transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-amber-500 after:transition-all hover:after:w-full"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action Tools: Language Toggle + Profile Widget + Contact */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <LanguageToggle />

            {/* Profile Dropdown Widget */}
            <ProfileWidget onOpenAdminLogin={onOpenAdminLogin} isAdmin={isAdmin} />

            {/* Contact Button */}
            <button
              onClick={onOpenContact}
              className="hidden sm:flex px-4 py-2 border border-amber-500/60 hover:border-amber-400 bg-transparent hover:bg-amber-500/10 text-amber-400 hover:text-amber-300 font-bold text-xs font-label transition-all active:scale-95 items-center gap-2"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{t({ es: 'Contacto', en: 'Contact' })}</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              aria-label={t({ es: 'Abrir menú de navegación', en: 'Toggle navigation menu' })}
              aria-expanded={mobileMenuOpen}
              aria-controls={mobileMenuOpen ? 'mobile-nav' : undefined}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-nav" className="lg:hidden glass-panel border-t border-slate-800/80 px-6 py-6 mt-3 space-y-4 animate-slide-down">
          <nav className="flex flex-col gap-4" aria-label="Principal (móvil)">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-label font-medium text-slate-200 hover:text-amber-400 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenContact();
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>{t({ es: 'Contacto', en: 'Contact' })}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
