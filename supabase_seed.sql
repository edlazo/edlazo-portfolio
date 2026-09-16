-- ========================================================
-- SEED INICIAL — PORTFOLIO ELIAS LAZO  (paso 2 de 2)
-- Fuente de verdad: src/data/portfolioData.ts
-- Ejecutar DESPUES de supabase_schema.sql, en Supabase -> SQL Editor.
--
-- Idempotente:
--   * profile          -> solo inserta si la tabla esta vacia (nunca pisa ediciones del AdminPanel)
--   * skill_categories -> UPSERT por slug
--   * skills           -> UPSERT por (category_id, name)
--   * projects         -> UPSERT por slug
-- ========================================================

-- --------------------------------------------------------
-- 1. PROFILE  (HERO_DATA.socials + PROFILE_DATA + ABOUT_DATA.bio)
-- --------------------------------------------------------
INSERT INTO public.profile (
    name, role_es, role_en, email, github_url, gitlab_url, linkedin_url, avatar_url,
    location_es, location_en, education_es, education_en, bio_es, bio_en
)
SELECT
    'Elias',
    'Fullstack & Backend Engineer',
    'Fullstack & Backend Engineer',
    'contacto@eliaslazo.dev',
    'https://github.com/edlazo',
    'https://gitlab.com/edlazo',
    'https://www.linkedin.com/in/elias-demian-lazo/',
    '/assets/elias_profile_photo.webp',
    'Buenos Aires, Argentina',
    'Buenos Aires, Argentina',
    'Ingeniería en Informática (UNLaM)',
    'Computer Engineering Student (UNLaM)',
    $es$Mi historia en la tecnología comenzó observando a mi hermano trabajar y preguntándome hasta dónde se podía llegar creando código. De manera autodidacta y con su guía, descubrí que lo que más me apasiona es resolver problemas: usar la tecnología como una herramienta real para ayudar a otros y sentir esa satisfacción cuando algo que construí le facilita la vida a alguien.

Hoy vivo en Buenos Aires y estudio Ingeniería en Informática en la Universidad Nacional de La Matanza (UNLaM). Mis proyectos nacen de la vida real: Semanita surgió de mi propia necesidad de organizarme con las comidas diarias usando IA, y Kairos nació para acercar las inversiones de proyectos reales a personas sin experiencia financiera.$es$,
    $en$My journey in technology began by watching my brother work and wondering how far one could go by creating code. Through self-teaching and his guidance, I discovered that what I love most is solving problems: using technology as a real tool to help others and experiencing that fulfillment when something I built makes someone's life easier.

Today I live in Buenos Aires and study Computer Engineering at the National University of La Matanza (UNLaM). My projects stem from real life: Semanita grew out of my personal need to organize daily meals with AI, and Kairos was created to bring real project investments to people without prior financial experience.$en$
WHERE NOT EXISTS (SELECT 1 FROM public.profile);

-- --------------------------------------------------------
-- 2. SKILL CATEGORIES  (SKILL_CATEGORIES)
-- --------------------------------------------------------
INSERT INTO public.skill_categories (slug, category_es, category_en, description_es, description_en, icon, sort_order)
VALUES
  ('backend',  'Backend & Bases de Datos',         'Backend & Databases',
   'APIs escalables, bases de datos relacionales y entornos asíncronos.',
   'Scalable APIs, relational databases, and asynchronous runtimes.',      'Server',      1),
  ('frontend', 'Frontend & Mobile',                'Frontend & Mobile',
   'Aplicaciones móviles multiplataforma e interfaces web modernas.',
   'Cross-platform mobile apps and modern web interfaces.',                'Smartphone',  2),
  ('ai',       'Integración de IA',                'AI Integration',
   'Orquestación de modelos de IA, optimización de prompts y control de latencia.',
   'AI model orchestration, prompt optimization, and latency management.', 'Cpu',         3),
  ('devops',   'Herramientas & Trabajo en Equipo', 'DevOps & Tooling',
   'Integración continua, contenedores y control de versiones.',
   'Continuous integration, containerization, and version control.',      'ShieldCheck', 4)
ON CONFLICT (slug) DO UPDATE SET
    category_es    = EXCLUDED.category_es,
    category_en    = EXCLUDED.category_en,
    description_es = EXCLUDED.description_es,
    description_en = EXCLUDED.description_en,
    icon           = EXCLUDED.icon,
    sort_order     = EXCLUDED.sort_order;

