import React, { useRef, useState } from 'react';
import { X, Plus, Trash2, LogOut, Check, AlertCircle, Sparkles, FolderGit2, Cpu, User, Loader2, Save, Pencil, ChevronUp, ChevronDown, Inbox } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { SkillCategory, Project } from '../types/portfolio';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  upsertProjectToSupabase,
  deleteProjectFromSupabase,
  saveProfileToSupabase,
} from '../lib/supabaseService';
import { ABOUT_DATA, HERO_DATA, PROFILE_DATA } from '../data/portfolioData';
import { SkillsEditor } from './SkillsEditor';
import { MessagesInbox } from './MessagesInbox';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  skillCategories: SkillCategory[];
  projects: Project[];
  onUpdateSkills: (updatedCategories: SkillCategory[]) => void;
  onUpdateProjects: (updatedProjects: Project[]) => void;
  onUpdateProfile?: () => void;
  onReloadFromDb?: () => Promise<void> | void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  onLogout,
  skillCategories,
  projects,
  onUpdateSkills,
  onUpdateProjects,
  onReloadFromDb,
}) => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'skills' | 'projects' | 'profile' | 'messages'>('skills');

  // Loading & notification state
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Unsaved changes in the skills editor (it keeps its own draft).
  const [skillsDirty, setSkillsDirty] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Project state
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectTaglineEs, setProjectTaglineEs] = useState('');
  const [projectTaglineEn, setProjectTaglineEn] = useState('');
  const [projectSummaryEs, setProjectSummaryEs] = useState('');
  const [projectSummaryEn, setProjectSummaryEn] = useState('');
  const [projectRoleEs, setProjectRoleEs] = useState('Creador & Desarrollador');
  const [projectRoleEn, setProjectRoleEn] = useState('Creator & Developer');
  const [projectPeriod, setProjectPeriod] = useState(new Date().getFullYear().toString());
  const [projectStack, setProjectStack] = useState('React, TypeScript, Tailwind');
  const [projectImage, setProjectImage] = useState('/assets/semanita_app_mockup.png');
  const [projectDemoUrl, setProjectDemoUrl] = useState('');
  const [projectRepoUrl, setProjectRepoUrl] = useState('');

  // Profile form state
  const [profileEmail, setProfileEmail] = useState(HERO_DATA.socials.email);
  const [profileGithub, setProfileGithub] = useState(HERO_DATA.socials.github);
  const [profileGitlab, setProfileGitlab] = useState(HERO_DATA.socials.gitlab);
  const [profileLinkedin, setProfileLinkedin] = useState(HERO_DATA.socials.linkedin);

  // All hooks must run before this early return (Rules of Hooks).
  if (!isOpen) return null;

  const showStatus = (message: string, type: 'success' | 'error' = 'success') => {
    if (statusTimer.current) clearTimeout(statusTimer.current);
    setStatus({ type, message });
    statusTimer.current = setTimeout(() => setStatus(null), type === 'error' ? 7000 : 3000);
  };

  // With Supabase configured the database is the source of truth: a change is
  // only applied to the panel after it was written, so nothing is shown that
  // the site would lose on the next reload. On failure the form keeps its
  // values so the change can be retried.
  const showDbError = () => {
    setIsSaving(false);
    showStatus(
      language === 'es'
        ? 'No se guardó en Supabase. Si tu sesión venció, cerrá sesión y volvé a entrar. Detalle en la consola.'
        : "Not saved to Supabase. If your session expired, log out and back in. Details in the console.",
      'error'
    );
  };

  const confirmDiscardSkills = () =>
    !skillsDirty ||
    window.confirm(
      language === 'es'
        ? 'Tenés cambios de skills sin guardar. ¿Descartarlos?'
        : 'You have unsaved skill changes. Discard them?'
    );

  const handleClose = () => {
    if (confirmDiscardSkills()) onClose();
  };

  const handleLogout = () => {
    if (confirmDiscardSkills()) onLogout();
  };

  // ----------------------------------------------------------------------
  // PROJECT HANDLERS
  // ----------------------------------------------------------------------

  const handleStartEditProject = (proj: Project) => {
    setEditingProjectId(proj.id);
    setProjectTitle(proj.title);
    setProjectTaglineEs(proj.tagline.es);
    setProjectTaglineEn(proj.tagline.en);
    setProjectSummaryEs(proj.summary.es);
    setProjectSummaryEn(proj.summary.en);
    setProjectRoleEs(proj.role.es);
    setProjectRoleEn(proj.role.en);
    setProjectPeriod(proj.period || new Date().getFullYear().toString());
    setProjectStack(proj.stack.join(', '));
    setProjectImage(proj.image);
    setProjectDemoUrl(proj.demoUrl || '');
    setProjectRepoUrl(proj.repoUrl || '');
    setShowProjectForm(true);
  };

  const handleResetProjectForm = () => {
    setEditingProjectId(null);
    setProjectTitle('');
    setProjectTaglineEs('');
    setProjectTaglineEn('');
    setProjectSummaryEs('');
    setProjectSummaryEn('');
    setProjectRoleEs('Creador & Desarrollador');
    setProjectRoleEn('Creator & Developer');
    setProjectPeriod(new Date().getFullYear().toString());
    setProjectStack('React, TypeScript, Tailwind');
    setProjectImage('/assets/semanita_app_mockup.png');
    setProjectDemoUrl('');
    setProjectRepoUrl('');
    setShowProjectForm(true);
  };

  // Writes every project back with its position as sort_order, which is the
  // column fetchProjectsFromSupabase() orders by.
  const syncProjectsToSupabase = async (list: Project[]): Promise<boolean> => {
    const results = await Promise.all(
      list.map((proj, index) => upsertProjectToSupabase(proj, index + 1))
    );
    return results.every(Boolean);
  };

  const handleSaveProjectForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim()) return;

    setIsSaving(true);
    const existingProject = editingProjectId
      ? projects.find((p) => p.id === editingProjectId)
      : undefined;

    const updatedProj: Project = {
      id: editingProjectId || `proj-${Date.now()}`,
      title: projectTitle,
      tagline: { es: projectTaglineEs || projectTitle, en: projectTaglineEn || projectTitle },
      summary: { es: projectSummaryEs, en: projectSummaryEn },
      role: { es: projectRoleEs, en: projectRoleEn },
      period: projectPeriod,
      stack: projectStack.split(',').map((s) => s.trim()).filter(Boolean),
      // The form does not edit platforms or the mobile flag either: keep the
      // stored values, otherwise saving Semanita would reset it to a web project.
      platforms: existingProject?.platforms || ['Web'],
      isMobileApp: existingProject?.isMobileApp ?? false,
      image: projectImage,
      demoUrl: projectDemoUrl || undefined,
      repoUrl: projectRepoUrl || undefined,
      // The form does not edit these two, so carry over whatever the project
      // already has instead of overwriting the stored content with empties.
      highlights: existingProject?.highlights || [],
      architectureOverview: existingProject?.architectureOverview,
    };

    let updatedList: Project[];
    if (editingProjectId) {
      updatedList = projects.map((p) => (p.id === editingProjectId ? updatedProj : p));
    } else {
      updatedList = [updatedProj, ...projects];
    }

    // Saving re-numbers the whole list: a new project is prepended, which shifts
    // the sort_order of every project after it.
    if (isSupabaseConfigured && !(await syncProjectsToSupabase(updatedList))) {
      return showDbError();
    }

    onUpdateProjects(updatedList);
    if (isSupabaseConfigured) await onReloadFromDb?.();
    setShowProjectForm(false);
    setEditingProjectId(null);
    setIsSaving(false);
    showStatus(isSupabaseConfigured ? 'Proyecto guardado en Supabase' : 'Proyecto actualizado localmente');
  };

  const handleDeleteProject = async (projId: string) => {
    if (!confirm(language === 'es' ? '¿Eliminar este proyecto?' : 'Delete this project?')) return;
    setIsSaving(true);
    if (isSupabaseConfigured && !(await deleteProjectFromSupabase(projId))) {
      return showDbError();
    }
    onUpdateProjects(projects.filter((p) => p.id !== projId));
    if (isSupabaseConfigured) await onReloadFromDb?.();
    setIsSaving(false);
    showStatus('Proyecto eliminado');
  };

  const handleMoveProject = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const listCopy = [...projects];
    const temp = listCopy[index];
    listCopy[index] = listCopy[targetIndex];
    listCopy[targetIndex] = temp;

    setIsSaving(true);
    if (isSupabaseConfigured && !(await syncProjectsToSupabase(listCopy))) {
      return showDbError();
    }

    onUpdateProjects(listCopy);
    if (isSupabaseConfigured) await onReloadFromDb?.();
    setIsSaving(false);
    showStatus('Orden de proyectos actualizado');
  };

  // ----------------------------------------------------------------------
  // PROFILE HANDLER
  // ----------------------------------------------------------------------
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (isSupabaseConfigured) {
      const ok = await saveProfileToSupabase({
        name: PROFILE_DATA.name,
        role_es: PROFILE_DATA.role.es,
        role_en: PROFILE_DATA.role.en,
        email: profileEmail,
        github_url: profileGithub,
        gitlab_url: profileGitlab,
        linkedin_url: profileLinkedin,
        avatar_url: PROFILE_DATA.avatar,
        location_es: PROFILE_DATA.location.es,
        location_en: PROFILE_DATA.location.en,
        education_es: PROFILE_DATA.education.es,
        education_en: PROFILE_DATA.education.en,
        // bio_* is NOT NULL, so it has to travel on the insert path. Send the
        // real bio instead of a placeholder, which would overwrite the stored one.
        bio_es: [ABOUT_DATA.bio.es, ABOUT_DATA.bioSecondary.es].join('\n\n'),
        bio_en: [ABOUT_DATA.bio.en, ABOUT_DATA.bioSecondary.en].join('\n\n'),
      });
      if (!ok) return showDbError();
    }

    HERO_DATA.socials.email = profileEmail;
    HERO_DATA.socials.github = profileGithub;
    HERO_DATA.socials.gitlab = profileGitlab;
    HERO_DATA.socials.linkedin = profileLinkedin;
    if (isSupabaseConfigured) await onReloadFromDb?.();

    setIsSaving(false);
    showStatus(isSupabaseConfigured ? 'Perfil guardado en Supabase' : 'Perfil actualizado');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0d0d0c] border-l border-cyan-500/30 h-full flex flex-col text-slate-100 shadow-2xl animate-drawer-in">
        {/* Header */}
        <div className="p-6 bg-slate-900/90 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                {language === 'es' ? 'Panel de Administración' : 'Admin Management Panel'}
              </h2>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {isSupabaseConfigured
                  ? (language === 'es' ? 'Sincronizado con Supabase Production' : 'Synced with Supabase Production')
                  : (language === 'es' ? 'Modo Local' : 'Local Mode')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-rose-500/20"
            >
              <LogOut className="w-4 h-4" />
              <span>{language === 'es' ? 'Salir' : 'Logout'}</span>
            </button>
            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl transition-colors"
              aria-label={language === 'es' ? 'Cerrar panel' : 'Close panel'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-2 sm:px-6 pt-3 gap-1 sm:gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('skills')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-t border-x shrink-0 whitespace-nowrap ${
              activeTab === 'skills'
                ? 'bg-[#0d0d0c] border-cyan-500/40 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span className="sm:hidden">Skills</span>
            <span className="hidden sm:inline">{language === 'es' ? 'Habilidades (Skills)' : 'Skills'}</span>
            {skillsDirty && (
              <span
                className="w-2 h-2 rounded-full bg-amber-400"
                title={language === 'es' ? 'Cambios sin guardar' : 'Unsaved changes'}
                aria-label={language === 'es' ? 'Cambios sin guardar' : 'Unsaved changes'}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-t border-x shrink-0 whitespace-nowrap ${
              activeTab === 'projects'
                ? 'bg-[#0d0d0c] border-cyan-500/40 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            {language === 'es' ? 'Proyectos' : 'Projects'}
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-t border-x shrink-0 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-[#0d0d0c] border-cyan-500/40 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="sm:hidden">{language === 'es' ? 'Perfil' : 'Profile'}</span>
            <span className="hidden sm:inline">{language === 'es' ? 'Perfil & Contacto' : 'Profile & Contact'}</span>
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-t border-x shrink-0 whitespace-nowrap ${
              activeTab === 'messages'
                ? 'bg-[#0d0d0c] border-cyan-500/40 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Inbox className="w-4 h-4" />
            {language === 'es' ? 'Mensajes' : 'Messages'}
            {unreadMessages > 0 && (
              <span
                className="min-w-[1.25rem] px-1 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-bold leading-none text-center"
                aria-label={language === 'es' ? `${unreadMessages} sin leer` : `${unreadMessages} unread`}
              >
                {unreadMessages}
              </span>
            )}
          </button>
        </div>

        {/* Status Notification */}
        {status && (
          <div
            role={status.type === 'error' ? 'alert' : 'status'}
            className={`mx-6 mt-4 p-3 rounded-xl text-xs flex items-center gap-2 animate-fade-in border ${
              status.type === 'error'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}
          >
            {status.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            ) : (
              <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
            )}
            <span>{status.message}</span>
          </div>
        )}

        {/* Tab Content */}
        <div
          className="flex-1 overflow-y-auto p-6 space-y-6"
          tabIndex={0}
          role="region"
          aria-label={language === 'es' ? 'Contenido del panel' : 'Panel content'}
        >
          {/* SKILLS TAB */}
          {/* Kept mounted while other tabs are open so its unsaved draft survives
              switching tabs; it's only hidden. */}
          <div hidden={activeTab !== 'skills'}>
            <SkillsEditor
              skillCategories={skillCategories}
              onUpdateSkills={onUpdateSkills}
              onReloadFromDb={onReloadFromDb}
              onDirtyChange={setSkillsDirty}
              showStatus={showStatus}
            />
          </div>

          <div hidden={activeTab !== 'messages'}>
            <MessagesInbox onUnreadChange={setUnreadMessages} showStatus={showStatus} />
          </div>

          {/* PROJECTS TAB */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-200">
                  Proyectos ({projects.length})
                </h3>
                <button
                  onClick={handleResetProjectForm}
                  className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400 text-xs rounded-lg font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {language === 'es' ? 'Nuevo Proyecto' : 'New Project'}
                </button>
              </div>

              {/* Add / Edit Project Form */}
              {showProjectForm && (
                <form onSubmit={handleSaveProjectForm} className="p-4 bg-slate-900/80 border border-cyan-500/30 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      {editingProjectId
                        ? (language === 'es' ? 'Editar Proyecto Existente' : 'Edit Existing Project')
                        : (language === 'es' ? 'Nuevo Proyecto para Supabase' : 'New Project for Supabase')}
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProjectForm(false);
                        setEditingProjectId(null);
                      }}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Título del Proyecto</label>
                    <input
                      type="text"
                      required
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      placeholder="Ej: Kairos API, Semanita..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Subtítulo (ES)</label>
                      <input
                        type="text"
                        value={projectTaglineEs}
                        onChange={(e) => setProjectTaglineEs(e.target.value)}
                        placeholder="Descripción corta en español"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Subtítulo (EN)</label>
                      <input
                        type="text"
                        value={projectTaglineEn}
                        onChange={(e) => setProjectTaglineEn(e.target.value)}
                        placeholder="Short description in English"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Resumen (ES)</label>
                    <textarea
                      rows={2}
                      value={projectSummaryEs}
                      onChange={(e) => setProjectSummaryEs(e.target.value)}
                      placeholder="Detalles del proyecto..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Rol (ES)</label>
                      <input
                        type="text"
                        value={projectRoleEs}
                        onChange={(e) => setProjectRoleEs(e.target.value)}
                        placeholder="Creador & Desarrollador"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Rol (EN)</label>
                      <input
                        type="text"
                        value={projectRoleEn}
                        onChange={(e) => setProjectRoleEn(e.target.value)}
                        placeholder="Creator & Developer"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">URL Imagen</label>
                    <input
                      type="text"
                      value={projectImage}
                      onChange={(e) => setProjectImage(e.target.value)}
                      placeholder="/assets/semanita_app_mockup.png"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Tecnologías (separadas por coma)</label>
                      <input
                        type="text"
                        value={projectStack}
                        onChange={(e) => setProjectStack(e.target.value)}
                        placeholder="FastAPI, PostgreSQL, Docker"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Año / Período</label>
                      <input
                        type="text"
                        value={projectPeriod}
                        onChange={(e) => setProjectPeriod(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {editingProjectId
                      ? (language === 'es' ? 'Guardar Cambios del Proyecto' : 'Save Project Changes')
                      : (language === 'es' ? 'Guardar Nuevo Proyecto' : 'Save New Project')}
                  </button>
                </form>
              )}

              {/* Projects list with edit, delete & reorder */}
              <div className="space-y-3">
                {projects.map((proj, idx) => (
                  <div key={proj.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between group hover:border-cyan-500/40 transition-colors">
                    <div>
                      <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-2">
                        {proj.title}
                        <span className="text-[10px] text-slate-400 font-mono">#{idx + 1}</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{t(proj.tagline)}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {proj.stack.map((tech) => (
                          <span key={tech} className="text-[9px] px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 rounded font-mono">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleMoveProject(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-slate-500 hover:text-cyan-400 disabled:opacity-20 transition-colors"
                        title="Mover arriba"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveProject(idx, 'down')}
                        disabled={idx === projects.length - 1}
                        className="p-1 text-slate-500 hover:text-cyan-400 disabled:opacity-20 transition-colors"
                        title="Mover abajo"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStartEditProject(proj)}
                        className="p-1 text-slate-500 hover:text-amber-400 transition-colors"
                        title="Editar proyecto"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(proj.id)}
                        disabled={isSaving}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors disabled:opacity-50"
                        title="Eliminar proyecto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROFILE & CONTACT TAB */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-4">
              <h3 className="text-sm font-semibold text-slate-200">
                {language === 'es' ? 'Email de Contacto & Redes Sociales' : 'Contact Email & Social Links'}
              </h3>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Email Principal de Contacto</label>
                <input
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">URL GitHub</label>
                <input
                  type="url"
                  value={profileGithub}
                  onChange={(e) => setProfileGithub(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">URL GitLab</label>
                <input
                  type="url"
                  value={profileGitlab}
                  onChange={(e) => setProfileGitlab(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">URL LinkedIn</label>
                <input
                  type="url"
                  value={profileLinkedin}
                  onChange={(e) => setProfileLinkedin(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {language === 'es' ? 'Guardar Cambios en Supabase' : 'Save Changes to Supabase'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
