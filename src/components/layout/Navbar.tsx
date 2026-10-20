/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Anchor,
  Compass,
  FileText,
  Calendar,
  GraduationCap,
  Briefcase,
  Layers,
  ShieldCheck,
  Users,
  CheckSquare,
  MapPin,
  Settings,
  Menu,
  X,
  FileCheck2,
  LifeBuoy,
  Globe
} from 'lucide-react';
import type { UserProfile } from '../../types/database.ts';

interface NavbarProps {
  currentProfile: UserProfile;
  allProfiles: UserProfile[];
  onSelectProfile: (profile: UserProfile) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenOpenDecisions: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentProfile,
  allProfiles,
  onSelectProfile,
  activeTab,
  onSelectTab,
  onOpenOpenDecisions,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isCoach = currentProfile.role === 'coach';

  const memberNavItems = [
    { id: 'today', label: 'Today', icon: Compass },
    { id: 'job_search', label: 'Job Search (Map)', icon: Globe },
    { id: 'intake', label: 'Find My Route', icon: LifeBuoy },
    { id: 'pathway', label: 'My Pathway', icon: Layers },
    { id: 'learn', label: 'Learn', icon: GraduationCap },
    { id: 'live', label: 'Live Room', icon: Calendar },
    { id: 'documents', label: 'Documents', icon: FileCheck2 },
    { id: 'cv', label: 'CV Studio', icon: FileText },
    { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
    { id: 'applications', label: 'Applications', icon: CheckSquare },
    { id: 'explore', label: 'Explore', icon: MapPin },
    { id: 'settings', label: 'POPIA & Settings', icon: Settings },
  ];

  const coachNavItems = [
    { id: 'console', label: 'Intervention Queue', icon: Users },
    { id: 'job_search', label: 'Job Search (Map)', icon: Globe },
    { id: 'readiness', label: 'Readiness Matrix', icon: ShieldCheck },
    { id: 'outcomes', label: 'Outcome Recording', icon: Briefcase },
    { id: 'pathway', label: 'Curriculum & Rules', icon: Layers },
    { id: 'documents', label: 'Evidence Queue', icon: FileCheck2 },
    { id: 'settings', label: 'Settings & Flags', icon: Settings },
  ];

  const navItems = isCoach ? coachNavItems : memberNavItems;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 border-b border-slate-800/80 backdrop-blur-md">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-950/50 shrink-0">
              <Anchor className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm sm:text-lg tracking-tight text-white font-['Space_Grotesk'] truncate">
                  GYCS <span className="text-emerald-400">CREW HUB</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Pilot v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden lg:block truncate">
                Start your yacht career with a plan — not an expensive guess.
              </p>
            </div>
          </div>

          {/* Center/Right Action & Profile switcher */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Open Decisions Human Button */}
            <button
              onClick={onOpenOpenDecisions}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800/80 text-amber-300 border border-amber-500/30 hover:bg-slate-800 transition"
              title="Review open decisions requiring Chad / Legal / Medical action"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Open Decisions (Human)</span>
            </button>

            {/* Role & Persona Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <select
                id="persona-select"
                value={currentProfile.id}
                onChange={(e) => {
                  const p = allProfiles.find((x) => x.id === e.target.value);
                  if (p) {
                    onSelectProfile(p);
                    if (p.role === 'coach') onSelectTab('console');
                    else onSelectTab('today');
                  }
                }}
                aria-label="Select active candidate or coach persona"
                className="bg-slate-950 text-[11px] sm:text-xs text-slate-200 border border-slate-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer font-medium max-w-[130px] sm:max-w-[180px] truncate"
              >
                {allProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.role === 'coach' ? `🛡️ ${p.displayName}` : `👤 ${p.displayName}`}
                  </option>
                ))}
              </select>

              {/* Fast Role Indicator Badge */}
              <button
                onClick={() => {
                  if (isCoach) {
                    const memberProfile = allProfiles.find((x) => x.role === 'member') || allProfiles[0];
                    onSelectProfile(memberProfile);
                    onSelectTab('today');
                  } else {
                    const coachProfile = allProfiles.find((x) => x.role === 'coach') || allProfiles[allProfiles.length - 1];
                    onSelectProfile(coachProfile);
                    onSelectTab('console');
                  }
                }}
                className={`text-[10px] sm:text-[11px] px-2 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                  isCoach
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                }`}
                title="Click to toggle between Member & Coach Console"
              >
                {isCoach ? 'Coach' : 'Member'}
              </button>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sub-Nav Navigation Tabs */}
      <nav className="hidden md:block bg-slate-950/60 border-t border-slate-800/60 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 py-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-2 pb-6 space-y-1">
          <div className="py-2 mb-2 border-b border-slate-800 text-xs text-slate-400">
            Active: <span className="font-semibold text-slate-200">{currentProfile.displayName}</span> ({currentProfile.role})
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={() => {
                onOpenOpenDecisions();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-300 bg-amber-500/10 rounded-lg border border-amber-500/30 font-medium"
            >
              Open Decisions Requiring a Human
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
