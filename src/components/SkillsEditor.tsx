import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  pointerWithin,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Loader2, Pencil, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { saveSkillChangesToSupabase } from '../lib/supabaseService';
import {
  diffSkills,
  fromDraft,
  hasSummaryChanges,
  isSkillEdited,
  newSkillKey,
  toDraft,
  type DraftCategory,
  type DraftSkill,
  type SkillChangeSummary,
} from '../lib/skillChanges';
import type { SkillCategory } from '../types/portfolio';

const LEVELS = ['Básico / Basic', 'Intermedio / Intermediate', 'Avanzado / Advanced'];

// With a mouse or finger the drop target is the chip under the pointer. The
// keyboard has no pointer (and a pointer can sit in a gap between chips), so
// fall back to closestCorners, which matches sortableKeyboardCoordinates and
// copes with chips of different widths.
const collisionDetection: CollisionDetection = (args) => {
  const underPointer = pointerWithin(args);
  return underPointer.length > 0 ? underPointer : closestCorners(args);
};
const DEFAULT_LEVEL = LEVELS[1];

interface SkillsEditorProps {
  skillCategories: SkillCategory[];
  onUpdateSkills: (updatedCategories: SkillCategory[]) => void;
  onReloadFromDb?: () => Promise<void> | void;
  onDirtyChange: (dirty: boolean) => void;
  showStatus: (message: string, type?: 'success' | 'error') => void;
}

// ----------------------------------------------------------------------
// Sortable chip
// ----------------------------------------------------------------------

interface SkillChipProps {
  skill: DraftSkill;
  state: 'new' | 'edited' | null;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const SkillChip: React.FC<SkillChipProps> = ({ skill, state, isEditing, onEdit, onDelete }) => {
  const { t } = useLanguage();
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: skill.key });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`relative px-2 py-1.5 bg-slate-950 border rounded-lg text-xs flex items-center gap-1.5 ${
        isDragging ? 'z-10 shadow-xl shadow-cyan-500/20 border-cyan-400 opacity-90' : ''
      } ${
        isEditing
          ? 'border-cyan-400 ring-1 ring-cyan-400/50'
          : state
            ? 'border-amber-500/60'
            : 'border-slate-800 hover:border-cyan-500/40'
      }`}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        {...attributes}
        {...listeners}
        className="text-slate-400 hover:text-cyan-400 cursor-grab active:cursor-grabbing touch-none p-0.5 rounded"
        aria-label={t({ es: `Reordenar ${skill.name}`, en: `Reorder ${skill.name}` })}
      >
        <GripVertical className="w-3.5 h-3.5" aria-hidden="true" />
      </button>

      <span className="text-slate-200 font-medium">{skill.name}</span>
      {skill.level && (
        <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">{skill.level}</span>
      )}
      {state && (
        <span className="text-[10px] font-semibold text-amber-400">
          {state === 'new' ? t({ es: 'nueva', en: 'new' }) : t({ es: 'editada', en: 'edited' })}
        </span>
      )}

      <div className="flex items-center gap-1 ml-1 pl-1.5 border-l border-slate-800">
        <button
          type="button"
          onClick={onEdit}
          className="text-slate-400 hover:text-amber-400 transition-colors p-0.5 rounded"
          aria-label={t({ es: `Editar ${skill.name}`, en: `Edit ${skill.name}` })}
        >
          <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="text-slate-400 hover:text-rose-400 transition-colors p-0.5 rounded"
          aria-label={t({ es: `Quitar ${skill.name}`, en: `Remove ${skill.name}` })}
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
};

// ----------------------------------------------------------------------
// Editor
// ----------------------------------------------------------------------

