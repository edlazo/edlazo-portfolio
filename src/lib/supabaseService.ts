import { supabase, isSupabaseConfigured } from './supabase';
import type { SkillCategory, Project } from '../types/portfolio';

export interface DbProfile {
  id?: string;
  name: string;
  role_es: string;
  role_en: string;
  email: string;
  github_url: string;
  gitlab_url: string;
  linkedin_url: string;
  avatar_url: string;
  location_es: string;
  location_en: string;
  education_es: string;
  education_en: string;
  bio_es: string;
  bio_en: string;
}

// ----------------------------------------------------------------------
// ID HELPERS
// Supabase rows are keyed by UUID, but the local fallback data in
// portfolioData.ts uses readable ids ('backend', 'semanita', 'proj-1736...').
// Those are matched against the `slug` column instead of the primary key.
// ----------------------------------------------------------------------

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value?: string): boolean {
  return Boolean(value && UUID_PATTERN.test(value));
}

async function resolveCategoryId(categoryId: string): Promise<string | null> {
  if (isUuid(categoryId)) return categoryId;
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('skill_categories')
    .select('id')
    .eq('slug', categoryId)
    .maybeSingle();

  if (error || !data) {
    console.error('Could not resolve category slug in Supabase:', categoryId, error);
    return null;
  }
  return data.id as string;
}

// Row Level Security does not raise an error when it blocks an UPDATE or
// DELETE (for example, an expired admin session): the request succeeds and
// simply affects zero rows. Every write therefore asks for the affected rows
// back and treats an empty result as a failure.
function affectedRows(label: string, data: unknown[] | null): boolean {
  if (data && data.length > 0) return true;
  console.error(
    `${label}: 0 rows affected. The admin session may have expired (RLS) or no row matched.`
  );
  return false;
}

// ----------------------------------------------------------------------
// SKILLS OPERATIONS
// ----------------------------------------------------------------------

export async function fetchSkillsFromSupabase(): Promise<SkillCategory[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data: categories, error: catError } = await supabase
      .from('skill_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (catError || !categories || categories.length === 0) return null;

    const { data: skills, error: skillError } = await supabase
      .from('skills')
      .select('*')
      .order('sort_order', { ascending: true });

    if (skillError) return null;

    const formatted: SkillCategory[] = categories.map((cat: any) => ({
      id: cat.id,
      category: {
        es: cat.category_es,
        en: cat.category_en,
      },
      description: {
        es: cat.description_es,
        en: cat.description_en,
      },
      icon: cat.icon || 'Cpu',
      skills: (skills || [])
        .filter((s: any) => s.category_id === cat.id)
        .map((s: any) => ({
          name: s.name,
          level: s.level_es ? `${s.level_es} / ${s.level_en}` : s.level_en,
          isPrimary: s.is_primary || false,
        })),
    }));

    return formatted;
  } catch (e) {
    console.warn('Error fetching skills from Supabase:', e);
    return null;
  }
}

export async function saveSkillToSupabase(
  categoryId: string,
  skill: { name: string; level: string; isPrimary?: boolean },
  sortOrder?: number
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const levelParts = skill.level.split('/');
    const level_es = levelParts[0]?.trim() || skill.level;
    const level_en = levelParts[1]?.trim() || levelParts[0]?.trim() || skill.level;

    const resolvedCategoryId = await resolveCategoryId(categoryId);
    if (!resolvedCategoryId) return false;

    const { data, error } = await supabase
      .from('skills')
      .insert({
        category_id: resolvedCategoryId,
        name: skill.name,
        level_es,
        level_en,
        is_primary: skill.isPrimary || false,
        ...(typeof sortOrder === 'number' ? { sort_order: sortOrder } : {}),
      })
      .select('id');

    if (error) {
      console.error('Error inserting skill in Supabase:', error);
      return false;
    }
    return affectedRows('Insert skill', data);
  } catch (e) {
    console.error('Failed to save skill to Supabase:', e);
    return false;
  }
}

export async function updateSkillInSupabase(
  oldName: string,
  oldCategoryId: string,
  categoryId: string,
  skill: { name: string; level: string; isPrimary?: boolean }
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const levelParts = skill.level.split('/');
    const level_es = levelParts[0]?.trim() || skill.level;
    const level_en = levelParts[1]?.trim() || levelParts[0]?.trim() || skill.level;

    // Scope by the category the skill currently lives in: names are only unique
    // within a category, so filtering by name alone would hit homonyms elsewhere.
    const [resolvedOldCategoryId, resolvedCategoryId] = await Promise.all([
      resolveCategoryId(oldCategoryId),
      resolveCategoryId(categoryId),
    ]);
    if (!resolvedOldCategoryId || !resolvedCategoryId) return false;

    const { data, error } = await supabase
      .from('skills')
      .update({
        category_id: resolvedCategoryId,
        name: skill.name,
        level_es,
        level_en,
        is_primary: skill.isPrimary || false,
      })
      .eq('name', oldName)
      .eq('category_id', resolvedOldCategoryId)
      .select('id');

    if (error) {
      console.error('Error updating skill in Supabase:', error);
      return false;
    }
    return affectedRows('Update skill', data);
  } catch (e) {
    console.error('Failed to update skill in Supabase:', e);
    return false;
  }
}

