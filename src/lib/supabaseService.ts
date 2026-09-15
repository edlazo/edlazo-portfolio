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
  skill: { name: string; level: string; isPrimary?: boolean }
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const levelParts = skill.level.split('/');
    const level_es = levelParts[0]?.trim() || skill.level;
    const level_en = levelParts[1]?.trim() || levelParts[0]?.trim() || skill.level;

    const { error } = await supabase.from('skills').insert({
      category_id: categoryId,
      name: skill.name,
      level_es,
      level_en,
      is_primary: skill.isPrimary || false,
    });

    if (error) {
      console.error('Error inserting skill in Supabase:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Failed to save skill to Supabase:', e);
    return false;
  }
}

export async function deleteSkillFromSupabase(skillName: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('name', skillName);

    if (error) {
      console.error('Error deleting skill from Supabase:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Failed to delete skill from Supabase:', e);
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
      image: p.image_url,
      demoUrl: p.demo_url || undefined,
      repoUrl: p.repo_url || undefined,
      highlights: [],
    }));

    return formatted;
  } catch (e) {
    console.warn('Error fetching projects from Supabase:', e);
    return null;
  }
}

export async function upsertProjectToSupabase(project: Project): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const payload = {
      id: project.id.includes('-') ? project.id : undefined, // pass UUID if present
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
      image_url: project.image,
      demo_url: project.demoUrl,
      repo_url: project.repoUrl,
    };

    const { error } = await supabase.from('projects').upsert(payload);
    if (error) {
      console.error('Error upserting project in Supabase:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Failed to upsert project in Supabase:', e);
    return false;
  }
}

export async function deleteProjectFromSupabase(projectId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) {
      console.error('Error deleting project from Supabase:', error);
      return false;
    }
    return true;
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
    // Check if profile exists
    const existing = await fetchProfileFromSupabase();
    if (existing?.id) {
      const { error } = await supabase
        .from('profile')
        .update({ ...profile, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('profile').insert(profile);
      if (error) throw error;
    }
    return true;
  } catch (e) {
    console.error('Error saving profile to Supabase:', e);
    return false;
  }
}
