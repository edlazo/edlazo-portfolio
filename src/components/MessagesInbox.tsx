import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Loader2, Mail, MailOpen, RefreshCw, Reply, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  deleteContactMessage,
  fetchContactMessages,
  setContactMessageRead,
  type ContactMessage,
} from '../lib/contactMessages';

interface MessagesInboxProps {
  onUnreadChange: (unread: number) => void;
  showStatus: (message: string, type?: 'success' | 'error') => void;
}

const PREVIEW_LENGTH = 280;

export const MessagesInbox: React.FC<MessagesInboxProps> = ({ onUnreadChange, showStatus }) => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState('loading');
    const result = await fetchContactMessages();
    if (result) {
      setMessages(result);
      setState('ready');
    } else {
      setState('error');
    }
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured) load();
  }, [load]);

  useEffect(() => {
    onUnreadChange(messages.filter((m) => !m.is_read).length);
  }, [messages, onUnreadChange]);

  const sessionError = () =>
    showStatus(
      t({
        es: 'No se pudo actualizar el mensaje. Si tu sesión venció, cerrá sesión y volvé a entrar.',
        en: "The message couldn't be updated. If your session expired, log out and back in.",
      }),
      'error'
    );

  const toggleRead = async (message: ContactMessage) => {
    setBusyId(message.id);
    const ok = await setContactMessageRead(message.id, !message.is_read);
    setBusyId(null);
    if (!ok) return sessionError();
    setMessages((current) => current.map((m) => (m.id === message.id ? { ...m, is_read: !m.is_read } : m)));
  };

  const remove = async (message: ContactMessage) => {
    const confirmed = window.confirm(
      t({ es: `¿Borrar el mensaje de ${message.name}?`, en: `Delete the message from ${message.name}?` })
    );
    if (!confirmed) return;
    setBusyId(message.id);
    const ok = await deleteContactMessage(message.id);
    setBusyId(null);
    if (!ok) return sessionError();
    setMessages((current) => current.filter((m) => m.id !== message.id));
    showStatus(t({ es: 'Mensaje borrado', en: 'Message deleted' }));
  };

  const toggleExpanded = (id: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(language === 'es' ? 'es-AR' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(iso)
    );

  if (!isSupabaseConfigured) {
    return (
      <p className="text-xs text-slate-400">
        {t({ es: 'Supabase no está configurado: no hay mensajes para mostrar.', en: 'Supabase is not configured: there are no messages to show.' })}
      </p>
    );
  }

  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-400" aria-live="polite">
          {state === 'ready' &&
            (language === 'es'
              ? `${messages.length} ${messages.length === 1 ? 'mensaje' : 'mensajes'} · ${unread} sin leer`
              : `${messages.length} ${messages.length === 1 ? 'message' : 'messages'} · ${unread} unread`)}
        </p>
        <button
          type="button"
          onClick={load}
          disabled={state === 'loading'}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 border border-slate-700 hover:bg-slate-800 disabled:opacity-40 flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${state === 'loading' ? 'animate-spin' : ''}`} aria-hidden="true" />
          {t({ es: 'Actualizar', en: 'Refresh' })}
        </button>
      </div>

      {state === 'loading' && messages.length === 0 && (
        <p className="text-xs text-slate-400 flex items-center gap-2" role="status">
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          {t({ es: 'Cargando mensajes…', en: 'Loading messages…' })}
        </p>
      )}

      {state === 'error' && (
        <p role="alert" className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {t({
            es: 'No se pudieron cargar los mensajes. Verificá que la tabla contact_messages exista (supabase_schema.sql) y que tu sesión siga activa.',
            en: "Messages couldn't be loaded. Check that the contact_messages table exists (supabase_schema.sql) and your session is still active.",
          })}
        </p>
      )}

      {state === 'ready' && messages.length === 0 && (
        <p className="text-xs text-slate-400">{t({ es: 'Todavía no hay mensajes.', en: 'No messages yet.' })}</p>
      )}

      <ul className="space-y-3">
        {messages.map((message) => {
          const isLong = message.message.length > PREVIEW_LENGTH;
          const isExpanded = expanded.has(message.id);
          const body = isLong && !isExpanded ? `${message.message.slice(0, PREVIEW_LENGTH)}…` : message.message;
          const replySubject = encodeURIComponent(
            `Re: ${message.project_type ?? t({ es: 'tu mensaje en eliaslazo.dev', en: 'your message on eliaslazo.dev' })}`
          );

          return (
            <li
              key={message.id}
              className={`p-4 rounded-xl border space-y-2 ${
                message.is_read ? 'bg-slate-900/40 border-slate-800/80' : 'bg-cyan-500/5 border-cyan-500/30'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-100 flex items-center gap-2 flex-wrap">
                    {message.name}
                    {!message.is_read && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                        {t({ es: 'Nuevo', en: 'New' })}
                      </span>
                    )}
                    {!message.email_sent && (
                      <span
                        className="text-[10px] font-semibold text-amber-300 flex items-center gap-1"
                        title={t({
                          es: 'El mensaje quedó guardado, pero el aviso por email no se pudo enviar.',
                          en: 'The message was saved, but the email notification failed.',
                        })}
                      >
                        <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                        {t({ es: 'email no enviado', en: 'email not sent' })}
                      </span>
                    )}
                  </p>
                  <a href={`mailto:${message.email}`} className="text-xs text-cyan-300 hover:underline break-all">
                    {message.email}
                  </a>
                </div>
                <time dateTime={message.created_at} className="text-[11px] text-slate-400 shrink-0">
                  {formatDate(message.created_at)}
                </time>
              </div>

              {message.project_type && (
                <p className="text-[11px] font-mono text-amber-300">{message.project_type}</p>
              )}

              <p className="text-xs text-slate-200 whitespace-pre-wrap break-words">{body}</p>
              {isLong && (
                <button
                  type="button"
                  onClick={() => toggleExpanded(message.id)}
                  aria-expanded={isExpanded}
                  className="text-xs text-cyan-300 hover:underline"
                >
                  {isExpanded ? t({ es: 'Ver menos', en: 'Show less' }) : t({ es: 'Ver completo', en: 'Show all' })}
                </button>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
                <a
                  href={`mailto:${message.email}?subject=${replySubject}`}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-950 bg-cyan-500 hover:bg-cyan-400 flex items-center gap-1.5"
                >
                  <Reply className="w-3.5 h-3.5" aria-hidden="true" />
                  {t({ es: 'Responder', en: 'Reply' })}
                </a>
                <button
                  type="button"
                  onClick={() => toggleRead(message)}
                  disabled={busyId === message.id}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 border border-slate-700 hover:bg-slate-800 disabled:opacity-40 flex items-center gap-1.5"
                >
                  {message.is_read ? (
                    <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <MailOpen className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  {message.is_read
                    ? t({ es: 'Marcar como no leído', en: 'Mark as unread' })
                    : t({ es: 'Marcar como leído', en: 'Mark as read' })}
                </button>
                <button
                  type="button"
                  onClick={() => remove(message)}
                  disabled={busyId === message.id}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-300 border border-rose-500/30 hover:bg-rose-500/10 disabled:opacity-40 flex items-center gap-1.5 ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  {t({ es: 'Borrar', en: 'Delete' })}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
