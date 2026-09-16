import React from 'react';
import {
  Brain,
  Cloud,
  Code2,
  Cpu,
  Database,
  Globe,
  Layers,
  Palette,
  Server,
  ShieldCheck,
  Smartphone,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

// Icons a skill category can use. The `name` is what's stored in
// skill_categories.icon, so existing names must never change.
export const CATEGORY_ICONS: { name: string; Icon: LucideIcon; color: string; label: { es: string; en: string } }[] = [
  { name: 'Server', Icon: Server, color: 'text-amber-400', label: { es: 'Servidor', en: 'Server' } },
  { name: 'Smartphone', Icon: Smartphone, color: 'text-cyan-400', label: { es: 'Celular', en: 'Phone' } },
  { name: 'Cpu', Icon: Cpu, color: 'text-purple-400', label: { es: 'Procesador', en: 'Chip' } },
  { name: 'ShieldCheck', Icon: ShieldCheck, color: 'text-emerald-400', label: { es: 'Seguridad', en: 'Security' } },
  { name: 'Database', Icon: Database, color: 'text-sky-400', label: { es: 'Base de datos', en: 'Database' } },
  { name: 'Cloud', Icon: Cloud, color: 'text-blue-400', label: { es: 'Nube', en: 'Cloud' } },
  { name: 'Code2', Icon: Code2, color: 'text-teal-400', label: { es: 'Código', en: 'Code' } },
  { name: 'Layers', Icon: Layers, color: 'text-indigo-400', label: { es: 'Capas', en: 'Layers' } },
  { name: 'Brain', Icon: Brain, color: 'text-pink-400', label: { es: 'IA', en: 'AI' } },
  { name: 'Palette', Icon: Palette, color: 'text-rose-400', label: { es: 'Diseño', en: 'Design' } },
  { name: 'Globe', Icon: Globe, color: 'text-lime-400', label: { es: 'Web', en: 'Web' } },
  { name: 'Wrench', Icon: Wrench, color: 'text-orange-400', label: { es: 'Herramientas', en: 'Tools' } },
];

export const DEFAULT_CATEGORY_ICON = 'Server';

export const CategoryIcon: React.FC<{ name: string; className?: string }> = ({ name, className = 'w-5 h-5' }) => {
  const entry = CATEGORY_ICONS.find((icon) => icon.name === name) ?? CATEGORY_ICONS[0];
  return <entry.Icon className={`${className} ${entry.color}`} aria-hidden="true" />;
};
