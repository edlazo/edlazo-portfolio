import type { SkillCategory, Project, PhilosophyItem } from '../types/portfolio';

export const PROFILE_DATA = {
  name: 'Elias',
  fullName: 'Elias',
  role: {
    es: 'Backend & AI Engineer',
    en: 'Backend & AI Engineer',
  },
  avatar: '/assets/elias_profile_photo.png',
  location: {
    es: 'Buenos Aires, Argentina',
    en: 'Buenos Aires, Argentina',
  },
  education: {
    es: 'Ingeniería en Informática (UNLaM)',
    en: 'Computer Engineering Student (UNLaM)',
  },
  status: {
    es: 'Perfil Verificado / Activo',
    en: 'Verified Active Profile',
  },
};

export const HERO_DATA = {
  greeting: {
    es: 'Hola, soy',
    en: "Hi, I'm",
  },
  name: 'Elias',
  headline: {
    es: 'Fullstack & Backend Engineer',
    en: 'Fullstack & Backend Engineer',
  },
  subheadline: {
    es: 'De la curiosidad al impacto: construyendo software práctico, APIs robustas e integraciones de IA para resolver problemas reales del día a día.',
    en: 'From curiosity to impact: building practical software, robust APIs, and AI integrations to solve real-world daily challenges.',
  },
  availability: {
    es: 'Disponible para Proyectos & Desafíos de Ingeniería',
    en: 'Available for Engineering Projects & Challenges',
  },
  socials: {
    github: 'https://github.com/edlazo',
    gitlab: 'https://gitlab.com/edlazo',
    linkedin: 'https://www.linkedin.com/in/elias-demian-lazo/',
    email: 'elias.demian.lazo@gmail.com',
  },
};

