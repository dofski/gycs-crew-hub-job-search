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
  PlusCircle,
  Search,
  Globe,
  Building2,
  Loader2
} from 'lucide-react';
import type { Opportunity } from '../../types/database.ts';

interface OpportunityBoardProps {
  opportunities: Opportunity[];
  onSaveToApplications: (opp: Opportunity) => void;
  accessToken?: string;
}

export const OpportunityBoard: React.FC<OpportunityBoardProps> = ({
  opportunities,
  onSaveToApplications,
  accessToken,
}) => {
  const [filterDept, setFilterDept] = useState<'all' | 'deck' | 'interior' | 'engineering' | 'galley'>('all');
  const [filterContract, setFilterContract] = useState<'all' | 'seasonal' | 'permanent' | 'daywork' | 'rotational'>('all');

  // Live Authenticated Job Search state (/api/job-search -> JSearch)
  const [searchQuery, setSearchQuery] = useState('yacht deckhand');
  const [searchCountry, setSearchCountry] = useState('');
  const [datePosted, setDatePosted] = useState('all');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [liveResults, setLiveResults] = useState<Opportunity[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Employer Domain Contact Lookup state (/api/job-search -> Outscraper)
  const [domainQuery, setDomainQuery] = useState('');
  const [lookingUpDomain, setLookingUpDomain] = useState(false);
  const [domainError, setDomainError] = useState('');
  const [domainContacts, setDomainContacts] = useState<any[] | null>(null);

  const filtered = opportunities.filter((o) => {
    if (filterDept !== 'all' && o.department !== filterDept) return false;
    if (filterContract !== 'all' && o.contractType !== filterContract) return false;
    return true;
  });

  async function callJobSearchProxy(payload: Record<string, unknown>) {
    if (!accessToken) throw new Error('Sign in with an active GYCS member account to search live jobs.');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };
    const res = await fetch('/api/job-search', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Search request failed (${res.status}).`);
      return data;
    }
    // Fallback to Supabase Edge Function directly
    const edgeRes = await fetch('https://wfblxexdqlxeequvywfc.supabase.co/functions/v1/job-search-proxy', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const edgeData = await edgeRes.json().catch(() => ({}));
    if (!edgeRes.ok) throw new Error(edgeData?.error || `Search proxy failed (${edgeRes.status}).`);
    return edgeData;
  }

  const handleLiveSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setSearchError('');
    setHasSearched(true);
    try {
      const res = await callJobSearchProxy({
        action: 'search_jobs',
        query: searchQuery.trim() || 'yacht crew',
        country: searchCountry.trim(),
        date_posted: datePosted,
      });
      const rawJobs: any[] = Array.isArray(res?.data) ? res.data : [];
      const mapped: Opportunity[] = rawJobs.map((j: any, i: number) => {
        const titleLower = String(j.job_title || '').toLowerCase();
        const dept = titleLower.includes('steward') || titleLower.includes('interior')
          ? 'interior'
          : titleLower.includes('engineer')
            ? 'engineering'
            : titleLower.includes('chef') || titleLower.includes('cook') || titleLower.includes('galley')
              ? 'galley'
              : 'deck';
        return {
          id: String(j.job_id || `live-${i}`),
          title: String(j.job_title || 'Yacht Crew Vacancy'),
          department: dept,
          employerName: String(j.employer_name || 'External Employer'),
          location: [j.job_city, j.job_state, j.job_country].filter(Boolean).join(', ') || 'International',
          vesselType: String(j.job_publisher || 'External Job Listing'),
          contractType: String(j.job_employment_type || '').toLowerCase().includes('part') ? 'seasonal' : 'permanent',
          description: String(j.job_description || '').slice(0, 360) + (String(j.job_description || '').length > 360 ? '…' : ''),
          externalUrl: String(j.job_apply_link || j.job_google_link || ''),
          source: 'partner',
          isVerifiedEmployer: false,
          postedDate: j.job_posted_at_datetime_utc ? String(j.job_posted_at_datetime_utc).slice(0, 10) : 'Recent',
        };
      });
      setLiveResults(mapped);
    } catch (err: any) {
      setSearchError(err?.message || 'Live job search failed.');
    } finally {
      setSearching(false);
    }
  };

  const handleDomainLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainQuery.trim()) return;
    setLookingUpDomain(true);
    setDomainError('');
    setDomainContacts(null);
    try {
      const res = await callJobSearchProxy({
        action: 'employer_contacts',
        domain: domainQuery.trim(),
      });
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [res];
      setDomainContacts(list);
    } catch (err: any) {
      setDomainError(err?.message || 'Employer contact lookup failed.');
    } finally {
      setLookingUpDomain(false);
    }
  };

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

      {/* Live Authenticated Job Search & Employer Contact Lookup */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Globe className="w-4 h-4" />
              <span>Authenticated Live Job Search (JSearch) &amp; Agency Contact Lookup</span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              Search Real-Time Maritime &amp; Yacht Crew Vacancies
            </h3>
          </div>
        </div>

        <form onSubmit={handleLiveSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <label className="block text-[11px] text-slate-400 mb-1">Role / Keyword Query</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. yacht deckhand, stewardess, marine engineer, yacht chef"
              className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] text-slate-400 mb-1">Country (ISO)</label>
            <select
              value={searchCountry}
              onChange={(e) => setSearchCountry(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-xl px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Countries</option>
              <option value="fr">France (FR)</option>
              <option value="es">Spain (ES)</option>
              <option value="it">Italy (IT)</option>
              <option value="us">United States (US)</option>
              <option value="gb">United Kingdom (GB)</option>
              <option value="za">South Africa (ZA)</option>
              <option value="gr">Greece (GR)</option>
              <option value="au">Australia (AU)</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] text-slate-400 mb-1">Date Posted</label>
            <select
              value={datePosted}
              onChange={(e) => setDatePosted(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-xl px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Any time</option>
              <option value="today">Today</option>
              <option value="3days">Last 3 days</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
            </select>
          </div>
          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={searching}
              className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>{searching ? 'Searching…' : 'Search Jobs'}</span>
            </button>
          </div>
        </form>

        {searchError && (
          <p role="alert" className="text-xs text-rose-300 bg-rose-950/40 border border-rose-700/50 rounded-xl p-3">
            {searchError}
          </p>
        )}

        {hasSearched && !searching && !searchError && liveResults.length === 0 && (
          <p className="text-xs text-slate-400">No live external listings matched that query. Try a broader term such as "yacht" or "deckhand".</p>
        )}

        {liveResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {liveResults.map((opp) => (
              <div
                key={opp.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      Live Search · {opp.department}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{opp.postedDate}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{opp.title}</h4>
                  <p className="text-xs text-emerald-400 font-medium mt-0.5">
                    {opp.employerName} · {opp.location}
                  </p>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{opp.description}</p>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  {opp.externalUrl ? (
                    <a
                      href={opp.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-300 hover:text-white flex items-center gap-1 underline"
                    >
                      <span>View Source Listing</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-500">Direct listing</span>
                  )}
                  <button
                    type="button"
                    onClick={() => onSaveToApplications({ ...opp, id: '' })}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Save to Applications</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Employer Contact Lookup */}
        <form onSubmit={handleDomainLookup} className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="block text-[11px] text-slate-400 mb-1">
              <Building2 className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />
              Employer / Crew Agency Domain Contact Lookup (Outscraper)
            </label>
            <input
              type="text"
              value={domainQuery}
              onChange={(e) => setDomainQuery(e.target.value)}
              placeholder="e.g. bluewateryachting.com or burgessyachts.com"
              className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={lookingUpDomain || !domainQuery.trim()}
            className="py-2 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-xl text-xs font-semibold transition shrink-0"
          >
            {lookingUpDomain ? 'Looking up…' : 'Lookup Domain Contacts'}
          </button>
        </form>

        {domainError && <p className="text-xs text-rose-300">{domainError}</p>}
        {domainContacts && (
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-1">
            <strong className="text-emerald-300 block">Domain Contact Results ({domainQuery}):</strong>
            <pre className="text-[11px] font-mono overflow-x-auto whitespace-pre-wrap text-slate-300">
              {JSON.stringify(domainContacts, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Filter Bar for Verified Partner Submissions */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>Verified Partner Department:</span>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Departments</option>
            <option value="deck">Deck Department</option>
            <option value="interior">Interior Department</option>
            <option value="engineering">Engineering Department</option>
            <option value="galley">Galley / Chef</option>
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
            <option value="rotational">Rotational</option>
            <option value="daywork">Daywork (Reported Separately)</option>
          </select>
        </div>
      </div>

      {/* Opportunities List */}
      {filtered.length === 0 ? (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-400">
          No direct verified-employer submissions are currently active in the database. Use the <strong>Live Job Search</strong> above to search real-time yacht crew vacancies and save them to your Applications tracker.
        </div>
      ) : (
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
      )}
    </div>
  );
};
