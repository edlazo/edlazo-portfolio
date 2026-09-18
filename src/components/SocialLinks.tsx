import React from 'react';
import { ArrowUpRight, Mail } from 'lucide-react';
import { HERO_DATA } from '../data/portfolioData';
import { useLanguage } from '../context/LanguageContext';
import { GithubIcon, GitlabIcon, LinkedinIcon } from './Icons';

/**
 * The contact links, shown as labelled buttons in the hero and the footer.
 * External ones carry the ↗ mark plus a note for screen readers, since the
 * arrow itself is decorative.
 */
export const SocialLinks: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { t } = useLanguage();

  const links = [
    { key: 'github', label: 'GitHub', href: HERO_DATA.socials.github, icon: GithubIcon, external: true },
    { key: 'gitlab', label: 'GitLab', href: HERO_DATA.socials.gitlab, icon: GitlabIcon, external: true },
    { key: 'linkedin', label: 'LinkedIn', href: HERO_DATA.socials.linkedin, icon: LinkedinIcon, external: true },
    { key: 'email', label: 'Email', href: `mailto:${HERO_DATA.socials.email}`, icon: Mail, external: false },
  ];

  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {links.map(({ key, label, href, icon: Icon, external }) => (
        <a
          key={key}
          href={href}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="group flex items-center gap-2 px-3 py-2 border border-slate-800 text-slate-300 hover:text-white hover:border-amber-500/60 hover:bg-amber-500/5 transition-all text-xs font-label"
        >
          <Icon className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-amber-400 transition-colors" />
          <span>{label}</span>
          {external && (
            <>
              <ArrowUpRight
                className="w-3.5 h-3.5 shrink-0 text-slate-500 group-hover:text-amber-400 transition-colors"
                aria-hidden="true"
              />
              <span className="sr-only">
                {t({ es: '(se abre en una pestaña nueva)', en: '(opens in a new tab)' })}
              </span>
            </>
          )}
        </a>
      ))}
    </div>
  );
};
