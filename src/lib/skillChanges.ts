import type { SkillCategory, SkillItem } from '../types/portfolio';

// ----------------------------------------------------------------------
// Draft model for the admin skills editor. Edits, deletions and reordering
// are applied to a local draft and only sent to Supabase when the admin
// presses "Guardar cambios". This module compares the baseline (what was
// loaded) with the draft and builds the payload expected by the
// `save_skills` database function.
// ----------------------------------------------------------------------

export interface DraftSkill extends SkillItem {
  /** Stable client-side key: the database id, or a temporary one otherwise. */
  key: string;
}

export interface DraftCategory extends Omit<SkillCategory, 'skills'> {
  skills: DraftSkill[];
}

export interface SkillRow {
  category_id: string;
  name: string;
  level_es: string;
  level_en: string;
  is_primary: boolean;
  sort_order: number;
}

export interface SkillChanges {
  deleted: string[];
  updated: (SkillRow & { id: string })[];
  inserted: SkillRow[];
}

export interface SkillChangeSummary {
  added: number;
  edited: number;
  deleted: number;
  /** Number of categories whose order changed. */
  reordered: number;
}

let tempCounter = 0;
export const newSkillKey = () => `new-${Date.now()}-${++tempCounter}`;

export function toDraft(categories: SkillCategory[]): DraftCategory[] {
  return categories.map((cat) => ({
    ...cat,
    skills: cat.skills.map((skill) => ({ ...skill, key: skill.id ?? newSkillKey() })),
  }));
}

export function fromDraft(draft: DraftCategory[]): SkillCategory[] {
  return draft.map((cat) => ({
    ...cat,
    skills: cat.skills.map(({ key: _key, ...skill }) => skill),
  }));
}

/** 'Intermedio / Intermediate' -> ['Intermedio', 'Intermediate'] */
export function splitLevel(level?: string): [string, string] {
  const [es, en] = (level || '').split('/').map((part) => part.trim());
  const fallback = es || 'Intermedio';
  return [fallback, en || fallback];
}

export function isSkillEdited(before: SkillItem, beforeCategoryId: string, after: SkillItem, afterCategoryId: string) {
  const [esBefore, enBefore] = splitLevel(before.level);
  const [esAfter, enAfter] = splitLevel(after.level);
  return (
    beforeCategoryId !== afterCategoryId ||
    before.name !== after.name ||
    esBefore !== esAfter ||
    enBefore !== enAfter ||
    Boolean(before.isPrimary) !== Boolean(after.isPrimary)
  );
}

const toRow = (categoryId: string, skill: SkillItem, sortOrder: number): SkillRow => {
  const [level_es, level_en] = splitLevel(skill.level);
  return {
    category_id: categoryId,
    name: skill.name,
    level_es,
    level_en,
    is_primary: Boolean(skill.isPrimary),
    sort_order: sortOrder,
  };
};

export function diffSkills(
  baseline: DraftCategory[],
  draft: DraftCategory[]
): { changes: SkillChanges; summary: SkillChangeSummary } {
  const original = new Map<string, { categoryId: string; skill: DraftSkill }>();
  for (const cat of baseline) {
    for (const skill of cat.skills) original.set(skill.key, { categoryId: cat.id, skill });
  }
  const draftKeys = new Set(draft.flatMap((cat) => cat.skills.map((s) => s.key)));

  const changes: SkillChanges = { deleted: [], updated: [], inserted: [] };
  const summary: SkillChangeSummary = { added: 0, edited: 0, deleted: 0, reordered: 0 };

  for (const cat of draft) {
    const baseSkills = baseline.find((c) => c.id === cat.id)?.skills ?? [];
    const inCategory = (key: string) => cat.skills.some((s) => s.key === key);

    // Relative order of the skills this category kept from the baseline.
    const keptOrder = baseSkills.map((s) => s.key).filter(inCategory);
    const draftOrder = cat.skills.map((s) => s.key).filter((key) => keptOrder.includes(key));
    const reordered = keptOrder.join('|') !== draftOrder.join('|');
    if (reordered) summary.reordered++;

    const edited = (skill: DraftSkill) => {
      const before = original.get(skill.key);
      return Boolean(before && isSkillEdited(before.skill, before.categoryId, skill, cat.id));
    };
    const touched =
      reordered ||
      cat.skills.some((s) => !original.has(s.key) || edited(s)) ||
      baseSkills.some((s) => !inCategory(s.key));

    cat.skills.forEach((skill, index) => {
      const sortOrder = index + 1;
      const row = toRow(cat.id, skill, sortOrder);

      if (!original.has(skill.key)) {
        changes.inserted.push(row);
        summary.added++;
        return;
      }

      const isEdited = edited(skill);
      if (isEdited) summary.edited++;

      // Positions are only rewritten in categories the admin changed; there
      // they are normalized to 1..n, which also closes gaps left by earlier
      // deletions. Untouched categories never produce writes.
      const basePosition = baseSkills.findIndex((s) => s.key === skill.key) + 1;
      const positionChanged =
        touched && (basePosition !== sortOrder || (skill.sortOrder !== undefined && skill.sortOrder !== sortOrder));

      if ((isEdited || positionChanged) && skill.id) {
        changes.updated.push({ id: skill.id, ...row });
      }
    });
  }

  for (const [key, { skill }] of original) {
    if (!draftKeys.has(key)) {
      summary.deleted++;
      if (skill.id) changes.deleted.push(skill.id);
    }
  }

  return { changes, summary };
}

export const hasSummaryChanges = ({ added, edited, deleted, reordered }: SkillChangeSummary) =>
  added + edited + deleted + reordered > 0;