export const ABOUT_DATA = {
  title: {
    es: 'Sobre Mí',
    en: 'About Me',
  },
  subtitle: {
    es: 'Quién Soy & Qué Me Mueve',
    en: 'Who I Am & What Drives Me',
  },
  bio: {
    es: `Mi historia en la tecnología comenzó observando a mi hermano trabajar y preguntándome hasta dónde se podía llegar creando código. De manera autodidacta y con su guía, descubrí que lo que más me apasiona es resolver problemas: usar la tecnología como una herramienta real para ayudar a otros y sentir esa satisfacción cuando algo que construí le facilita la vida a alguien.`,
    en: `My journey in technology began by watching my brother work and wondering how far one could go by creating code. Through self-teaching and his guidance, I discovered that what I love most is solving problems: using technology as a real tool to help others and experiencing that fulfillment when something I built makes someone's life easier.`,
  },
  bioSecondary: {
    es: `Hoy vivo en Buenos Aires y estudio Ingeniería en Informática en la Universidad Nacional de La Matanza (UNLaM). Mis proyectos nacen de la vida real: Semanita surgió de mi propia necesidad de organizarme con las comidas diarias usando IA, y Kairos nació para acercar las inversiones de proyectos reales a personas sin experiencia financiera.`,
    en: `Today I live in Buenos Aires and study Computer Engineering at the National University of La Matanza (UNLaM). My projects stem from real life: Semanita grew out of my personal need to organize daily meals with AI, and Kairos was created to bring real project investments to people without prior financial experience.`,
  },
  personalInterests: {
    es: `Cuando no estoy programando o investigando nuevos avances tecnológicos y del mundo, disfruto mucho de la música, los videojuegos y compartir tiempo con mi familia.`,
    en: `When I'm not coding or researching new advancements in tech and the world, I thoroughly enjoy music, video games, and spending quality time with my family.`,
  },
  pillars: [
    {
      title: {
        es: 'Resolución de Problemas Reales',
        en: 'Real-World Problem Solving',
      },
      description: {
        es: 'Crear software que nazca de necesidades auténticas de personas y clientes.',
        en: 'Building software born out of genuine needs from real people and clients.',
      },
    },
    {
      title: {
        es: 'Aprendizaje & Curiosidad Constante',
        en: 'Continuous Learning & Curiosity',
      },
      description: {
        es: 'Formación autodidacta continua y rigurosidad académica universitaria en ingeniería.',
        en: 'Continuous self-taught learning combined with university engineering rigor.',
      },
    },
    {
      title: {
        es: 'Enfoque Práctico de Producto',
        en: 'Practical Product Focus',
      },
      description: {
        es: 'Desde la arquitectura backend hasta la experiencia de usuario en aplicaciones móviles.',
        en: 'From backend architecture to user experience in mobile applications.',
      },
    },
  ],
};

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'backend',
    category: {
      es: 'Backend & Bases de Datos',
      en: 'Backend & Databases',
    },
    description: {
      es: 'APIs escalables, bases de datos relacionales y entornos asíncronos.',
      en: 'Scalable APIs, relational databases, and asynchronous runtimes.',
    },
    icon: 'Server',
    skills: [
      { name: 'Python (FastAPI)', level: 'Intermedio / Intermediate', isPrimary: true },
      { name: 'TypeScript', level: 'Básico / Basic' },
      { name: 'Express / Node.js', level: 'Básico / Basic' },
      { name: 'PostgreSQL', level: 'Intermedio / Intermediate', isPrimary: true },
      { name: 'Supabase (RLS, Auth)', level: 'Básico / Basic' },
      { name: 'REST APIs', level: 'Intermedio / Intermediate' },
      { name: 'Pydantic v2 / SQLModel', level: 'Intermedio / Intermediate' },
      { name: 'AsyncIO Runtimes', level: 'Intermedio / Intermediate' },
    ],
  },
  {
    id: 'frontend',
    category: {
      es: 'Frontend & Mobile',
      en: 'Frontend & Mobile',
    },
    description: {
      es: 'Aplicaciones móviles multiplataforma e interfaces web modernas.',
      en: 'Cross-platform mobile apps and modern web interfaces.',
    },
    icon: 'Smartphone',
    skills: [
      { name: 'React Native (Expo SDK)', level: 'Básico / Basic' },
      { name: 'React', level: 'Básico / Basic' },
      { name: 'Tailwind CSS', level: 'Básico / Basic' },
      { name: 'HTML5 / CSS3', level: 'Intermedio / Intermediate' },
    ],
  },
  {
    id: 'ai',
    category: {
      es: 'Integración de IA',
      en: 'AI Integration',
    },
    description: {
      es: 'Orquestación de modelos de IA, optimización de prompts y control de latencia.',
      en: 'AI model orchestration, prompt optimization, and latency management.',
    },
    icon: 'Cpu',
    skills: [
      { name: 'Google Gemini API (Vision & Text)', level: 'Básico / Basic' },
      { name: 'Multi-Model Routing', level: 'Básico / Basic' },
      { name: 'Prompt & Latency Optimization', level: 'Básico / Basic' },
      { name: 'Cost-Aware Rate-Limiting', level: 'Básico / Basic' },
    ],
  },
  {
    id: 'devops',
    category: {
      es: 'Herramientas & Trabajo en Equipo',
      en: 'DevOps & Tooling',
    },
    description: {
      es: 'Integración continua, contenedores y control de versiones.',
      en: 'Continuous integration, containerization, and version control.',
    },
    icon: 'ShieldCheck',
    skills: [
      { name: 'Git / GitLab CI/CD', level: 'Intermedio / Intermediate', isPrimary: true },
      { name: 'Trunk-Based Development', level: 'Básico / Basic' },
      { name: 'Docker & Contenedores', level: 'Intermedio / Intermediate' },
      { name: 'Linux / Bash', level: 'Intermedio / Intermediate' },
      { name: 'Sentry', level: 'Básico / Basic' },
      { name: 'PostHog', level: 'Básico / Basic' },
    ],
  },
];

