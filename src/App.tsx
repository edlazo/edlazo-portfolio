import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { SkillsMatrix } from './components/SkillsMatrix';
import { Projects } from './components/Projects';
import { EngineeringPhilosophy } from './components/EngineeringPhilosophy';
import { Footer } from './components/Footer';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import {
  SKILL_CATEGORIES as initialCategories,
  FEATURED_PROJECTS as initialProjects,
  HERO_DATA,
} from './data/portfolioData';
import type { Project, SkillCategory } from './types/portfolio';
import { isSupabaseConfigured } from './lib/supabaseEnv';

// Both the SDK and the queries are loaded after the first paint.
const loadSupabase = () => import('./lib/supabase');
const loadSupabaseService = () => import('./lib/supabaseService');

// The page sections are part of the prerendered HTML, so they are imported
// normally (together they are only a few KB). The dialogs are not in the
// initial markup, so they stay in their own chunks and are prefetched while
// the browser is idle.
const loadProjectModal = () => import('./components/ProjectModal');
const loadContactModal = () => import('./components/ContactModal');
const loadAdminLogin = () => import('./components/AdminLoginModal');

const ProjectModal = lazy(() => loadProjectModal().then((m) => ({ default: m.ProjectModal })));
const ContactModal = lazy(() => loadContactModal().then((m) => ({ default: m.ContactModal })));
const AdminLoginModal = lazy(() => loadAdminLogin().then((m) => ({ default: m.AdminLoginModal })));

// The admin panel (and the drag & drop library it uses) is only downloaded
// when it's opened, so regular visitors never pay for it.
const loadAdminPanel = () => import('./components/AdminPanel');
const AdminPanel = lazy(() => loadAdminPanel().then((module) => ({ default: module.AdminPanel })));

