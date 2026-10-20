/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Briefcase,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  MapPin,
  Clock,
  Filter,
  PlusCircle
} from 'lucide-react';
import type { Opportunity } from '../../types/database.ts';

interface OpportunityBoardProps {
  opportunities: Opportunity[];
  onSaveToApplications: (opp: Opportunity) => void;
}

export const OpportunityBoard: React.FC<OpportunityBoardProps> = ({
  opportunities,
  onSaveToApplications,
}) => {
  const [filterDept, setFilterDept] = useState<'all' | 'deck' | 'interior'>('all');
  const [filterContract, setFilterContract] = useState<'all' | 'seasonal' | 'permanent' | 'daywork'>('all');

  const filtered = opportunities.filter((o) => {
    if (filterDept !== 'all' && o.department !== filterDept) return false;
    if (filterContract !== 'all' && o.contractType !== filterContract) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Direct Partner Submissions & Outbound Listings</span>
          </div>
          <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">
            Curated Yacht Crew Opportunities
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Strictly authorized employer submissions and direct links. GYCS does not scrape job boards or charge crew placement fees (SA ESA s.15 & MLC compliant).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs rounded-xl font-medium">
            Zero Fee To Work Seekers
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>Department:</span>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Departments</option>
            <option value="deck">Deck Department</option>
            <option value="interior">Interior Department</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span>Contract Type:</span>
          <select
            value={filterContract}
            onChange={(e) => setFilterContract(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Contracts</option>
            <option value="seasonal">Seasonal</option>
            <option value="permanent">Permanent</option>
            <option value="daywork">Daywork (Reported Separately)</option>
          </select>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((opp) => (
          <div
            key={opp.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                  opp.contractType === 'daywork'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {opp.contractType}
                </span>

                {opp.isVerifiedEmployer && (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Partner
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                {opp.title}
              </h3>
              <p className="text-xs text-emerald-400 font-medium mt-0.5">
                {opp.employerName} · {opp.vesselType}
              </p>

              <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {opp.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Posted {opp.postedDate}
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                {opp.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
              <a
                href={opp.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-medium"
              >
                <span>Outbound Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => onSaveToApplications(opp)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Save to Applications</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
