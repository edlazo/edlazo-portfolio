import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { SkillsMatrix } from './components/SkillsMatrix';
import { Projects } from './components/Projects';
import { ProjectModal } from './components/ProjectModal';
import { EngineeringPhilosophy } from './components/EngineeringPhilosophy';
import { ContactModal } from './components/ContactModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import {
  SKILL_CATEGORIES as initialCategories,
  FEATURED_PROJECTS as initialProjects,
  HERO_DATA,
} from './data/portfolioData';
import type { Project, SkillCategory } from './types/portfolio';
import { supabase } from './lib/supabase';
import {
  fetchSkillsFromSupabase,
  fetchProjectsFromSupabase,
  fetchProfileFromSupabase,
} from './lib/supabaseService';

export function AppContent() {
  const { language } = useLanguage();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Dynamic portfolio state (persisted locally / synced with Supabase)
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>(() => {
    const saved = localStorage.getItem('elias_skills');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('elias_projects');
    return saved ? JSON.parse(saved) : initialProjects;
  });

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

  useEffect(() => {
    refreshFromSupabase();
  }, [refreshFromSupabase]);

  // Admin mode follows the real Supabase Auth session, not a local flag: the
  // write policies only accept an authenticated session, so showing the panel
  // without one would let every change fail silently. This also picks up token
  // refreshes, expirations and sign-outs from other tabs.
  useEffect(() => {
    // Legacy flag from the previous implementation; it no longer means anything.
    localStorage.removeItem('elias_is_admin');
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => setIsAdmin(Boolean(data.session)));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(Boolean(session));
      if (!session) setIsAdminPanelOpen(false);
    });
    return () => listener.subscription.unsubscribe();
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
    const frame = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView();
    });
    return () => cancelAnimationFrame(frame);
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
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsAdmin(false);
    setIsAdminPanelOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans">
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
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

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