export async function deleteSkillFromSupabase(
  skillName: string,
  categoryId: string
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const resolvedCategoryId = await resolveCategoryId(categoryId);
    if (!resolvedCategoryId) return false;

    const { data, error } = await supabase
      .from('skills')
      .delete()
      .eq('name', skillName)
      .eq('category_id', resolvedCategoryId)
      .select('id');

    if (error) {
      console.error('Error deleting skill from Supabase:', error);
      return false;
    }
    return affectedRows('Delete skill', data);
  } catch (e) {
    console.error('Failed to delete skill from Supabase:', e);
    return false;
  }
}

export async function reorderSkillsInSupabase(
  categoryId: string,
  orderedNames: string[]
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const resolvedCategoryId = await resolveCategoryId(categoryId);
    if (!resolvedCategoryId) return false;
    const client = supabase;

    const results = await Promise.all(
      orderedNames.map(async (name, index) => {
        const { data, error } = await client
          .from('skills')
          .update({ sort_order: index + 1 })
          .eq('name', name)
          .eq('category_id', resolvedCategoryId)
          .select('id');
        if (error) {
          console.error('Error reordering skill in Supabase:', name, error);
          return false;
        }
        return affectedRows(`Reorder skill "${name}"`, data);
      })
    );
    return results.every(Boolean);
  } catch (e) {
    console.error('Failed to reorder skills in Supabase:', e);
    return false;
  }
}

// ----------------------------------------------------------------------
// PROJECTS OPERATIONS
// ----------------------------------------------------------------------

export async function fetchProjectsFromSupabase(): Promise<Project[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !projects || projects.length === 0) return null;

    const formatted: Project[] = projects.map((p: any) => ({
      id: p.id,
      title: p.title,
      tagline: {
        es: p.tagline_es,
        en: p.tagline_en,
      },
      summary: {
        es: p.summary_es,
        en: p.summary_en,
      },
      role: {
        es: p.role_es,
        en: p.role_en,
      },
      period: p.period,
      stack: p.stack || [],
      platforms: p.platforms || [],
      isMobileApp: Boolean(p.is_mobile_app),
      image: p.image_url,
      demoUrl: p.demo_url || undefined,
      repoUrl: p.repo_url || undefined,
      highlights: Array.isArray(p.highlights) ? p.highlights : [],
      architectureOverview: p.architecture_overview || undefined,
    }));

    return formatted;
  } catch (e) {
    console.warn('Error fetching projects from Supabase:', e);
    return null;
  }
}

export async function upsertProjectToSupabase(
  project: Project,
  sortOrder?: number
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const payload: any = {
      title: project.title,
      tagline_es: project.tagline.es,
      tagline_en: project.tagline.en,
      summary_es: project.summary.es,
      summary_en: project.summary.en,
      role_es: project.role.es,
      role_en: project.role.en,
      period: project.period,
      stack: project.stack,
      platforms: project.platforms,
      is_mobile_app: Boolean(project.isMobileApp),
      image_url: project.image,
      demo_url: project.demoUrl,
      repo_url: project.repoUrl,
      highlights: project.highlights || [],
      architecture_overview: project.architectureOverview || null,
    };

    if (typeof sortOrder === 'number') {
      payload.sort_order = sortOrder;
    }

    // A UUID id means the row came from the database, so upsert on the primary
    // key. Anything else is a local id ('semanita', 'proj-1736...') and is
    // matched against the slug column, which is unique.
    let query;
    if (isUuid(project.id)) {
      payload.id = project.id;
      query = supabase.from('projects').upsert(payload).select('id');
    } else {
      payload.slug = project.id;
      query = supabase.from('projects').upsert(payload, { onConflict: 'slug' }).select('id');
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error upserting project in Supabase:', error);
      return false;
    }
    return affectedRows(`Upsert project "${project.title}"`, data);
  } catch (e) {
    console.error('Failed to upsert project in Supabase:', e);
    return false;
  }
}

export async function deleteProjectFromSupabase(projectId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const { data, error } = await supabase
      .from('projects')
      .delete()
      .eq(isUuid(projectId) ? 'id' : 'slug', projectId)
      .select('id');
    if (error) {
      console.error('Error deleting project from Supabase:', error);
      return false;
    }
    return affectedRows('Delete project', data);
  } catch (e) {
    console.error('Failed to delete project from Supabase:', e);
    return false;
  }
}

// ----------------------------------------------------------------------
// PROFILE OPERATIONS
// ----------------------------------------------------------------------

export async function fetchProfileFromSupabase(): Promise<DbProfile | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return data as DbProfile;
  } catch (e) {
    console.warn('Error fetching profile from Supabase:', e);
    return null;
  }
}

export async function saveProfileToSupabase(profile: Partial<DbProfile>): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const existing = await fetchProfileFromSupabase();
    const { data, error } = existing?.id
      ? await supabase
          .from('profile')
          .update({ ...profile, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select('id')
      : await supabase.from('profile').insert(profile).select('id');
    if (error) throw error;
    return affectedRows('Save profile', data);
  } catch (e) {
    console.error('Error saving profile to Supabase:', e);
    return false;
  }
}