-- --------------------------------------------------------
-- 3. SKILLS  (level 'Intermedio / Intermediate' -> level_es / level_en)
-- --------------------------------------------------------
INSERT INTO public.skills (category_id, name, level_es, level_en, is_primary, sort_order)
SELECT c.id, s.name, s.level_es, s.level_en, s.is_primary, s.sort_order
FROM (VALUES
  ('backend',  'Python (FastAPI)',                  'Intermedio', 'Intermediate', TRUE,  1),
  ('backend',  'TypeScript',                        'Básico',     'Basic',        FALSE, 2),
  ('backend',  'Express / Node.js',                 'Básico',     'Basic',        FALSE, 3),
  ('backend',  'PostgreSQL',                        'Intermedio', 'Intermediate', TRUE,  4),
  ('backend',  'Supabase (RLS, Auth)',              'Básico',     'Basic',        FALSE, 5),
  ('backend',  'REST APIs',                         'Intermedio', 'Intermediate', FALSE, 6),
  ('backend',  'Pydantic v2 / SQLModel',            'Intermedio', 'Intermediate', FALSE, 7),
  ('backend',  'AsyncIO Runtimes',                  'Intermedio', 'Intermediate', FALSE, 8),
  ('frontend', 'React Native (Expo SDK)',           'Básico',     'Basic',        FALSE, 1),
  ('frontend', 'React',                             'Básico',     'Basic',        FALSE, 2),
  ('frontend', 'Tailwind CSS',                      'Básico',     'Basic',        FALSE, 3),
  ('frontend', 'HTML5 / CSS3',                      'Intermedio', 'Intermediate', FALSE, 4),
  ('ai',       'Google Gemini API (Vision & Text)', 'Básico',     'Basic',        FALSE, 1),
  ('ai',       'Multi-Model Routing',               'Básico',     'Basic',        FALSE, 2),
  ('ai',       'Prompt & Latency Optimization',     'Básico',     'Basic',        FALSE, 3),
  ('ai',       'Cost-Aware Rate-Limiting',          'Básico',     'Basic',        FALSE, 4),
  ('devops',   'Git / GitLab CI/CD',                'Intermedio', 'Intermediate', TRUE,  1),
  ('devops',   'Trunk-Based Development',           'Básico',     'Basic',        FALSE, 2),
  ('devops',   'Docker & Contenedores',             'Intermedio', 'Intermediate', FALSE, 3),
  ('devops',   'Linux / Bash',                      'Intermedio', 'Intermediate', FALSE, 4),
  ('devops',   'Sentry',                            'Básico',     'Basic',        FALSE, 5),
  ('devops',   'PostHog',                           'Básico',     'Basic',        FALSE, 6)
) AS s(cat_slug, name, level_es, level_en, is_primary, sort_order)
JOIN public.skill_categories c ON c.slug = s.cat_slug
ON CONFLICT (category_id, name) DO UPDATE SET
    level_es   = EXCLUDED.level_es,
    level_en   = EXCLUDED.level_en,
    is_primary = EXCLUDED.is_primary,
    sort_order = EXCLUDED.sort_order;

