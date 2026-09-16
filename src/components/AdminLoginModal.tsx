import React, { useState } from 'react';
import { X, Lock, ShieldCheck, Key, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDialog } from '../hooks/useDialog';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const dialogRef = useDialog(isOpen, onClose);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error(
          language === 'es'
            ? 'Supabase no está configurado. Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en Vercel.'
            : 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.'
        );
      }

      if (!email.trim()) {
        throw new Error(
          language === 'es'
            ? 'Ingresa tu correo registrado en Supabase Auth.'
            : 'Enter your registered Supabase Auth email.'
        );
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        throw new Error(
          language === 'es'
            ? `Credenciales de Supabase incorrectas: ${authError.message}`
            : `Invalid Supabase credentials: ${authError.message}`
        );
      }

      if (data?.session) {
        localStorage.setItem('elias_is_admin', 'true');
        onLoginSuccess();
        onClose();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error de autenticación';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-login-title"
        tabIndex={-1}
        className="relative w-full max-w-md bg-[#0d121f] border border-cyan-500/30 rounded-2xl shadow-2xl p-6 md:p-8 text-slate-100 overflow-hidden"
      >
        {/* Glow accent background */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 id="admin-login-title" className="text-xl font-bold font-jakarta text-slate-100 flex items-center gap-2">
                {language === 'es' ? 'Acceso de Administrador' : 'Admin Access'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'es' ? 'Autenticación estricta vía Supabase Auth' : 'Strict authentication via Supabase Auth'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
            aria-label={language === 'es' ? 'Cerrar' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Supabase status badge */}
        <div className="mb-6 p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-2.5 text-xs">
          <div className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
          <span className="text-slate-300">
            {isSupabaseConfigured
              ? (language === 'es' ? 'Conectado a Supabase Auth' : 'Connected to Supabase Auth')
              : (language === 'es' ? 'Supabase No Configurado' : 'Supabase Not Configured')}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Email Supabase Auth
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="contacto@eliaslazo.dev"
              className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 focus:border-cyan-500 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              {language === 'es' ? 'Contraseña Supabase' : 'Supabase Password'}
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 focus:border-cyan-500 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all pl-10"
              />
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" aria-hidden="true" />
            </div>
          </div>

          {error && (
            <div role="alert" className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-colors"
            >
              {language === 'es' ? 'Cancelar' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              {loading ? '...' : language === 'es' ? 'Ingresar' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
