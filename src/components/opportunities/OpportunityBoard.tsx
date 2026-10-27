/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Briefcase,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Clock,
  Filter,
  PlusCircle,
  Search,
  Globe,
  Building2,
  Loader2,
  DollarSign,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { Opportunity } from '../../types/database.ts';

interface OpportunityBoardProps {
  opportunities: Opportunity[];
  onSaveToApplications: (opp: Opportunity) => void;
  accessToken?: string;
}

interface LiveJobItem extends Opportunity {
  rawJobId?: string;
  countryCode?: string;
  fullDescription?: string;
  highlights?: Record<string, string[]>;
  applyOptions?: Array<{ publisher?: string; apply_link?: string; is_direct?: boolean }>;
}

export const OpportunityBoard: React.FC<OpportunityBoardProps> = ({
  opportunities,
  onSaveToApplications,
  accessToken,
}) => {
  const [filterDept, setFilterDept] = useState<'all' | 'deck' | 'interior' | 'engineering' | 'galley'>('all');
  const [filterContract, setFilterContract] = useState<'all' | 'seasonal' | 'permanent' | 'daywork' | 'rotational'>('all');

  // Live Authenticated Job Search state (/api/job-search -> JSearch Mega /search)
  const [searchQuery, setSearchQuery] = useState('yacht deckhand');
  const [searchCountry, setSearchCountry] = useState('');
  const [datePosted, setDatePosted] = useState('all');
  const [searchPage, setSearchPage] = useState(1);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [liveResults, setLiveResults] = useState<LiveJobItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Full Job Details state (/api/job-search -> JSearch Mega /job-details)
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [loadingJobId, setLoadingJobId] = useState<string | null>(null);
  const [jobDetailsById, setJobDetailsById] = useState<Record<string, any>>({});

  // Salary Benchmark state (/api/job-search -> JSearch Mega /estimated-salary & /company-job-salary)
  const [salaryMode, setSalaryMode] = useState<'estimated' | 'company'>('estimated');
  const [salaryJobTitle, setSalaryJobTitle] = useState('marine engineer');
  const [salaryLocation, setSalaryLocation] = useState('United States');
  const [salaryCompany, setSalaryCompany] = useState('Carnival');
  const [loadingSalary, setLoadingSalary] = useState(false);
  const [salaryError, setSalaryError] = useState('');
  const [salaryResults, setSalaryResults] = useState<any[] | null>(null);

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

  const executeLiveSearch = async (pageToLoad: number) => {
    setSearching(true);
    setSearchError('');
    setHasSearched(true);
    try {
      const res = await callJobSearchProxy({
        action: 'search_jobs',
        query: searchQuery.trim() || 'yacht crew',
        page: pageToLoad,
        country: searchCountry.trim(),
        date_posted: datePosted,
      });
      const rawJobs: any[] = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.jobs)
          ? res.data.jobs
          : [];
      const mapped: LiveJobItem[] = rawJobs.map((j: any, i: number) => {
        const titleLower = String(j.job_title || '').toLowerCase();
        const dept =
          titleLower.includes('steward') || titleLower.includes('interior')
            ? 'interior'
            : titleLower.includes('engineer') || titleLower.includes('eto')
              ? 'engineering'
              : titleLower.includes('chef') || titleLower.includes('cook') || titleLower.includes('galley')
                ? 'galley'
                : 'deck';
        const fullDesc = String(j.job_description || '');
        return {
          id: String(j.job_id || `live-${pageToLoad}-${i}`),
          rawJobId: j.job_id ? String(j.job_id) : undefined,
          countryCode: String(j.job_country || searchCountry || 'us').toLowerCase(),
          title: String(j.job_title || 'Yacht Crew Vacancy'),
          department: dept,
          employerName: String(j.employer_name || 'External Employer'),
          location: [j.job_city, j.job_state, j.job_country].filter(Boolean).join(', ') || 'International',
          vesselType: String(j.job_publisher || 'External Job Listing'),
          contractType: String(j.job_employment_type || '').toLowerCase().includes('part')
            ? 'seasonal'
            : 'permanent',
          description: fullDesc.slice(0, 360) + (fullDesc.length > 360 ? '…' : ''),
          fullDescription: fullDesc,
          highlights: j.job_highlights && typeof j.job_highlights === 'object' ? j.job_highlights : undefined,
          applyOptions: Array.isArray(j.apply_options) ? j.apply_options : undefined,
          externalUrl: String(j.job_apply_link || j.job_google_link || ''),
          source: 'partner',
          isVerifiedEmployer: false,
          postedDate: j.job_posted_at_datetime_utc
            ? String(j.job_posted_at_datetime_utc).slice(0, 10)
            : j.job_posted_at
              ? String(j.job_posted_at)
              : 'Recent',
        };
      });
      setLiveResults(mapped);
      setSearchPage(pageToLoad);
    } catch (err: any) {
      setSearchError(err?.message || 'Live job search failed.');
    } finally {
      setSearching(false);
    }
  };

  const handleLiveSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeLiveSearch(1);
  };

  const handleInspectJobDetails = async (opp: LiveJobItem) => {
    if (expandedJobId === opp.id) {
      setExpandedJobId(null);
      return;
    }
    setExpandedJobId(opp.id);
    if (!opp.rawJobId || jobDetailsById[opp.id]) return;

    setLoadingJobId(opp.id);
    try {
      const res = await callJobSearchProxy({
        action: 'job_details',
        job_id: opp.rawJobId,
        country: opp.countryCode || searchCountry || 'us',
      });
      const detailItem = Array.isArray(res?.data) ? res.data[0] : res?.data;
      if (detailItem) {
        setJobDetailsById((prev) => ({ ...prev, [opp.id]: detailItem }));
      }
    } catch {
      // Fallback to already-fetched search payload fields
    } finally {
      setLoadingJobId(null);
    }
  };

  const handleSalaryLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSalary(true);
    setSalaryError('');
    setSalaryResults(null);
    try {
      const payload =
        salaryMode === 'estimated'
          ? {
              action: 'estimated_salary',
              job_title: salaryJobTitle.trim(),
              location: salaryLocation.trim(),
              location_type: 'ANY',
              years_of_experience: 'ALL',
            }
          : {
              action: 'company_job_salary',
              company: salaryCompany.trim(),
              job_title: salaryJobTitle.trim(),
              location_type: 'ANY',
              years_of_experience: 'ALL',
            };
      const res = await callJobSearchProxy(payload);
      const list = Array.isArray(res?.data) ? res.data : [];
      setSalaryResults(list);
    } catch (err: any) {
      setSalaryError(err?.message || 'Salary benchmark lookup failed.');
    } finally {
      setLoadingSalary(false);
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

  const formatMoney = (val: unknown, currency = 'USD') => {
    const num = Number(val);
    if (!Number.isFinite(num) || num <= 0) return '—';
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        maximumFractionDigits: 0,
      }).format(num);
    } catch {
      return `${currency} ${Math.round(num).toLocaleString()}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Direct Partner Submissions &amp; Outbound Listings</span>
          </div>
          <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">
            Curated Yacht Crew Opportunities
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Strictly authorized employer submissions and direct links. GYCS does not charge crew placement fees (SA ESA s.15 &amp; MLC compliant).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs rounded-xl font-medium">
            Zero Fee To Work Seekers
          </span>
        </div>
      </div>

      {/* Live Authenticated Job Search (JSearch Mega) */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Globe className="w-4 h-4" />
              <span>Authenticated Live Job Search (JSearch Mega API) &amp; Agency Contact Lookup</span>
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
          <p className="text-xs text-slate-400">
            No live external listings matched that query. Try a broader term such as &quot;yacht&quot; or &quot;deckhand&quot;.
          </p>
        )}

        {liveResults.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>
                Showing {liveResults.length} results (Page {searchPage})
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={searching || searchPage <= 1}
                  onClick={() => void executeLiveSearch(searchPage - 1)}
                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 rounded-lg text-slate-200 flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>
                <button
                  type="button"
                  disabled={searching}
                  onClick={() => void executeLiveSearch(searchPage + 1)}
                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 rounded-lg text-slate-200 flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveResults.map((opp) => {
                const detail = jobDetailsById[opp.id];
                const isExpanded = expandedJobId === opp.id;
                const isLoadingDetail = loadingJobId === opp.id;
                const fullText = detail?.job_description || opp.fullDescription || opp.description;
                const highlights: Record<string, string[]> | undefined =
                  detail?.job_highlights || opp.highlights;
                const applyOptions: Array<{ publisher?: string; apply_link?: string }> =
                  detail?.apply_options || opp.applyOptions || [];

                return (
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
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed whitespace-pre-line">
                        {isExpanded ? fullText : opp.description}
                      </p>

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                          {isLoadingDetail && (
                            <p className="text-slate-400 flex items-center gap-1.5">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                              Fetching extended job details…
                            </p>
                          )}
                          {highlights &&
                            Object.entries(highlights).map(([sectionName, bullets]) =>
                              Array.isArray(bullets) && bullets.length > 0 ? (
                                <div key={sectionName}>
                                  <span className="font-bold text-slate-200 block mb-1">
                                    {sectionName}:
                                  </span>
                                  <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                                    {bullets.slice(0, 6).map((b, idx) => (
                                      <li key={idx}>{b}</li>
                                    ))}
                                  </ul>
                                </div>
                              ) : null
                            )}
                          {applyOptions.length > 1 && (
                            <div>
                              <span className="font-bold text-slate-200 block mb-1">
                                Apply Channels:
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {applyOptions.map((opt, idx) =>
                                  opt.apply_link ? (
                                    <a
                                      key={idx}
                                      href={opt.apply_link}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[11px] text-emerald-300 hover:text-white flex items-center gap-1"
                                    >
                                      <span>{opt.publisher || 'Publisher'}</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  ) : null
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => void handleInspectJobDetails(opp)}
                          className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
                        >
                          <FileText className="w-3 h-3" />
                          <span>{isExpanded ? 'Hide Details' : 'Full Job Details'}</span>
                        </button>

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
                      </div>

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
                );
              })}
            </div>
          </div>
        )}

        {/* Maritime & Crew Salary Benchmark (JSearch Mega /estimated-salary & /company-job-salary) */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Maritime &amp; Employer Salary Benchmark (JSearch Mega)</span>
            </div>
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setSalaryMode('estimated')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  salaryMode === 'estimated'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                By Role &amp; Location
              </button>
              <button
                type="button"
                onClick={() => setSalaryMode('company')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  salaryMode === 'company'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                By Company &amp; Role
              </button>
            </div>
          </div>

          <form onSubmit={handleSalaryLookup} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            {salaryMode === 'company' && (
              <div className="sm:col-span-4">
                <label className="block text-[11px] text-slate-400 mb-1">Company / Fleet Name</label>
                <input
                  type="text"
                  value={salaryCompany}
                  onChange={(e) => setSalaryCompany(e.target.value)}
                  placeholder="e.g. Carnival, Royal Caribbean, Hornblower"
                  className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            )}
            <div className={salaryMode === 'company' ? 'sm:col-span-5' : 'sm:col-span-5'}>
              <label className="block text-[11px] text-slate-400 mb-1">Job Title</label>
              <input
                type="text"
                value={salaryJobTitle}
                onChange={(e) => setSalaryJobTitle(e.target.value)}
                placeholder="e.g. marine engineer, deckhand, captain, chef"
                className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            {salaryMode === 'estimated' && (
              <div className="sm:col-span-4">
                <label className="block text-[11px] text-slate-400 mb-1">Location / Region</label>
                <input
                  type="text"
                  value={salaryLocation}
                  onChange={(e) => setSalaryLocation(e.target.value)}
                  placeholder="e.g. Florida, United States, Antibes"
                  className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            )}
            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={loadingSalary}
                className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-100 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                {loadingSalary ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <DollarSign className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{loadingSalary ? 'Checking…' : 'Check Salary Range'}</span>
              </button>
            </div>
          </form>

          {salaryError && <p className="text-xs text-rose-300">{salaryError}</p>}

          {salaryResults && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {salaryResults.length === 0 ? (
                <p className="text-xs text-slate-400 col-span-2">
                  No published salary benchmark returned for that combination. Try a broader maritime title or region.
                </p>
              ) : (
                salaryResults.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-white">
                        {item.job_title || salaryJobTitle}{' '}
                        {item.company ? `· ${item.company}` : ''}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 uppercase">
                        {item.salary_period || 'YEAR'} ({item.salary_currency || 'USD'})
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Location: {item.location || salaryLocation}
                      {item.publisher_name ? ` · Source: ${item.publisher_name}` : ''}
                    </p>
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Min</span>
                        <span className="font-bold text-slate-200 font-mono">
                          {formatMoney(item.min_salary, item.salary_currency)}
                        </span>
                      </div>
                      <div className="p-2 bg-emerald-950/30 rounded-lg border border-emerald-500/30">
                        <span className="text-[10px] text-emerald-300 block">Median</span>
                        <span className="font-bold text-emerald-400 font-mono">
                          {formatMoney(item.median_salary, item.salary_currency)}
                        </span>
                      </div>
                      <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Max</span>
                        <span className="font-bold text-slate-200 font-mono">
                          {formatMoney(item.max_salary, item.salary_currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

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
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                      opp.contractType === 'daywork'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
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
