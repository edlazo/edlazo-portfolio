import React, { useEffect, useRef, useState } from 'react';
import { X, Mail, Copy, Check, Send, Loader2, AlertCircle } from 'lucide-react';
import { HERO_DATA } from '../data/portfolioData';
import { useLanguage } from '../context/LanguageContext';
import { useDialog } from '../hooks/useDialog';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SendStatus = 'idle' | 'sending' | 'success' | 'error';
type SendError = 'invalid' | 'rate_limited' | 'failed';

const EMPTY_FORM = { name: '', email: '', role: 'Backend / API Architecture', message: '' };

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<SendStatus>('idle');
  const [error, setError] = useState<{ kind: SendError; fields: string[] } | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  // Honeypot: invisible to people, bots tend to fill every field.
  const [website, setWebsite] = useState('');
  const openedAt = useRef(0);
  const statusRef = useRef(status);
  statusRef.current = status;

  const dialogRef = useDialog(isOpen, onClose);

  // Runs only when the modal opens or closes. The fill timer must not restart
  // on a failed send, or a quick retry would be taken for a bot and dropped.
  useEffect(() => {
    if (isOpen) {
      openedAt.current = Date.now();
      return;
    }
    // A sent message is cleared when the modal closes; an unsent draft is kept.
    if (statusRef.current === 'success') {
      setFormData(EMPTY_FORM);
      setWebsite('');
    }
    if (statusRef.current !== 'sending') setStatus('idle');
    setError(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(HERO_DATA.socials.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          projectType: formData.role,
          message: formData.message,
          language,
          website,
          elapsedMs: Date.now() - openedAt.current,
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (response.ok && result.ok) {
        setStatus('success');
        return;
      }
      setStatus('error');
      if (response.status === 400) setError({ kind: 'invalid', fields: result.fields ?? [] });
      else if (response.status === 429) setError({ kind: 'rate_limited', fields: [] });
      else setError({ kind: 'failed', fields: [] });
    } catch {
      setStatus('error');
      setError({ kind: 'failed', fields: [] });
    }
  };

  const fieldNames: Record<string, { es: string; en: string }> = {
    name: { es: 'nombre', en: 'name' },
    email: { es: 'correo electrónico', en: 'email address' },
    message: { es: 'mensaje (entre 10 y 5000 caracteres)', en: 'message (10 to 5000 characters)' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        tabIndex={-1}
        className="relative w-full max-w-lg glass-panel bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 animate-dialog-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
          <div>
            <h3 id="contact-modal-title" className="text-2xl font-extrabold text-white font-heading">
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
            aria-label={t({ es: 'Cerrar', en: 'Close' })}
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
            aria-label={t({ es: 'Copiar correo al portapapeles', en: 'Copy email to clipboard' })}
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
        {status === 'success' ? (
          <div className="py-12 text-center space-y-3 animate-fade-in" role="status" aria-live="polite">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white font-heading">
              {t({ es: '¡Mensaje Enviado!', en: 'Message Transmitted!' })}
            </h4>
            <p className="text-xs text-slate-400">
              {t({ es: 'Gracias por escribirme. Me pondré en contacto muy pronto.', en: 'Thank you for reaching out. I will respond shortly.' })}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              {t({ es: 'Cerrar', en: 'Close' })}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 relative">
            <div>
              <label htmlFor="contact-name" className="block text-xs font-mono text-slate-300 mb-1">
                {t({ es: 'TU NOMBRE', en: 'YOUR NAME' })}
              </label>
              <input
                id="contact-name"
                type="text"
                required
                maxLength={100}
                autoComplete="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Alex Morgan"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/60 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="contact-email" className="block text-xs font-mono text-slate-300 mb-1">
                {t({ es: 'CORREO ELECTRÓNICO', en: 'EMAIL ADDRESS' })}
              </label>
              <input
                id="contact-email"
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="alex@company.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/60 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="contact-role" className="block text-xs font-mono text-slate-300 mb-1">
                {t({ es: 'TIPO DE PROYECTO', en: 'PROJECT / ROLE TYPE' })}
              </label>
              <select
                id="contact-role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/60 transition-colors"
              >
                <option value="Backend / API Architecture">Backend / API Architecture</option>
                <option value="React Native Mobile App">React Native Mobile App</option>
                <option value="AI Integration & Optimization">AI Integration & Optimization</option>
                <option value="Fullstack Development">Fullstack Development</option>
              </select>
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-xs font-mono text-slate-300 mb-1">
                {t({ es: 'DETALLES DEL MENSAJE', en: 'MESSAGE DETAILS' })}
              </label>
              <textarea
                id="contact-message"
                required
                minLength={10}
                maxLength={5000}
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={t({ es: 'Describe brevemente tu idea u oportunidad...', en: 'Briefly describe your project or opportunities...' })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/60 transition-colors resize-none"
              />
            </div>

            {/* Honeypot, hidden from people and assistive technology */}
            <div className="absolute w-px h-px -m-px overflow-hidden [clip:rect(0,0,0,0)]" aria-hidden="true">
              <label htmlFor="contact-website">Website</label>
              <input
                id="contact-website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            {error && (
              <div role="alert" className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <p>
                  {error.kind === 'invalid' &&
                    `${t({ es: 'Revisá estos campos: ', en: 'Please check: ' })}${
                      error.fields.map((f) => (fieldNames[f] ? t(fieldNames[f]) : f)).join(', ') ||
                      t({ es: 'los datos del formulario', en: 'the form fields' })
                    }.`}
                  {error.kind === 'rate_limited' &&
                    t({
                      es: 'Recibí varios mensajes seguidos desde tu conexión. Probá de nuevo en unos minutos o escribime a ',
                      en: 'Several messages arrived in a row from your connection. Try again in a few minutes or email me at ',
                    })}
                  {error.kind === 'failed' &&
                    t({
                      es: 'No se pudo enviar el mensaje. Probá de nuevo o escribime directamente a ',
                      en: "The message couldn't be sent. Try again or email me directly at ",
                    })}
                  {error.kind !== 'invalid' && (
                    <>
                      <a href={`mailto:${HERO_DATA.socials.email}`} className="underline text-rose-100">
                        {HERO_DATA.socials.email}
                      </a>
                      .
                    </>
                  )}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg hover:shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait"
            >
              {status === 'sending' ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="w-4 h-4" aria-hidden="true" />
              )}
              <span>
                {status === 'sending'
                  ? t({ es: 'Enviando…', en: 'Sending…' })
                  : t({ es: 'Enviar Mensaje', en: 'Send Message' })}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
