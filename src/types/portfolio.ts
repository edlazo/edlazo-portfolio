export type Language = 'es' | 'en';

export interface SkillItem {
  name: string;
  level?: string;
  isPrimary?: boolean;
}

export interface SkillCategory {
  id: string;
  category: { es: string; en: string };
  description: { es: string; en: string };
  icon: string;
  skills: SkillItem[];
}

export interface ProjectHighlight {
  title: { es: string; en: string };
  description: { es: string; en: string };
}

export interface Project {
  id: string;
  title: string;
  tagline: { es: string; en: string };
  role: { es: string; en: string };
  period?: string;
  stack: string[];
  platforms: string[];
  image: string;
  summary: { es: string; en: string };
  highlights: ProjectHighlight[];
  architectureOverview: {
    description: { es: string; en: string };
    flowSteps?: { es: string; en: string }[];
    securityDetails?: { es: string; en: string };
    techNotes?: { es: string; en: string };
  };
  demoUrl?: string;
  repoUrl?: string;
}

export interface PhilosophyItem {
  id: string;
  title: { es: string; en: string };
  subtitle: { es: string; en: string };
  description: { es: string; en: string };
  icon: string;
  points: { es: string; en: string }[];
}