export const SkillsEditor: React.FC<SkillsEditorProps> = ({
  skillCategories,
  onUpdateSkills,
  onReloadFromDb,
  onDirtyChange,
  showStatus,
}) => {
  const { t, language } = useLanguage();

  // `baseline` is what was loaded, `draft` is what the admin is editing. Both
  // come from the same toDraft() call so they share the client keys.
  const [baseline, setBaseline] = useState<DraftCategory[]>(() => toDraft(skillCategories));
  const [draft, setDraft] = useState<DraftCategory[]>(baseline);
  const [loadedFrom, setLoadedFrom] = useState(skillCategories);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [skillName, setSkillName] = useState('');
  const [categoryId, setCategoryId] = useState(skillCategories[0]?.id ?? '');
  const [level, setLevel] = useState(DEFAULT_LEVEL);
  const [isPrimary, setIsPrimary] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { changes, summary } = useMemo(() => diffSkills(baseline, draft), [baseline, draft]);
  const dirty = hasSummaryChanges(summary);

  // When fresh data arrives from the app (initial Supabase load or the reload
  // after saving), start over from it unless there are unsaved edits.
  const resetPending = useRef(false);
  useEffect(() => {
    if (skillCategories === loadedFrom) return;
    if (!dirty || resetPending.current) {
      resetPending.current = false;
      const fresh = toDraft(skillCategories);
      setBaseline(fresh);
      setDraft(fresh);
      setLoadedFrom(skillCategories);
    }
  }, [skillCategories, loadedFrom, dirty]);

  // Keep the category selector on a category that still exists.
  useEffect(() => {
    if (draft.length > 0 && !draft.some((cat) => cat.id === categoryId)) setCategoryId(draft[0].id);
  }, [draft, categoryId]);

  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  // Warn before leaving the page with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const baselineByKey = useMemo(() => {
    const map = new Map<string, { categoryId: string; skill: DraftSkill }>();
    for (const cat of baseline) for (const skill of cat.skills) map.set(skill.key, { categoryId: cat.id, skill });
    return map;
  }, [baseline]);

  const chipState = (catId: string, skill: DraftSkill): 'new' | 'edited' | null => {
    const before = baselineByKey.get(skill.key);
    if (!before) return 'new';
    return isSkillEdited(before.skill, before.categoryId, skill, catId) ? 'edited' : null;
  };

  // ------------------------------------------------------------------ form
  const resetForm = () => {
    setEditingKey(null);
    setSkillName('');
    setLevel(DEFAULT_LEVEL);
    setIsPrimary(false);
    setFormError(null);
  };

  const startEdit = (catId: string, skill: DraftSkill) => {
    setEditingKey(skill.key);
    setCategoryId(catId);
    setSkillName(skill.name);
    setLevel(skill.level && LEVELS.includes(skill.level) ? skill.level : DEFAULT_LEVEL);
    setIsPrimary(Boolean(skill.isPrimary));
    setFormError(null);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const name = skillName.trim();
    if (!name) return;

    const duplicate = draft
      .find((cat) => cat.id === categoryId)
      ?.skills.some((s) => s.key !== editingKey && s.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      setFormError(t({ es: `Ya existe "${name}" en esa categoría.`, en: `"${name}" already exists in that category.` }));
      return;
    }

    setDraft((current) => {
      if (!editingKey) {
        const added: DraftSkill = { key: newSkillKey(), name, level, isPrimary };
        return current.map((cat) => (cat.id === categoryId ? { ...cat, skills: [...cat.skills, added] } : cat));
      }
      const fromCat = current.find((cat) => cat.skills.some((s) => s.key === editingKey));
      const existing = fromCat?.skills.find((s) => s.key === editingKey);
      if (!fromCat || !existing) return current;
      const updated: DraftSkill = { ...existing, name, level, isPrimary };

      return current.map((cat) => {
        if (cat.id === fromCat.id && cat.id === categoryId) {
          // Same category: edit in place, keep its position.
          return { ...cat, skills: cat.skills.map((s) => (s.key === editingKey ? updated : s)) };
        }
        if (cat.id === fromCat.id) return { ...cat, skills: cat.skills.filter((s) => s.key !== editingKey) };
        if (cat.id === categoryId) return { ...cat, skills: [...cat.skills, updated] };
        return cat;
      });
    });
    resetForm();
  };

  const handleDelete = (catId: string, key: string) => {
    setDraft((current) =>
      current.map((cat) => (cat.id === catId ? { ...cat, skills: cat.skills.filter((s) => s.key !== key) } : cat))
    );
    if (editingKey === key) resetForm();
  };

  // ------------------------------------------------------------------ drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (catId: string) => ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setDraft((current) =>
      current.map((cat) => {
        if (cat.id !== catId) return cat;
        const from = cat.skills.findIndex((s) => s.key === active.id);
        const to = cat.skills.findIndex((s) => s.key === over.id);
        return from < 0 || to < 0 ? cat : { ...cat, skills: arrayMove(cat.skills, from, to) };
      })
    );
  };

  const nameOf = (id: string | number) =>
    draft.flatMap((cat) => cat.skills).find((s) => s.key === id)?.name ?? '';
  const position = (id: string | number) => {
    const cat = draft.find((c) => c.skills.some((s) => s.key === id));
    return cat ? cat.skills.findIndex((s) => s.key === id) + 1 : 0;
  };
  const announcements: Announcements = {
    onDragStart: ({ active }) =>
      t({ es: `Tomaste ${nameOf(active.id)}.`, en: `Picked up ${nameOf(active.id)}.` }),
    onDragOver: ({ active, over }) =>
      over
        ? t({
            es: `${nameOf(active.id)} está en la posición ${position(over.id)}.`,
            en: `${nameOf(active.id)} is at position ${position(over.id)}.`,
          })
        : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? t({
            es: `Soltaste ${nameOf(active.id)} en la posición ${position(over.id)}. Falta guardar.`,
            en: `Dropped ${nameOf(active.id)} at position ${position(over.id)}. Not saved yet.`,
          })
        : undefined,
    onDragCancel: ({ active }) =>
      t({ es: `Cancelado. ${nameOf(active.id)} volvió a su lugar.`, en: `Cancelled. ${nameOf(active.id)} returned.` }),
  };
  const screenReaderInstructions = {
    draggable: t({
      es: 'Presioná espacio o Enter para tomar la skill, movela con las flechas y volvé a presionar espacio o Enter para soltarla. Escape cancela.',
      en: 'Press space or Enter to pick up the skill, move it with the arrow keys and press space or Enter again to drop it. Escape cancels.',
    }),
  };

  // ------------------------------------------------------------------ save
  const handleDiscard = () => {
    setDraft(baseline);
    resetForm();
  };

  const handleSave = async () => {
    if (!dirty || isSaving) return;
    setIsSaving(true);

    if (isSupabaseConfigured) {
      const ok = await saveSkillChangesToSupabase(changes);
      if (!ok) {
        setIsSaving(false);
        showStatus(
          t({
            es: 'No se guardó nada en Supabase (los cambios siguen acá para reintentar). Si tu sesión venció, cerrá sesión y volvé a entrar. Detalle en la consola.',
            en: 'Nothing was saved to Supabase (your changes are still here to retry). If your session expired, log out and back in. Details in the console.',
          }),
          'error'
        );
        return;
      }
      resetPending.current = true;
      await onReloadFromDb?.();
    } else {
      resetPending.current = true;
      onUpdateSkills(fromDraft(draft));
    }

    resetForm();
    setIsSaving(false);
    showStatus(
      isSupabaseConfigured
        ? t({ es: 'Cambios guardados en Supabase', en: 'Changes saved to Supabase' })
        : t({ es: 'Cambios guardados en local', en: 'Changes saved locally' })
    );
  };

  const describe = (s: SkillChangeSummary) => {
    const parts: string[] = [];
    const plural = (n: number, es: [string, string], en: [string, string]) =>
      `${n} ${language === 'es' ? es[n === 1 ? 0 : 1] : en[n === 1 ? 0 : 1]}`;
    if (s.added) parts.push(plural(s.added, ['agregada', 'agregadas'], ['added', 'added']));
    if (s.edited) parts.push(plural(s.edited, ['editada', 'editadas'], ['edited', 'edited']));
    if (s.deleted) parts.push(plural(s.deleted, ['borrada', 'borradas'], ['removed', 'removed']));
    if (s.reordered)
      parts.push(
        language === 'es'
          ? `orden cambiado en ${s.reordered} ${s.reordered === 1 ? 'categoría' : 'categorías'}`
          : `order changed in ${s.reordered} ${s.reordered === 1 ? 'category' : 'categories'}`
      );
    return parts.join(' · ');
  };

  // ------------------------------------------------------------------ render
  const editingSkill = editingKey ? draft.flatMap((cat) => cat.skills).find((s) => s.key === editingKey) : null;

  return (
    <div className="space-y-6">
      {/* Add / Edit Skill Form */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
            {editingSkill ? <Pencil className="w-4 h-4" aria-hidden="true" /> : <Plus className="w-4 h-4" aria-hidden="true" />}
            {editingSkill
              ? t({ es: `Editar skill: "${editingSkill.name}"`, en: `Edit skill: "${editingSkill.name}"` })
              : t({ es: 'Agregar nueva habilidad', en: 'Add new skill' })}
          </h3>
          {editingSkill && (
            <button type="button" onClick={resetForm} className="text-xs text-slate-400 hover:text-white underline">
              {t({ es: 'Cancelar edición', en: 'Cancel edit' })}
            </button>
          )}
        </div>

        <form onSubmit={handleSubmitForm} className="space-y-3">
          <div>
            <label htmlFor="skill-category" className="block text-xs text-slate-400 mb-1">
              {t({ es: 'Categoría', en: 'Category' })}
            </label>
            <select
              id="skill-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
            >
              {draft.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {t(cat.category)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="skill-name" className="block text-xs text-slate-400 mb-1">
                {t({ es: 'Nombre', en: 'Name' })}
              </label>
              <input
                id="skill-name"
                type="text"
                value={skillName}
                onChange={(e) => {
                  setSkillName(e.target.value);
                  setFormError(null);
                }}
                placeholder="Ej: Go, Docker, GraphQL"
                aria-invalid={Boolean(formError)}
                aria-describedby={formError ? 'skill-form-error' : undefined}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
              />
            </div>
            <div>
              <label htmlFor="skill-level" className="block text-xs text-slate-400 mb-1">
                {t({ es: 'Nivel', en: 'Level' })}
              </label>
              <select
                id="skill-level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
              >
                {LEVELS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="skill-primary"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
            />
            <label htmlFor="skill-primary" className="text-xs text-slate-300">
              {t({ es: 'Destacar como habilidad principal', en: 'Highlight as a primary skill' })}
            </label>
          </div>

          {formError && (
            <p id="skill-form-error" role="alert" className="text-xs text-rose-300">
              {formError}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            {editingSkill ? <Pencil className="w-4 h-4" aria-hidden="true" /> : <Plus className="w-4 h-4" aria-hidden="true" />}
            {editingSkill
              ? t({ es: 'Aplicar cambios a la skill', en: 'Apply skill changes' })
              : t({ es: 'Añadir habilidad', en: 'Add skill' })}
          </button>
        </form>
      </div>

      <p className="text-xs text-slate-400 flex items-center gap-1.5">
        <GripVertical className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        {t({
          es: 'Arrastrá desde el ícono para reordenar. Nada se guarda hasta que toques "Guardar cambios".',
          en: 'Drag from the handle to reorder. Nothing is saved until you press "Save changes".',
        })}
      </p>

      {/* Skills per category (sortable) */}
      <div className="space-y-4">
        {draft.map((cat) => (
          <section key={cat.id} className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-3" aria-labelledby={`skills-cat-${cat.id}`}>
            <h4 id={`skills-cat-${cat.id}`} className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {t(cat.category)} ({cat.skills.length})
            </h4>
            <DndContext
              sensors={sensors}
              collisionDetection={collisionDetection}
              onDragEnd={handleDragEnd(cat.id)}
              accessibility={{ announcements, screenReaderInstructions }}
            >
              <SortableContext items={cat.skills.map((s) => s.key)} strategy={rectSortingStrategy}>
                <ul className="flex flex-wrap gap-2">
                  {cat.skills.map((skill) => (
                    <SkillChip
                      key={skill.key}
                      skill={skill}
                      state={chipState(cat.id, skill)}
                      isEditing={editingKey === skill.key}
                      onEdit={() => startEdit(cat.id, skill)}
                      onDelete={() => handleDelete(cat.id, skill.key)}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
            {cat.skills.length === 0 && (
              <p className="text-xs text-slate-400">{t({ es: 'Sin skills.', en: 'No skills.' })}</p>
            )}
          </section>
        ))}
      </div>

      {/* Save bar */}
      <div
        className={`sticky bottom-0 -mx-6 -mb-6 px-6 py-3 border-t flex flex-wrap items-center justify-between gap-3 ${
          dirty ? 'bg-[#1c1608] border-amber-500/50' : 'bg-slate-950 border-slate-800'
        }`}
      >
        <p className="text-xs" aria-live="polite">
          {dirty ? (
            <>
              <span className="font-semibold text-amber-300">{t({ es: 'Cambios sin guardar: ', en: 'Unsaved changes: ' })}</span>
              <span className="text-slate-200">{describe(summary)}</span>
            </>
          ) : (
            <span className="text-slate-400">{t({ es: 'Sin cambios pendientes', en: 'No pending changes' })}</span>
          )}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDiscard}
            disabled={!dirty || isSaving}
            className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 border border-slate-700 hover:bg-slate-800 disabled:opacity-40 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            {t({ es: 'Descartar', en: 'Discard' })}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || isSaving}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:opacity-40 flex items-center gap-1.5"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <Save className="w-3.5 h-3.5" aria-hidden="true" />}
            {t({ es: 'Guardar cambios', en: 'Save changes' })}
          </button>
        </div>
      </div>
    </div>
  );
};