// Runs after the page has finished loading and the browser is idle, so the
// deferred chunks never compete with the fonts and scripts of the first paint.
const whenIdle = (task: () => void) => {
  const schedule = () => {
    const idle = (window as typeof window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
      .requestIdleCallback;
    if (idle) idle(task, { timeout: 3000 });
    else setTimeout(task, 300);
  };
  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
};

export function AppContent() {
  const { language } = useLanguage();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Dynamic portfolio state (persisted locally / synced with Supabase)
  // The page is prerendered at build time, so the first render has to match
  // the server output: the cached copy is read after mount, not during render.
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>(initialCategories);
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  useEffect(() => {
    const read = <T,>(key: string): T | null => {
      try {
        const saved = localStorage.getItem(key);
        return saved ? (JSON.parse(saved) as T) : null;
      } catch {
        return null;
      }
    };
    const savedSkills = read<SkillCategory[]>('elias_skills');
    if (savedSkills?.length) setSkillCategories(savedSkills);
    const savedProjects = read<Project[]>('elias_projects');
    if (savedProjects?.length) setProjects(savedProjects);
  }, []);

  const handleUpdateSkills = useCallback((updatedCategories: SkillCategory[]) => {
    setSkillCategories(updatedCategories);
    localStorage.setItem('elias_skills', JSON.stringify(updatedCategories));
  }, []);

  const handleUpdateProjects = useCallback((updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    localStorage.setItem('elias_projects', JSON.stringify(updatedProjects));
  }, []);

  // Pulls the live Supabase data and makes it the local truth. Runs on mount and
  // again after every successful write from the AdminPanel, so the panel shows
  // what the database actually stored instead of its own optimistic state.
  const refreshFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const { fetchSkillsFromSupabase, fetchProjectsFromSupabase, fetchProfileFromSupabase } =
      await loadSupabaseService();
    const [remoteSkills, remoteProjects, remoteProfile] = await Promise.all([
      fetchSkillsFromSupabase(),
      fetchProjectsFromSupabase(),
      fetchProfileFromSupabase(),
    ]);

    if (remoteSkills && remoteSkills.length > 0) {
      handleUpdateSkills(remoteSkills);
    }
    if (remoteProjects && remoteProjects.length > 0) {
      handleUpdateProjects(remoteProjects);
    }
    if (remoteProfile) {
      if (remoteProfile.email) HERO_DATA.socials.email = remoteProfile.email;
      if (remoteProfile.github_url) HERO_DATA.socials.github = remoteProfile.github_url;
      if (remoteProfile.gitlab_url) HERO_DATA.socials.gitlab = remoteProfile.gitlab_url;
      if (remoteProfile.linkedin_url) HERO_DATA.socials.linkedin = remoteProfile.linkedin_url;
    }
  }, [handleUpdateSkills, handleUpdateProjects]);

  // The page renders from local data first; the live refresh is not urgent.
  useEffect(() => {
    whenIdle(() => {
      void refreshFromSupabase();
    });
  }, [refreshFromSupabase]);

  // Admin mode follows the real Supabase Auth session, not a local flag: the
  // write policies only accept an authenticated session, so showing the panel
  // without one would let every change fail silently. This also picks up token
  // refreshes, expirations and sign-outs from other tabs.
  useEffect(() => {
    // Legacy flag from the previous implementation; it no longer means anything.
    localStorage.removeItem('elias_is_admin');
    if (!isSupabaseConfigured) return;

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    loadSupabase().then(({ supabase }) => {
      if (cancelled || !supabase) return;
      supabase.auth.getSession().then(({ data }) => {
        if (!cancelled) setIsAdmin(Boolean(data.session));
      });
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAdmin(Boolean(session));
        if (!session) setIsAdminPanelOpen(false);
      });
      unsubscribe = () => listener.subscription.unsubscribe();
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  // The browser tries to jump to a URL fragment (e.g. /#projects from the 404
  // page or a shared link) before React has rendered the section, so retry once
  // the page is on screen.
  useEffect(() => {
    let id = window.location.hash.slice(1);
    try {
      id = decodeURIComponent(id);
    } catch {
      // Malformed escape sequence: fall back to the raw fragment.
    }
    if (!id) return;
    // The target section is lazy-loaded, so poll briefly until it mounts.
    const deadline = Date.now() + 5000;
    let frame = 0;
    const tryScroll = () => {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView();
        return;
      }
      if (Date.now() < deadline) frame = requestAnimationFrame(tryScroll);
    };
    frame = requestAnimationFrame(tryScroll);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (isAdmin) loadAdminPanel();
  }, [isAdmin]);

  // Warm the deferred chunks once the page is interactive.
  useEffect(() => {
    whenIdle(() => {
      void loadContactModal();
      void loadProjectModal();
      void loadAdminLogin();
    });
  }, []);

  const handleAdminTrigger = () => {
    if (isAdmin) {
      setIsAdminPanelOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    setIsAdminPanelOpen(true);
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      const { supabase } = await loadSupabase();
      await supabase?.auth.signOut();
    }
    setIsAdmin(false);
    setIsAdminPanelOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Skip link: first tab stop, lets keyboard users bypass the nav (WCAG 2.4.1) */}
      <a href="#main-content" className="skip-link">
        {language === 'es' ? 'Saltar al contenido principal' : 'Skip to main content'}
      </a>

      {/* Top Navbar */}
      <Navbar
        onOpenContact={() => setIsContactOpen(true)}
        onOpenAdminLogin={handleAdminTrigger}
        isAdmin={isAdmin}
      />

      {/* Hero Section */}
      <main id="main-content">
        <Hero onOpenContact={() => setIsContactOpen(true)} />

        {/* About & Story Section */}
        <About />

        {/* Technical Skills Matrix */}
        <SkillsMatrix categories={skillCategories} />

        {/* Featured Projects & Architecture */}
        <Projects projects={projects} onSelectProject={(project) => setSelectedProject(project)} />

        {/* Engineering Workflow */}
        <EngineeringPhilosophy />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Drawers */}
      <Suspense fallback={null}>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}

        {isContactOpen && (
          <ContactModal
            isOpen={isContactOpen}
            onClose={() => setIsContactOpen(false)}
          />
        )}

        {isAdminLoginOpen && (
          <AdminLoginModal
            isOpen={isAdminLoginOpen}
            onClose={() => setIsAdminLoginOpen(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </Suspense>

      {isAdminPanelOpen && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" role="status">
              <span className="text-xs font-mono text-slate-300">
                {language === 'es' ? 'Cargando panel…' : 'Loading panel…'}
              </span>
            </div>
          }
        >
          <AdminPanel
            isOpen={isAdminPanelOpen}
            onClose={() => setIsAdminPanelOpen(false)}
            onLogout={handleLogout}
            skillCategories={skillCategories}
            projects={projects}
            onUpdateSkills={handleUpdateSkills}
            onUpdateProjects={handleUpdateProjects}
            onReloadFromDb={refreshFromSupabase}
          />
        </Suspense>
      )}
    </div>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
