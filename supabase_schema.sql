-- ========================================================
-- SUPABASE DATABASE SCHEMA — PORTFOLIO ELIAS LAZO
-- Ejecutar en Supabase -> SQL Editor (paso 1 de 2).
-- Los datos iniciales van en supabase_seed.sql (paso 2 de 2).
--
-- Este script es IDEMPOTENTE: se puede re-ejecutar sin errores.
-- ========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------
-- 1. TABLAS
-- --------------------------------------------------------

-- 1.1 Perfil (una sola fila; la app lee con .limit(1).maybeSingle())
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

-- 1.2 Categorias de skills
CREATE TABLE IF NOT EXISTS public.skill_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE,                 -- 'backend' | 'frontend' | 'ai' | 'devops' (clave estable para el seed)
    category_es TEXT NOT NULL,
    category_en TEXT NOT NULL,
    description_es TEXT NOT NULL,
    description_en TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'Cpu', -- Server | Smartphone | Cpu | ShieldCheck (ver SkillsMatrix.tsx)
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.3 Skills
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

-- 1.4 Proyectos
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE,                 -- 'semanita' | 'kairos-api' (clave estable para el seed)
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
    highlights JSONB NOT NULL DEFAULT '[]'::jsonb,  -- [{title:{es,en}, description:{es,en}}]
    architecture_overview JSONB,                    -- {description:{es,en}, flowSteps:[...], securityDetails, techNotes}
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------
-- 2. MIGRACIONES PARA BASES YA CREADAS CON LA VERSION ANTERIOR
--    (no-ops en una base nueva)
-- --------------------------------------------------------
ALTER TABLE public.skill_categories ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.projects         ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.projects         ADD COLUMN IF NOT EXISTS highlights JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.projects         ADD COLUMN IF NOT EXISTS architecture_overview JSONB;

-- Claves unicas (idempotentes)
CREATE UNIQUE INDEX IF NOT EXISTS skill_categories_slug_key ON public.skill_categories (slug);
CREATE UNIQUE INDEX IF NOT EXISTS projects_slug_key         ON public.projects (slug);
-- Evita skills duplicadas dentro de una misma categoria (el AdminPanel reinsertaba sin control)
CREATE UNIQUE INDEX IF NOT EXISTS skills_category_name_key  ON public.skills (category_id, name);

-- --------------------------------------------------------
-- 3. ROW LEVEL SECURITY
-- --------------------------------------------------------
ALTER TABLE public.profile          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects         ENABLE ROW LEVEL SECURITY;

-- 3.1 Lectura publica (anon + authenticated) -> es lo que consume el sitio
DROP POLICY IF EXISTS "Public profile access"    ON public.profile;
DROP POLICY IF EXISTS "Public categories access" ON public.skill_categories;
DROP POLICY IF EXISTS "Public skills access"     ON public.skills;
DROP POLICY IF EXISTS "Public projects access"   ON public.projects;

CREATE POLICY "Public profile access"    ON public.profile          FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public categories access" ON public.skill_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public skills access"     ON public.skills           FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public projects access"   ON public.projects         FOR SELECT TO anon, authenticated USING (true);

-- 3.2 Escritura solo para sesiones autenticadas (AdminPanel via Supabase Auth)
--     WITH CHECK explicito: sin el, un INSERT queda bloqueado en algunas variantes de policy.
DROP POLICY IF EXISTS "Admin write profile"    ON public.profile;
DROP POLICY IF EXISTS "Admin write categories" ON public.skill_categories;
DROP POLICY IF EXISTS "Admin write skills"     ON public.skills;
DROP POLICY IF EXISTS "Admin write projects"   ON public.projects;

CREATE POLICY "Admin write profile"    ON public.profile          FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin write categories" ON public.skill_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin write skills"     ON public.skills           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin write projects"   ON public.projects         FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- --------------------------------------------------------
-- 4. GRANTS (Supabase ya los aplica por defecto; explicitos = deterministico)
-- --------------------------------------------------------
GRANT SELECT ON public.profile, public.skill_categories, public.skills, public.projects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.profile, public.skill_categories, public.skills, public.projects TO authenticated;