-- --------------------------------------------------------
-- 4. PROJECTS  (FEATURED_PROJECTS) — parte 1: Semanita
-- --------------------------------------------------------
INSERT INTO public.projects (
    slug, title, tagline_es, tagline_en, summary_es, summary_en, role_es, role_en,
    period, stack, platforms, image_url, demo_url, repo_url, is_mobile_app,
    highlights, architecture_overview, sort_order
) VALUES (
  'semanita',
  'Semanita',
  $t$Comé bien toda la semanita. Sacale una foto a la heladera y te armamos la semana con lo que ya tenés.$t$,
  $t$Eat well all week long. Snap a photo of your fridge and get your meal plan with what you already have.$t$,
  $s$Aplicación móvil de planificación de comidas nacida de una necesidad personal. Utiliza IA de visión para analizar los ingredientes en tu heladera y generar un menú semanal organizado sin desperdiciar comida.$s$,
  $s$Mobile meal planning application born out of a personal need. Uses vision AI to analyze ingredients in your fridge and generate an organized weekly menu without food waste.$s$,
  'Creador & Desarrollador — Backend, App Móvil e Infraestructura',
  'Creator & Developer — Backend, Mobile App & Infrastructure',
  '2026',
  ARRAY['React Native (Expo)','TypeScript','Express','Supabase','Google Gemini API'],
  ARRAY['iOS','Android','Web'],
  '/assets/semanita_app_mockup.webp',
  '#', '#', TRUE,
  $h$[
  {"title": {"es": "1. Asignación Inteligente de Modelos de IA", "en": "1. Smart Multi-Model AI Allocation"},
   "description": {"es": "Distribución de peticiones entre 4 modelos de Gemini para optimizar la velocidad de respuesta (priorizando ejecuciones rápidas de 5s para la lectura de ingredientes).", "en": "Distributed operations across 4 Gemini models to optimize response speed (prioritizing 5s execution for ingredient scanning)."}},
  {"title": {"es": "2. Seguridad en Proxy Backend", "en": "2. Backend Proxy Security"},
   "description": {"es": "Las credenciales de IA no quedan expuestas en la app móvil. Todas las llamadas pasan por un backend Express autenticado con Supabase.", "en": "Zero client-side API keys exposed. All LLM calls pass through an Express proxy authenticated with Supabase session tokens."}},
  {"title": {"es": "3. Experiencia Móvil Cuidadosa", "en": "3. Mindful Mobile UX"},
   "description": {"es": "Diseño enfocado en la usabilidad del día a día, pensado para abrir la app desde la cocina y resolver la comida de la semana en segundos.", "en": "UX designed for everyday kitchen use, opening the app and solving weekly meals in seconds."}}
  ]$h$::jsonb,
  $a${
  "description": {"es": "Semanita utiliza un proxy backend que protege las claves de API y asegura que cada usuario solo acceda a su historial de menús.", "en": "Semanita utilizes a reverse-proxy architecture isolating client applications from third-party AI keys while enforcing user privacy."},
  "flowSteps": [
    {"es": "El usuario saca una foto a su heladera desde la app móvil en React Native Expo", "en": "User takes a photo of their fridge via the React Native Expo mobile app"},
    {"es": "La app envía la imagen de forma segura al proxy backend en Express", "en": "App securely sends image payload to Express backend proxy"},
    {"es": "El modelo Gemini Vision analiza los ingredientes disponibles", "en": "Gemini Vision model identifies available ingredients"},
    {"es": "El modelo Gemini Text estructura el plan semanal y lista de compras", "en": "Gemini Text model structures weekly recipe plan and shopping list DTO"},
    {"es": "El menú se guarda en el historial personal del usuario en Supabase", "en": "Weekly plan is saved to user personal history in Supabase"}
  ],
  "securityDetails": {"es": "Las claves de API están protegidas en el servidor backend sin exposición al cliente.", "en": "Zero API keys exposed in frontend bundles."},
  "techNotes": {"es": "Diseñado con interfaz limpia en modo oscuro para uso en cocina.", "en": "Dark-mode theme optimized for kitchen usage."}
  }$a$::jsonb,
  1
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title, tagline_es = EXCLUDED.tagline_es, tagline_en = EXCLUDED.tagline_en,
    summary_es = EXCLUDED.summary_es, summary_en = EXCLUDED.summary_en,
    role_es = EXCLUDED.role_es, role_en = EXCLUDED.role_en, period = EXCLUDED.period,
    stack = EXCLUDED.stack, platforms = EXCLUDED.platforms, image_url = EXCLUDED.image_url,
    demo_url = EXCLUDED.demo_url, repo_url = EXCLUDED.repo_url, is_mobile_app = EXCLUDED.is_mobile_app,
    highlights = EXCLUDED.highlights, architecture_overview = EXCLUDED.architecture_overview,
    sort_order = EXCLUDED.sort_order;

-- --------------------------------------------------------
-- 4. PROJECTS — parte 2: Kairos
-- --------------------------------------------------------
INSERT INTO public.projects (
    slug, title, tagline_es, tagline_en, summary_es, summary_en, role_es, role_en,
    period, stack, platforms, image_url, demo_url, repo_url, is_mobile_app,
    highlights, architecture_overview, sort_order
) VALUES (
  'kairos-api',
  'Kairos',
  $t$Haz crecer tu dinero mientras impulsas proyectos reales. Conecta fundadores que necesitan capital con inversores que buscan rendimientos claros.$t$,
  $t$Grow your money while backing real projects. Connecting founders with investors seeking clear yields.$t$,
  $s$Plataforma de inversión colaborativa nacida para ayudar a un cliente inversor a conectar personas sin experiencia financiera con campañas de financiación transparentes.$s$,
  $s$Collaborative investment platform created for an investor client to connect people with transparent crowdfunding campaigns.$s$,
  'Arquitecto Backend & Desarrollador Lead',
  'Backend Architect & Lead Developer',
  '2026',
  ARRAY['Python','FastAPI','Pydantic v2','PostgreSQL','GitLab CI/CD','Docker'],
  ARRAY['Plataforma Web','API Backend','Docker'],
  '/assets/kairos_api_architecture.webp',
  '#', '#', FALSE,
  $h$[
  {"title": {"es": "1. Arquitectura Limpia y Modular", "en": "1. Clean Architecture & Layer Isolation"},
   "description": {"es": "Separación estricta entre lógica de negocio, esquemas de datos DTO (Pydantic v2) y acceso a base de datos para facilitar el mantenimiento.", "en": "Strict separation between domain models, Pydantic v2 DTO schemas, and database access layers."}},
  {"title": {"es": "2. Pipeline Automático de CI/CD", "en": "2. Automated CI/CD Pipeline"},
   "description": {"es": "Verificación automática de calidad de código y pruebas automatizadas en GitLab CI en cada actualización.", "en": "Multi-stage GitLab CI pipeline performing static checks and automated tests on every commit."}},
  {"title": {"es": "3. Despliegue en Contenedores", "en": "3. Containerized Deployment"},
   "description": {"es": "Configuración aislada con Docker para garantizar el mismo comportamiento en desarrollo y producción.", "en": "Isolated runtime configuration with Docker containers guaranteeing production consistency."}}
  ]$h$::jsonb,
  $a${
  "description": {"es": "Kairos utiliza FastAPI con programación asíncrona para ofrecer respuesta rápida en consultas de proyectos e inversiones.", "en": "Kairos enforces Clean Architecture boundaries with strict type-safety across FastAPI and Pydantic v2 DTOs."},
  "flowSteps": [
    {"es": "El usuario explora las campañas de inversión activas en la web", "en": "User explores active investment campaigns on web interface"},
    {"es": "FastAPI procesa la solicitud con validación estricta Pydantic v2", "en": "FastAPI processes request with Pydantic v2 schema validation"},
    {"es": "PostgreSQL registra de forma segura la participación en la campaña", "en": "PostgreSQL securely records investment participation"},
    {"es": "GitLab CI ejecuta pruebas automáticas antes de actualizar el servidor", "en": "GitLab CI executes automated tests prior to server deployment"}
  ],
  "securityDetails": {"es": "Validación rigurosa de datos de entrada y variables de entorno.", "en": "Strict input data validation and secret environment isolation."},
  "techNotes": {"es": "Desarrollado con patrones asíncronos para alta velocidad.", "en": "Built with async/await patterns for low latency throughput."}
  }$a$::jsonb,
  2
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title, tagline_es = EXCLUDED.tagline_es, tagline_en = EXCLUDED.tagline_en,
    summary_es = EXCLUDED.summary_es, summary_en = EXCLUDED.summary_en,
    role_es = EXCLUDED.role_es, role_en = EXCLUDED.role_en, period = EXCLUDED.period,
    stack = EXCLUDED.stack, platforms = EXCLUDED.platforms, image_url = EXCLUDED.image_url,
    demo_url = EXCLUDED.demo_url, repo_url = EXCLUDED.repo_url, is_mobile_app = EXCLUDED.is_mobile_app,
    highlights = EXCLUDED.highlights, architecture_overview = EXCLUDED.architecture_overview,
    sort_order = EXCLUDED.sort_order;

-- --------------------------------------------------------
-- 5. VERIFICACION
-- --------------------------------------------------------
SELECT 'profile' AS tabla, COUNT(*) AS filas FROM public.profile
UNION ALL SELECT 'skill_categories', COUNT(*) FROM public.skill_categories
UNION ALL SELECT 'skills',           COUNT(*) FROM public.skills
UNION ALL SELECT 'projects',         COUNT(*) FROM public.projects;
-- Esperado: profile 1 | skill_categories 4 | skills 22 | projects 2
