import { useState, useEffect } from 'react';
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
import { LanguageProvider } from './context/LanguageContext';
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

  // Fetch live Supabase data on mount
  useEffect(() => {
    const adminState = localStorage.getItem('elias_is_admin') === 'true';
    setIsAdmin(adminState);

    async function loadSupabaseData() {
      const [remoteSkills, remoteProjects, remoteProfile] = await Promise.all([
        fetchSkillsFromSupabase(),
        fetchProjectsFromSupabase(),
        fetchProfileFromSupabase(),
      ]);

      if (remoteSkills && remoteSkills.length > 0) {
        setSkillCategories(remoteSkills);
      }
      if (remoteProjects && remoteProjects.length > 0) {
        setProjects(remoteProjects);
      }
      if (remoteProfile) {
        if (remoteProfile.email) HERO_DATA.socials.email = remoteProfile.email;
        if (remoteProfile.github_url) HERO_DATA.socials.github = remoteProfile.github_url;
        if (remoteProfile.gitlab_url) HERO_DATA.socials.gitlab = remoteProfile.gitlab_url;
        if (remoteProfile.linkedin_url) HERO_DATA.socials.linkedin = remoteProfile.linkedin_url;
      }
    }

    loadSupabaseData();
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
    localStorage.removeItem('elias_is_admin');
    setIsAdmin(false);
    setIsAdminPanelOpen(false);
  };

  const handleUpdateSkills = (updatedCategories: SkillCategory[]) => {
    setSkillCategories(updatedCategories);
    localStorage.setItem('elias_skills', JSON.stringify(updatedCategories));
  };

  const handleUpdateProjects = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    localStorage.setItem('elias_projects', JSON.stringify(updatedProjects));
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenContact={() => setIsContactOpen(true)}
        onOpenAdminLogin={handleAdminTrigger}
        isAdmin={isAdmin}
      />

      {/* Hero Section */}
      <main>
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
