import React, { useState } from 'react';
import { X, Plus, Trash2, LogOut, Check, Sparkles, FolderGit2, Cpu, User, Loader2, Save } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { SkillCategory, Project } from '../types/portfolio';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  saveSkillToSupabase,
  deleteSkillFromSupabase,
  upsertProjectToSupabase,
  deleteProjectFromSupabase,
  saveProfileToSupabase,
} from '../lib/supabaseService';
import { HERO_DATA, PROFILE_DATA } from '../data/portfolioData';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  skillCategories: SkillCategory[];
  projects: Project[];
  onUpdateSkills: (updatedCategories: SkillCategory[]) => void;
  onUpdateProjects: (updatedProjects: Project[]) => void;
  onUpdateProfile?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  onLogout,
  skillCategories,
  projects,
  onUpdateSkills,
  onUpdateProjects,
}) => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'skills' | 'projects' | 'profile'>('skills');

  // Loading & feedback state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Skill editing state
  const [newSkillName, setNewSkillName] = useState('');
  const [selectedCatId, setSelectedCatId] = useState(skillCategories[0]?.id || 'backend');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');
  const [isPrimary, setIsPrimary] = useState(false);

  // Project form state
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

  // Profile form state
  const [profileEmail, setProfileEmail] = useState(HERO_DATA.socials.email);
  const [profileGithub, setProfileGithub] = useState(HERO_DATA.socials.github);
  const [profileGitlab, setProfileGitlab] = useState(HERO_DATA.socials.gitlab);
  const [profileLinkedin, setProfileLinkedin] = useState(HERO_DATA.socials.linkedin);

  if (!isOpen) return null;

  const triggerSuccess = (msg?: string) => {
    setStatusMessage(msg || (language === 'es' ? '¡Cambios guardados correctamente!' : 'Changes saved successfully!'));
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setStatusMessage(null);
    }, 3000);
  };

  // --- HANDLERS FOR SKILLS ---
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    setIsSaving(true);
    const skillObj = { name: newSkillName.trim(), level: newSkillLevel, isPrimary };

    // 1. Update Supabase if configured
    let dbSuccess = false;
    if (isSupabaseConfigured) {
      dbSuccess = await saveSkillToSupabase(selectedCatId, skillObj);
    }

    // 2. Update local state
    const updated = skillCategories.map((cat) => {
      if (cat.id === selectedCatId) {
        return {
          ...cat,
          skills: [...cat.skills, skillObj],
        };
      }
      return cat;
    });

    onUpdateSkills(updated);
    setNewSkillName('');
    setIsSaving(false);
    triggerSuccess(dbSuccess ? 'Skill guardado en Supabase y sitio local' : 'Skill guardado localmente');
  };

  const handleDeleteSkill = async (catId: string, skillName: string) => {
    setIsSaving(true);
    if (isSupabaseConfigured) {
      await deleteSkillFromSupabase(skillName);
    }

    const updated = skillCategories.map((cat) => {
      if (cat.id === catId) {
        return {
          ...cat,
          skills: cat.skills.filter((s) => s.name !== skillName),
        };
      }
      return cat;
    });
    onUpdateSkills(updated);
    setIsSaving(false);
    triggerSuccess('Skill eliminado');
  };

  // --- HANDLERS FOR PROJECTS ---
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim()) return;

    setIsSaving(true);
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: projectTitle,
      tagline: { es: projectTaglineEs || projectTitle, en: projectTaglineEn || projectTitle },
      summary: { es: projectSummaryEs, en: projectSummaryEn },
      role: { es: projectRoleEs, en: projectRoleEn },
      period: projectPeriod,
      stack: projectStack.split(',').map((s) => s.trim()).filter(Boolean),
      platforms: ['Web'],
      image: projectImage,
      highlights: [],
    };

    let dbSuccess = false;
    if (isSupabaseConfigured) {
      dbSuccess = await upsertProjectToSupabase(newProj);
    }

    const updated = [newProj, ...projects];
    onUpdateProjects(updated);
    setShowProjectForm(false);
    setProjectTitle('');
    setProjectTaglineEs('');
    setProjectTaglineEn('');
    setProjectSummaryEs('');
    setProjectSummaryEn('');
    setIsSaving(false);
    triggerSuccess(dbSuccess ? 'Proyecto guardado en Supabase' : 'Proyecto guardado localmente');
  };

  const handleDeleteProject = async (projId: string) => {
    if (!confirm(language === 'es' ? '¿Eliminar este proyecto?' : 'Delete this project?')) return;
    setIsSaving(true);
    if (isSupabaseConfigured) {
      await deleteProjectFromSupabase(projId);
    }
    const updated = projects.filter((p) => p.id !== projId);
    onUpdateProjects(updated);
    setIsSaving(false);
    triggerSuccess('Proyecto eliminado');
  };

  // --- HANDLERS FOR PROFILE ---
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    HERO_DATA.socials.email = profileEmail;
    HERO_DATA.socials.github = profileGithub;
    HERO_DATA.socials.gitlab = profileGitlab;
    HERO_DATA.socials.linkedin = profileLinkedin;

    let dbSuccess = false;
    if (isSupabaseConfigured) {
      dbSuccess = await saveProfileToSupabase({
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
        bio_es: 'Ingeniero Backend & Fullstack',
        bio_en: 'Backend & Fullstack Engineer',
      });
    }

    setIsSaving(false);
    triggerSuccess(dbSuccess ? 'Perfil guardado en Supabase' : 'Perfil actualizado');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0b0f19] border-l border-cyan-500/30 h-full flex flex-col text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="p-6 bg-slate-900/90 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-jakarta text-slate-100">
                {language === 'es' ? 'Panel de Administración' : 'Admin Management Panel'}
              </h2>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {isSupabaseConfigured
                  ? (language === 'es' ? 'Sincronizado con Supabase Production' : 'Synced with Supabase Production')
                  : (language === 'es' ? 'Modo Local Demo' : 'Local Demo Mode')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-rose-500/20"
            >
              <LogOut className="w-4 h-4" />
              <span>{language === 'es' ? 'Salir' : 'Logout'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('skills')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-t border-x ${
              activeTab === 'skills'
                ? 'bg-[#0b0f19] border-cyan-500/40 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            {language === 'es' ? 'Habilidades (Skills)' : 'Skills'}
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-t border-x ${
              activeTab === 'projects'
                ? 'bg-[#0b0f19] border-cyan-500/40 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            {language === 'es' ? 'Proyectos' : 'Projects'}
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-t border-x ${
              activeTab === 'profile'
                ? 'bg-[#0b0f19] border-cyan-500/40 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            {language === 'es' ? 'Perfil & Contacto' : 'Profile & Contact'}
          </button>
        </div>

        {/* Status Notification */}
        {saveSuccess && (
          <div className="mx-6 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* SKILLS TAB */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              {/* Add Skill Form */}
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
                <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  {language === 'es' ? 'Agregar Nueva Habilidad' : 'Add New Skill'}
                </h3>
                <form onSubmit={handleAddSkill} className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Categoría</label>
                    <select
                      value={selectedCatId}
                      onChange={(e) => setSelectedCatId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                    >
                      {skillCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {t(cat.category)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Nombre Skill</label>
                      <input
                        type="text"
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        placeholder="Ej: Go, Docker, GraphQL"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Nivel</label>
                      <select
                        value={newSkillLevel}
                        onChange={(e) => setNewSkillLevel(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                      >
                        <option value="Basic">Basic / Básico</option>
                        <option value="Intermediate">Intermediate / Intermedio</option>
                        <option value="Advanced">Advanced / Avanzado</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="isPrimary"
                      checked={isPrimary}
                      onChange={(e) => setIsPrimary(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                    />
                    <label htmlFor="isPrimary" className="text-xs text-slate-300">
                      Destacar como habilidad principal
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {language === 'es' ? 'Guardar Habilidad (Supabase)' : 'Save Skill (Supabase)'}
                  </button>
                </form>
              </div>

              {/* List skills per category */}
              <div className="space-y-4">
                {skillCategories.map((cat) => (
                  <div key={cat.id} className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      {t(cat.category)} ({cat.skills.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {cat.skills.map((skill) => (
                        <div
                          key={skill.name}
                          className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs flex items-center gap-2 group hover:border-cyan-500/40"
                        >
                          <span className="text-slate-200">{skill.name}</span>
                          {skill.level && (
                            <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                              {skill.level}
                            </span>
                          )}
                          <button
                            onClick={() => handleDeleteSkill(cat.id, skill.name)}
                            disabled={isSaving}
                            className="text-slate-500 hover:text-rose-400 transition-colors ml-1 disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROJECTS TAB */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-200">
                  Proyectos ({projects.length})
                </h3>
                <button
                  onClick={() => setShowProjectForm(!showProjectForm)}
                  className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400 text-xs rounded-lg font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showProjectForm ? (language === 'es' ? 'Cerrar Formulario' : 'Close Form') : (language === 'es' ? 'Nuevo Proyecto' : 'New Project')}
                </button>
              </div>

              {/* Add Project Form */}
              {showProjectForm && (
                <form onSubmit={handleAddProject} className="p-4 bg-slate-900/80 border border-cyan-500/30 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    {language === 'es' ? 'Nuevo Proyecto para Supabase' : 'New Project for Supabase'}
                  </h4>

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
                      <label className="block text-xs text-slate-400 mb-1">Tecnologías Stack (separadas por coma)</label>
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
                    {language === 'es' ? 'Guardar Proyecto en Supabase' : 'Save Project to Supabase'}
                  </button>
                </form>
              )}

              {/* Projects list */}
              <div className="space-y-3">
                {projects.map((proj) => (
                  <div key={proj.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-cyan-400">{proj.title}</h4>
                      <p className="text-[11px] text-slate-400">{t(proj.tagline)}</p>
                      <div className="flex gap-1.5 mt-1.5">
                        {proj.stack.map((tech) => (
                          <span key={tech} className="text-[9px] px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 rounded font-mono">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteProject(proj.id)}
                      disabled={isSaving}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                      title="Eliminar proyecto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
