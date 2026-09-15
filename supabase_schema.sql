-- ========================================================
-- SUPABASE DATABASE SCHEMA FOR ELIAS PORTFOLIO
-- Execute this SQL in Supabase -> SQL Editor
-- ========================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profile Table
CREATE TABLE IF NOT EXISTS public.profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT 'Elias',
    role_es TEXT NOT NULL,
    role_en TEXT NOT NULL,
    email TEXT NOT NULL,
    github_url TEXT NOT NULL,
    gitlab_url TEXT NOT NULL,
    linkedin_url TEXT NOT NULL,
    avatar_url TEXT NOT NULL,
    location_es TEXT NOT NULL,
    location_en TEXT NOT NULL,
    education_es TEXT NOT NULL,
    education_en TEXT NOT NULL,
    bio_es TEXT NOT NULL,
    bio_en TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Skill Categories Table
CREATE TABLE IF NOT EXISTS public.skill_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_es TEXT NOT NULL,
    category_en TEXT NOT NULL,
    description_es TEXT NOT NULL,
    description_en TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'Cpu',
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Skills Table
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.skill_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    level_es TEXT NOT NULL DEFAULT 'Intermedio',
    level_en TEXT NOT NULL DEFAULT 'Intermediate',
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    tagline_es TEXT NOT NULL,
    tagline_en TEXT NOT NULL,
    summary_es TEXT NOT NULL,
    summary_en TEXT NOT NULL,
    role_es TEXT NOT NULL,
    role_en TEXT NOT NULL,
    period TEXT NOT NULL,
    stack TEXT[] DEFAULT '{}',
    platforms TEXT[] DEFAULT '{}',
    image_url TEXT NOT NULL,
    demo_url TEXT,
    repo_url TEXT,
    is_mobile_app BOOLEAN DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable Row-Level Security (RLS)
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies: PUBLIC READ ACCESS FOR ALL
CREATE POLICY "Public profile access" ON public.profile FOR SELECT USING (true);
CREATE POLICY "Public categories access" ON public.skill_categories FOR SELECT USING (true);
CREATE POLICY "Public skills access" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Public projects access" ON public.projects FOR SELECT USING (true);

-- 7. RLS Policies: AUTHENTICATED WRITE ACCESS FOR ADMIN (ELIAS)
CREATE POLICY "Admin write profile" ON public.profile FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write categories" ON public.skill_categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write skills" ON public.skills FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write projects" ON public.projects FOR ALL USING (auth.role() = 'authenticated');

-- ========================================================
-- INITIAL SEED DATA
-- ========================================================

INSERT INTO public.profile (
    name, role_es, role_en, email, github_url, gitlab_url, linkedin_url, avatar_url,
    location_es, location_en, education_es, education_en, bio_es, bio_en
) VALUES (
    'Elias',
    'Fullstack & Backend Engineer',
    'Fullstack & Backend Engineer',
    'contacto@eliaslazo.dev',
    'https://github.com',
    'https://gitlab.com',
    'https://linkedin.com',
    '/assets/elias_profile_photo.png',
    'Buenos Aires, Argentina',
    'Buenos Aires, Argentina',
    'Ingeniería en Informática (UNLaM)',
    'Computer Engineering (UNLaM)',
    'Empecé a programar de forma autodidacta observando a mi hermano y realizando cursos. Me apasiona resolver problemas y la capacidad que otorga el software para brindar soluciones a los acontecimientos de la vida cotidiana. Actualmente estudio Ingeniería en Informática en la Universidad Nacional de La Matanza (UNLaM) en Buenos Aires, Argentina. Me apasiona la música, los videojuegos, la compañía familiar y la investigación constante de avances tecnológicos.',
    'I started programming self-taught by watching my brother work and taking courses. I am deeply passionate about problem-solving and the ability of software to help resolve real-life challenges. Currently studying Computer Engineering at Universidad Nacional de La Matanza (UNLaM) in Buenos Aires, Argentina. I love music, video games, family time, and researching technological advancements.'
) ON CONFLICT DO NOTHING;