-- --------------------------------------------------------
-- 5. GUARDADO ATOMICO DE SKILLS (AdminPanel -> boton "Guardar cambios")
--    Aplica todos los cambios pendientes en UNA transaccion: si cualquier paso
--    falla, no se guarda nada. SECURITY INVOKER: corre con los permisos de quien
--    llama, asi que las politicas RLS de arriba siguen aplicando.
--
--    changes = {
--      "deleted":  ["<uuid>", ...],
--      "updated":  [{"id", "category_id", "name", "level_es", "level_en", "is_primary", "sort_order"}, ...],
--      "inserted": [{"category_id", "name", "level_es", "level_en", "is_primary", "sort_order"}, ...]
--    }
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.save_skills(changes jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $fn$
DECLARE
    item     jsonb;
    affected integer;
BEGIN
    -- RLS no da error cuando bloquea un UPDATE/DELETE (afecta 0 filas), asi que
    -- se exige sesion explicitamente y se controla cada fila afectada.
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'save_skills: se requiere una sesion autenticada'
            USING ERRCODE = '42501';
    END IF;

    -- 1) Borrados primero: permite borrar una skill y volver a crear otra con el
    --    mismo nombre en la misma categoria dentro del mismo guardado.
    FOR item IN SELECT value FROM jsonb_array_elements(COALESCE(changes->'deleted', '[]'::jsonb)) LOOP
        DELETE FROM public.skills WHERE id = (item #>> '{}')::uuid;
        GET DIAGNOSTICS affected = ROW_COUNT;
        IF affected = 0 THEN
            RAISE EXCEPTION 'save_skills: no se encontro la skill a borrar %', item #>> '{}'
                USING ERRCODE = 'P0002';
        END IF;
    END LOOP;

    -- 2) Ediciones: nombre, nivel, destacada, categoria y posicion.
    FOR item IN SELECT value FROM jsonb_array_elements(COALESCE(changes->'updated', '[]'::jsonb)) LOOP
        UPDATE public.skills SET
            category_id = (item->>'category_id')::uuid,
            name        = item->>'name',
            level_es    = item->>'level_es',
            level_en    = item->>'level_en',
            is_primary  = COALESCE((item->>'is_primary')::boolean, FALSE),
            sort_order  = (item->>'sort_order')::integer
        WHERE id = (item->>'id')::uuid;
        GET DIAGNOSTICS affected = ROW_COUNT;
        IF affected = 0 THEN
            RAISE EXCEPTION 'save_skills: no se encontro la skill a editar %', item->>'id'
                USING ERRCODE = 'P0002';
        END IF;
    END LOOP;

    -- 3) Altas.
    INSERT INTO public.skills (category_id, name, level_es, level_en, is_primary, sort_order)
    SELECT x.category_id, x.name, x.level_es, x.level_en, COALESCE(x.is_primary, FALSE), x.sort_order
    FROM jsonb_to_recordset(COALESCE(changes->'inserted', '[]'::jsonb))
        AS x(category_id uuid, name text, level_es text, level_en text, is_primary boolean, sort_order integer);
END;
$fn$;

REVOKE ALL ON FUNCTION public.save_skills(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_skills(jsonb) TO authenticated;

-- --------------------------------------------------------
-- 6. MENSAJES DEL FORMULARIO DE CONTACTO
--    Los inserta SOLO la funcion de Vercel /api/contact con la service_role key
--    (que ignora RLS). No hay politica de INSERT para anon a proposito: si la
--    tabla aceptara inserciones publicas, cualquiera podria saltearse el
--    anti-spam de la funcion y escribir directo por la API REST.
--    El admin (sesion autenticada) puede leerlos, marcarlos y borrarlos.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name         TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
    email        TEXT NOT NULL CHECK (char_length(email) <= 254 AND email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
    project_type TEXT CHECK (char_length(project_type) <= 100),
    message      TEXT NOT NULL CHECK (char_length(message) BETWEEN 10 AND 5000),
    language     TEXT CHECK (language IN ('es', 'en')),
    ip_hash      TEXT,                                -- sha256(IP + sal): limita envios por IP sin guardar la IP
    email_sent   BOOLEAN NOT NULL DEFAULT FALSE,      -- FALSE = guardado pero el aviso por email fallo
    is_read      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx ON public.contact_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS contact_messages_ip_hash_idx    ON public.contact_messages (ip_hash, created_at DESC);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin read contact messages"   ON public.contact_messages;
DROP POLICY IF EXISTS "Admin update contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admin delete contact messages" ON public.contact_messages;

CREATE POLICY "Admin read contact messages"   ON public.contact_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin update contact messages" ON public.contact_messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin delete contact messages" ON public.contact_messages FOR DELETE TO authenticated USING (true);

REVOKE ALL ON public.contact_messages FROM anon;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;

-- --------------------------------------------------------
-- 7. REFRESCAR EL CACHE DE ESQUEMA DE POSTGREST
--    Sin esto, /rest/v1/<tabla> puede seguir devolviendo 404 (PGRST205) unos segundos.
-- --------------------------------------------------------
NOTIFY pgrst, 'reload schema';
