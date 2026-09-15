import React, { useState } from 'react';
import { X, Plus, Trash2, LogOut, Check, Sparkles, FolderGit2, Cpu, User, Loader2, Save, Pencil, ChevronUp, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { SkillCategory, Project, SkillItem } from '../types/portfolio';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  saveSkillToSupabase,
  updateSkillInSupabase,
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

  // Loading & notification state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Skill state
  const [editingSkillOldName, setEditingSkillOldName] = useState<string | null>(null);
  const [newSkillName, setNewSkillName] = useState('');
  const [selectedCatId, setSelectedCatId] = useState(skillCategories[0]?.id || 'backend');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');
  const [isPrimary, setIsPrimary] = useState(false);

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

  if (!isOpen) return null;

  const triggerSuccess = (msg?: string) => {
    setStatusMessage(msg || (language === 'es' ? '¡Cambios guardados correctamente!' : 'Changes saved successfully!'));
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setStatusMessage(null);
    }, 3000);
  };

  // ----------------------------------------------------------------------
  // SKILL HANDLERS
  // ----------------------------------------------------------------------

  const handleStartEditSkill = (catId: string, skill: SkillItem) => {
    setEditingSkillOldName(skill.name);
    setSelectedCatId(catId);
    setNewSkillName(skill.name);
    setNewSkillLevel(skill.level || 'Intermediate');
    setIsPrimary(Boolean(skill.isPrimary));
  };

  const handleCancelEditSkill = () => {
    setEditingSkillOldName(null);
    setNewSkillName('');
    setIsPrimary(false);
  };

  const handleSaveSkillForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    setIsSaving(true);
    const skillObj = { name: newSkillName.trim(), level: newSkillLevel, isPrimary };

    let dbSuccess = false;
    if (editingSkillOldName) {
      // Edit existing skill
      if (isSupabaseConfigured) {
        dbSuccess = await updateSkillInSupabase(editingSkillOldName, selectedCatId, skillObj);
      }

      const updated = skillCategories.map((cat) => {
        // remove old skill from whichever category it was in
        const filteredSkills = cat.skills.filter((s) => s.name !== editingSkillOldName);
        if (cat.id === selectedCatId) {
          return {
            ...cat,
            skills: [...filteredSkills, skillObj],
          };
        }
        return { ...cat, skills: filteredSkills };
      });
      onUpdateSkills(updated);
      setEditingSkillOldName(null);
    } else {
      // Create new skill
      if (isSupabaseConfigured) {
        dbSuccess = await saveSkillToSupabase(selectedCatId, skillObj);
      }

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
    }

    setNewSkillName('');
    setIsSaving(false);
    triggerSuccess(dbSuccess ? 'Skill guardado en Supabase' : 'Skill guardado en local');
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

  const handleMoveSkill = (catId: string, index: number, direction: 'up' | 'down') => {
    const updated = skillCategories.map((cat) => {
      if (cat.id === catId) {
        const skillsCopy = [...cat.skills];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= skillsCopy.length) return cat;

        const temp = skillsCopy[index];
        skillsCopy[index] = skillsCopy[targetIndex];
        skillsCopy[targetIndex] = temp;
        return { ...cat, skills: skillsCopy };
      }
      return cat;
    });

    onUpdateSkills(updated);
    triggerSuccess('Orden de habilidades actualizado');
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

  const handleSaveProjectForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim()) return;

    setIsSaving(true);
    const updatedProj: Project = {
      id: editingProjectId || `proj-${Date.now()}`,
      title: projectTitle,
      tagline: { es: projectTaglineEs || projectTitle, en: projectTaglineEn || projectTitle },
      summary: { es: projectSummaryEs, en: projectSummaryEn },
      role: { es: projectRoleEs, en: projectRoleEn },
      period: projectPeriod,
      stack: projectStack.split(',').map((s) => s.trim()).filter(Boolean),
      platforms: ['Web'],
      image: projectImage,
      demoUrl: projectDemoUrl || undefined,
      repoUrl: projectRepoUrl || undefined,
      highlights: [],
    };

    let dbSuccess = false;
    if (isSupabaseConfigured) {
      dbSuccess = await upsertProjectToSupabase(updatedProj);
    }

    let updatedList: Project[];
    if (editingProjectId) {
      updatedList = projects.map((p) => (p.id === editingProjectId ? updatedProj : p));
    } else {
      updatedList = [updatedProj, ...projects];
    }

    onUpdateProjects(updatedList);
    setShowProjectForm(false);
    setEditingProjectId(null);
    setIsSaving(false);
    triggerSuccess(dbSuccess ? 'Proyecto guardado en Supabase' : 'Proyecto actualizado localmente');
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

  const handleMoveProject = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const listCopy = [...projects];
    const temp = listCopy[index];
    listCopy[index] = listCopy[targetIndex];
    listCopy[targetIndex] = temp;

    onUpdateProjects(listCopy);

    // Sync order to Supabase if configured
    if (isSupabaseConfigured) {
      listCopy.forEach((p) => upsertProjectToSupabase(p));
    }
    triggerSuccess('Orden de proyectos actualizado');
  };

  // ----------------------------------------------------------------------
  // PROFILE HANDLER
  // ----------------------------------------------------------------------
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
                  : (language === 'es' ? 'Modo Local' : 'Local Mode')}
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
              {/* Add / Edit Skill Form */}
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                    {editingSkillOldName ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {editingSkillOldName
                      ? (language === 'es' ? `Editar Skill: "${editingSkillOldName}"` : `Edit Skill: "${editingSkillOldName}"`)
                      : (language === 'es' ? 'Agregar Nueva Habilidad' : 'Add New Skill')}
                  </h3>
                  {editingSkillOldName && (
                    <button
                      onClick={handleCancelEditSkill}
                      className="text-xs text-slate-400 hover:text-white underline"
                    >
                      {language === 'es' ? 'Cancelar Edición' : 'Cancel Edit'}
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveSkillForm} className="space-y-3">
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
                        <option value="Básico / Basic">Básico / Basic</option>
                        <option value="Intermedio / Intermediate">Intermedio / Intermediate</option>
                        <option value="Avanzado / Advanced">Avanzado / Advanced</option>
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
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingSkillOldName ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {editingSkillOldName
                      ? (language === 'es' ? 'Guardar Cambios de Skill' : 'Save Skill Changes')
                      : (language === 'es' ? 'Añadir Habilidad' : 'Add Skill')}
                  </button>
                </form>
              </div>

              {/* List skills per category with edit & reordering controls */}
              <div className="space-y-4">
                {skillCategories.map((cat) => (
                  <div key={cat.id} className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      {t(cat.category)} ({cat.skills.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {cat.skills.map((skill, idx) => (
                        <div
                          key={skill.name}
                          className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs flex items-center gap-2 group hover:border-cyan-500/40"
                        >
                          <span className="text-slate-200 font-medium">{skill.name}</span>
                          {skill.level && (
                            <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                              {skill.level}
                            </span>
                          )}

                          {/* Controls: Reorder Up/Down, Edit, Delete */}
                          <div className="flex items-center gap-1 ml-1 pl-1 border-l border-slate-800">
                            <button
                              onClick={() => handleMoveSkill(cat.id, idx, 'up')}
                              disabled={idx === 0}
                              className="text-slate-500 hover:text-cyan-400 disabled:opacity-20"
                              title="Mover arriba"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveSkill(cat.id, idx, 'down')}
                              disabled={idx === cat.skills.length - 1}
                              className="text-slate-500 hover:text-cyan-400 disabled:opacity-20"
                              title="Mover abajo"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleStartEditSkill(cat.id, skill)}
                              className="text-slate-500 hover:text-amber-400 transition-colors"
                              title="Editar skill"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSkill(cat.id, skill.name)}
                              disabled={isSaving}
                              className="text-slate-500 hover:text-rose-400 transition-colors disabled:opacity-50"
                              title="Eliminar skill"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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
                        <span className="text-[10px] text-slate-500 font-mono">#{idx + 1}</span>
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