export const FEATURED_PROJECTS: Project[] = [
  {
    id: 'semanita',
    title: 'Semanita',
    tagline: {
      es: 'Comé bien toda la semanita. Sacale una foto a la heladera y te armamos la semana con lo que ya tenés.',
      en: 'Eat well all week long. Snap a photo of your fridge and get your meal plan with what you already have.',
    },
    role: {
      es: 'Creador & Desarrollador — Backend, App Móvil e Infraestructura',
      en: 'Creator & Developer — Backend, Mobile App & Infrastructure',
    },
    period: '2026',
    stack: ['React Native (Expo)', 'TypeScript', 'Express', 'Supabase', 'Google Gemini API'],
    platforms: ['iOS', 'Android', 'Web'],
    image: '/assets/semanita_app_mockup.png',
    summary: {
      es: 'Aplicación móvil de planificación de comidas nacida de una necesidad personal. Utiliza IA de visión para analizar los ingredientes en tu heladera y generar un menú semanal organizado sin desperdiciar comida.',
      en: 'Mobile meal planning application born out of a personal need. Uses vision AI to analyze ingredients in your fridge and generate an organized weekly menu without food waste.',
    },
    highlights: [
      {
        title: {
          es: '1. Asignación Inteligente de Modelos de IA',
          en: '1. Smart Multi-Model AI Allocation',
        },
        description: {
          es: 'Distribución de peticiones entre 4 modelos de Gemini para optimizar la velocidad de respuesta (priorizando ejecuciones rápidas de 5s para la lectura de ingredientes).',
          en: 'Distributed operations across 4 Gemini models to optimize response speed (prioritizing 5s execution for ingredient scanning).',
        },
      },
      {
        title: {
          es: '2. Seguridad en Proxy Backend',
          en: '2. Backend Proxy Security',
        },
        description: {
          es: 'Las credenciales de IA no quedan expuestas en la app móvil. Todas las llamadas pasan por un backend Express autenticado con Supabase.',
          en: 'Zero client-side API keys exposed. All LLM calls pass through an Express proxy authenticated with Supabase session tokens.',
        },
      },
      {
        title: {
          es: '3. Experiencia Móvil Cuidadosa',
          en: '3. Mindful Mobile UX',
        },
        description: {
          es: 'Diseño enfocado en la usabilidad del día a día, pensado para abrir la app desde la cocina y resolver la comida de la semana en segundos.',
          en: 'UX designed for everyday kitchen use, opening the app and solving weekly meals in seconds.',
        },
      },
    ],
    architectureOverview: {
      description: {
        es: 'Semanita utiliza un proxy backend que protege las claves de API y asegura que cada usuario solo acceda a su historial de menús.',
        en: 'Semanita utilizes a reverse-proxy architecture isolating client applications from third-party AI keys while enforcing user privacy.',
      },
      flowSteps: [
        {
          es: 'El usuario saca una foto a su heladera desde la app móvil en React Native Expo',
          en: 'User takes a photo of their fridge via the React Native Expo mobile app',
        },
        {
          es: 'La app envía la imagen de forma segura al proxy backend en Express',
          en: 'App securely sends image payload to Express backend proxy',
        },
        {
          es: 'El modelo Gemini Vision analiza los ingredientes disponibles',
          en: 'Gemini Vision model identifies available ingredients',
        },
        {
          es: 'El modelo Gemini Text estructura el plan semanal y lista de compras',
          en: 'Gemini Text model structures weekly recipe plan and shopping list DTO',
        },
        {
          es: 'El menú se guarda en el historial personal del usuario en Supabase',
          en: 'Weekly plan is saved to user personal history in Supabase',
        },
      ],
      securityDetails: {
        es: 'Las claves de API están protegidas en el servidor backend sin exposición al cliente.',
        en: 'Zero API keys exposed in frontend bundles.',
      },
      techNotes: {
        es: 'Diseñado con interfaz limpia en modo oscuro para uso en cocina.',
        en: 'Dark-mode theme optimized for kitchen usage.',
      },
    },
    demoUrl: '#',
    repoUrl: '#',
  },
  {
    id: 'kairos-api',
    title: 'Kairos',
    tagline: {
      es: 'Haz crecer tu dinero mientras impulsas proyectos reales. Conecta fundadores que necesitan capital con inversores que buscan rendimientos claros.',
      en: 'Grow your money while backing real projects. Connecting founders with investors seeking clear yields.',
    },
    role: {
      es: 'Arquitecto Backend & Desarrollador Lead',
      en: 'Backend Architect & Lead Developer',
    },
    period: '2026',
    stack: ['Python', 'FastAPI', 'Pydantic v2', 'PostgreSQL', 'GitLab CI/CD', 'Docker'],
    platforms: ['Plataforma Web', 'API Backend', 'Docker'],
    image: '/assets/kairos_api_architecture.png',
    summary: {
      es: 'Plataforma de inversión colaborativa nacida para ayudar a un cliente inversor a conectar personas sin experiencia financiera con campañas de financiación transparentes.',
      en: 'Collaborative investment platform created for an investor client to connect people with transparent crowdfunding campaigns.',
    },
    highlights: [
      {
        title: {
          es: '1. Arquitectura Limpia y Modular',
          en: '1. Clean Architecture & Layer Isolation',
        },
        description: {
          es: 'Separación estricta entre lógica de negocio, esquemas de datos DTO (Pydantic v2) y acceso a base de datos para facilitar el mantenimiento.',
          en: 'Strict separation between domain models, Pydantic v2 DTO schemas, and database access layers.',
        },
      },
      {
        title: {
          es: '2. Pipeline Automático de CI/CD',
          en: '2. Automated CI/CD Pipeline',
        },
        description: {
          es: 'Verificación automática de calidad de código y pruebas automatizadas en GitLab CI en cada actualización.',
          en: 'Multi-stage GitLab CI pipeline performing static checks and automated tests on every commit.',
        },
      },
      {
        title: {
          es: '3. Despliegue en Contenedores',
          en: '3. Containerized Deployment',
        },
        description: {
          es: 'Configuración aislada con Docker para garantizar el mismo comportamiento en desarrollo y producción.',
          en: 'Isolated runtime configuration with Docker containers guaranteeing production consistency.',
        },
      },
    ],
    architectureOverview: {
      description: {
        es: 'Kairos utiliza FastAPI con programación asíncrona para ofrecer respuesta rápida en consultas de proyectos e inversiones.',
        en: 'Kairos enforces Clean Architecture boundaries with strict type-safety across FastAPI and Pydantic v2 DTOs.',
      },
      flowSteps: [
        {
          es: 'El usuario explora las campañas de inversión activas en la web',
          en: 'User explores active investment campaigns on web interface',
        },
        {
          es: 'FastAPI procesa la solicitud con validación estricta Pydantic v2',
          en: 'FastAPI processes request with Pydantic v2 schema validation',
        },
        {
          es: 'PostgreSQL registra de forma segura la participación en la campaña',
          en: 'PostgreSQL securely records investment participation',
        },
        {
          es: 'GitLab CI ejecuta pruebas automáticas antes de actualizar el servidor',
          en: 'GitLab CI executes automated tests prior to server deployment',
        },
      ],
      securityDetails: {
        es: 'Validación rigurosa de datos de entrada y variables de entorno.',
        en: 'Strict input data validation and secret environment isolation.',
      },
      techNotes: {
        es: 'Desarrollado con patrones asíncronos para alta velocidad.',
        en: 'Built with async/await patterns for low latency throughput.',
      },
    },
    demoUrl: '#',
    repoUrl: '#',
  },
];

