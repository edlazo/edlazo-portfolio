import React, { useState, useEffect } from 'react';
import { X, Mail, Copy, Check, Send } from 'lucide-react';
import { HERO_DATA } from '../data/portfolioData';
import { useLanguage } from '../context/LanguageContext';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Backend / API Architecture',
    message: '',
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(HERO_DATA.socials.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      setFormData({ name: '', email: '', role: 'Backend / API Architecture', message: '' });
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg glass-panel bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
          <div>
            <h3 className="text-2xl font-extrabold text-white font-heading">
              {t({ es: 'Ponte en Contacto', en: 'Get in Touch' })}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {t({
                es: 'Disponible para desarrollo backend, aplicaciones e integraciones de IA.',
                en: 'Available for backend development, mobile apps, and AI integrations.',
              })}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Email Copy Bar */}
        <div className="mb-6 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Mail className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs font-mono text-slate-200 truncate">
              {HERO_DATA.socials.email}
            </span>
          </div>

          <button
            onClick={handleCopyEmail}
            className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-mono flex items-center gap-1.5 transition-colors shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">{t({ es: '¡Copiado!', en: 'Copied!' })}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{t({ es: 'Copiar', en: 'Copy' })}</span>
              </>
            )}
          </button>
        </div>

        {/* Message Form */}
        {submitted ? (
          <div className="py-12 text-center space-y-3 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white font-heading">
              {t({ es: '¡Mensaje Enviado!', en: 'Message Transmitted!' })}
            </h4>
            <p className="text-xs text-slate-400">
              {t({ es: 'Gracias por escribirme. Me pondré en contacto muy pronto.', en: 'Thank you for reaching out. I will respond shortly.' })}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                {t({ es: 'TU NOMBRE', en: 'YOUR NAME' })}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Alex Morgan"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-amber-500/60 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                {t({ es: 'CORREO ELECTRÓNICO', en: 'EMAIL ADDRESS' })}
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="alex@company.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-amber-500/60 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                {t({ es: 'TIPO DE PROYECTO', en: 'PROJECT / ROLE TYPE' })}
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-amber-500/60 transition-colors"
              >
                <option value="Backend / API Architecture">Backend / API Architecture</option>
                <option value="React Native Mobile App">React Native Mobile App</option>
                <option value="AI Integration & Optimization">AI Integration & Optimization</option>
                <option value="Fullstack Development">Fullstack Development</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                {t({ es: 'DETALLES DEL MENSAJE', en: 'MESSAGE DETAILS' })}
              </label>
              <textarea
                required
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={t({ es: 'Describe brevemente tu idea u oportunidad...', en: 'Briefly describe your project or opportunities...' })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-amber-500/60 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg hover:shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              <span>{t({ es: 'Enviar Mensaje', en: 'Send Message' })}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
