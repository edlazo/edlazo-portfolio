import React, { useState } from 'react';
import { X, Plus, Trash2, LogOut, Check, Sparkles, FolderGit2, Cpu, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { SkillCategory, Project } from '../types/portfolio';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  skillCategories: SkillCategory[];
  projects: Project[];
  onUpdateSkills: (updatedCategories: SkillCategory[]) => void;
  onUpdateProjects: (updatedProjects: Project[]) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  onLogout,
  skillCategories,
  projects,
  onUpdateSkills,
}) => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'skills' | 'projects' | 'profile'>('skills');

  // Skill editing state
  const [newSkillName, setNewSkillName] = useState('');
  const [selectedCatId, setSelectedCatId] = useState(skillCategories[0]?.id || 'backend');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');
  const [isPrimary, setIsPrimary] = useState(false);

  // Success message state
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const updated = skillCategories.map((cat) => {
      if (cat.id === selectedCatId) {
        return {
          ...cat,
          skills: [
            ...cat.skills,
            { name: newSkillName.trim(), level: newSkillLevel, isPrimary },
          ],
        };
      }
      return cat;
    });

    onUpdateSkills(updated);
    setNewSkillName('');
    triggerSuccess();
  };

  const handleDeleteSkill = (catId: string, skillName: string) => {
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
    triggerSuccess();
  };

  const triggerSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
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
              <p className="text-xs text-slate-400">
                {language === 'es' ? 'Gestión de contenido en vivo & Supabase' : 'Live & Supabase Content Management'}
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
            {language === 'es' ? 'Perfil & Links' : 'Profile & Links'}
          </button>
        </div>

        {/* Status indicator */}
        {saveSuccess && (
          <div className="mx-6 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4" />
            <span>{language === 'es' ? '¡Cambios guardados correctamente!' : 'Changes saved successfully!'}</span>
          </div>
        )}

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
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
                    className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    {language === 'es' ? 'Añadir Habilidad' : 'Add Skill'}
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
                            className="text-slate-500 hover:text-rose-400 transition-colors ml-1"
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

          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
                <h3 className="text-sm font-semibold text-slate-200 mb-3">Proyectos Existentes ({projects.length})</h3>
                <div className="space-y-3">
                  {projects.map((proj) => (
                    <div key={proj.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-cyan-400">{proj.title}</h4>
                        <p className="text-[11px] text-slate-400">{t(proj.tagline)}</p>
                      </div>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
                        Activo
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-4">
              <h3 className="text-sm font-semibold text-slate-200">URLs y Links Sociales</h3>
              <p className="text-xs text-slate-400">
                Podés actualizar estos enlaces en `portfolioData.ts` o sincronizarlos directamente con Supabase.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