export const WORKFLOW_ITEMS: PhilosophyItem[] = [
  {
    id: 'problem-solving',
    title: {
      es: 'De la Idea al Producto',
      en: 'From Idea to Product',
    },
    subtitle: {
      es: 'Enfoque en Problemas Reales',
      en: 'Focus on Real Problems',
    },
    description: {
      es: 'Todo proyecto empieza entendiendo la necesidad real de las personas, convirtiendo ideas o problemáticas cotidianas en soluciones funcionales.',
      en: 'Every project starts by understanding real human needs, transforming daily challenges into functional software solutions.',
    },
    icon: 'Sparkles',
    points: [
      {
        es: 'Identificar la necesidad real antes de escribir código',
        en: 'Identify the genuine need before writing code',
      },
      {
        es: 'Construir prototipos funcionales y probar en la práctica',
        en: 'Build functional prototypes and test in practice',
      },
      {
        es: 'Priorizar la usabilidad y la simplicidad para el usuario',
        en: 'Prioritize usability and simplicity for the user',
      },
    ],
  },
  {
    id: 'learning-mindset',
    title: {
      es: 'Curiosidad y Aprendizaje Continuo',
      en: 'Curiosity & Continuous Learning',
    },
    subtitle: {
      es: 'Autodidacta + Base Universitaria',
      en: 'Self-Taught + University Foundation',
    },
    description: {
      es: 'Combinar la iniciativa autodidacta con la rigurosidad de los estudios de Ingeniería en Informática (UNLaM).',
      en: 'Combining self-taught initiative with the academic rigor of Computer Engineering at UNLaM.',
    },
    icon: 'GitBranch',
    points: [
      {
        es: 'Investigación constante de nuevas herramientas y tendencias',
        en: 'Continuous research of new tools and industry trends',
      },
      {
        es: 'Bases sólidas de ingeniería de software y arquitectura',
        en: 'Solid foundation in software engineering and architecture',
      },
      {
        es: 'Capacidad de adaptación a distintas tecnologías y lenguajes',
        en: 'Adaptability across different tech stacks and languages',
      },
    ],
  },
  {
    id: 'clean-code',
    title: {
      es: 'Código Claro y Mantenible',
      en: 'Clean & Maintainable Code',
    },
    subtitle: {
      es: 'Estructura y Buenas Prácticas',
      en: 'Structure & Best Practices',
    },
    description: {
      es: 'Escribir código ordenado, tipado y bien estructurado que permita hacer crecer las aplicaciones sin complicaciones.',
      en: 'Writing clean, typed, and well-structured code that allows applications to scale smoothly.',
    },
    icon: 'Lock',
    points: [
      {
        es: 'Uso de tipado estricto en Python (FastAPI) y TypeScript',
        en: 'Strict typing in Python (FastAPI) and TypeScript',
      },
      {
        es: 'Control de versiones con Git y pipelines automatizados',
        en: 'Version control with Git and automated CI/CD pipelines',
      },
      {
        es: 'Separación clara de responsabilidades en el backend',
        en: 'Clear separation of concerns across backend layers',
      },
    ],
  },
];
