/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FileText,
  Printer,
  AlertTriangle,
  User,
  ShieldCheck,
  Plus,
  Trash2,
  Briefcase,
  Award,
  Wrench,
  Users,
  Compass,
  Upload,
  Download,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  LayoutTemplate,
  FileSearch,
  ExternalLink,
} from 'lucide-react';
import type {
  CVData,
  CVEducation,
  CVExperience,
  VerificationStatus,
} from '../../types/database.ts';
import { validateCopy } from '../../lib/guardrails.ts';
import {
  CV_ACCENT_PRESETS,
  CV_FONT_PRESETS,
  CV_TEMPLATES,
  downloadBlob,
  generateCvDocxBlob,
  generateCvJsonBlob,
  generateCvMarkdownBlob,
  generateCvPdfBlob,
  getSanitizedCvFileName,
  getValidTemplate,
  importCvFile,
  runCvAtsReport,
} from '../../lib/cv-engine.ts';

interface CVStudioProps {
  cvData: CVData;
  busy?: boolean;
  onSaveCV: (data: CVData) => void | Promise<void>;
}

const inputClass =
  'w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500';

export const CVStudio: React.FC<CVStudioProps> = ({ cvData, busy = false, onSaveCV }) => {
  const [data, setData] = useState<CVData>(cvData);
  const [activeTab, setActiveTab] = useState<'editor' | 'pdf' | 'ats' | 'preview'>('editor');
  const [visasInput, setVisasInput] = useState<string>((cvData.personalInfo.visas || []).join(', '));
  const [languagesInput, setLanguagesInput] = useState<string>(
    (cvData.personalInfo.languages || []).join(', ')
  );
  const [newSkillName, setNewSkillName] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBusy, setPdfBusy] = useState<boolean>(false);
  const [exportBusy, setExportBusy] = useState<string | null>(null);
  const [engineNotice, setEngineNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [jobDescText, setJobDescText] = useState<string>(
    'Seeking Deckhand / Steward(ess) for 55m+ Motor Yacht. Required: valid STCW Basic Safety Training, ENG1 medical fitness certificate, Seaman Book, B1/B2 or Schengen visa, tender driving / PBL2, washdowns, line handling, watchkeeping, guest service, and verifiable yacht or hospitality references.'
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setData(cvData);
    setVisasInput((cvData.personalInfo.visas || []).join(', '));
    setLanguagesInput((cvData.personalInfo.languages || []).join(', '));
  }, [cvData.id, cvData.version]);

  const objectiveCheck = validateCopy(data.objective.text || '');

  const getStatusBadge = (status: VerificationStatus = 'claimed') => {
    switch (status) {
      case 'uploaded':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
            Uploaded
          </span>
        );
      case 'reviewed':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Coach Reviewed
          </span>
        );
      case 'verified':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Verified
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
            Claimed
          </span>
        );
    }
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsedVisas = visasInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedLanguages = languagesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: CVData = {
      ...data,
      personalInfo: {
        ...data.personalInfo,
        visas: parsedVisas,
        languages: parsedLanguages,
      },
    };
    setData(payload);
    void onSaveCV(payload);
  };

  // --- Dynamic Array Helpers ---
  const addExperience = () => {
    const next: CVExperience = {
      id: `exp-${Date.now()}`,
      role: '',
      employerOrVessel: '',
      dates: '',
      description: '',
      label: 'claimed',
    };
    setData({ ...data, experience: [...data.experience, next] });
  };

  const updateExperience = (idx: number, patch: Partial<CVExperience>) => {
    const next = data.experience.map((item, i) => (i === idx ? { ...item, ...patch } : item));
    setData({ ...data, experience: next });
  };

  const removeExperience = (idx: number) => {
    setData({ ...data, experience: data.experience.filter((_, i) => i !== idx) });
  };

  const addQualification = () => {
    const next: CVEducation = {
      name: '',
      issuer: '',
      date: '',
      label: 'claimed',
    };
    setData({ ...data, qualifications: [...data.qualifications, next] });
  };

  const updateQualification = (idx: number, patch: Partial<CVEducation>) => {
    const next = data.qualifications.map((item, i) => (i === idx ? { ...item, ...patch } : item));
    setData({ ...data, qualifications: next });
  };

  const removeQualification = (idx: number) => {
    setData({ ...data, qualifications: data.qualifications.filter((_, i) => i !== idx) });
  };

  const addSkill = () => {
    const trimmed = newSkillName.trim();
    if (!trimmed) return;
    setData({
      ...data,
      skills: [...data.skills, { name: trimmed, label: 'claimed' }],
    });
    setNewSkillName('');
  };

  const updateSkill = (idx: number, name: string) => {
    const next = data.skills.map((s, i) => (i === idx ? { ...s, name } : s));
    setData({ ...data, skills: next });
  };

  const removeSkill = (idx: number) => {
    setData({ ...data, skills: data.skills.filter((_, i) => i !== idx) });
  };

  const addReference = () => {
    setData({
      ...data,
      references: [
        ...data.references,
        { name: '', role: '', contact: '', contactShared: true, label: 'claimed' },
      ],
    });
  };

  const updateReference = (
    idx: number,
    patch: Partial<{ name: string; role: string; contact?: string; contactShared: boolean }>
  ) => {
    const next = data.references.map((r, i) => (i === idx ? { ...r, ...patch } : r));
    setData({ ...data, references: next });
  };

  const removeReference = (idx: number) => {
    setData({ ...data, references: data.references.filter((_, i) => i !== idx) });
  };

  const additional = data.additional || {};
  const selectedTemplate = getValidTemplate(additional.template);
  const selectedAccent = additional.accentColor || CV_ACCENT_PRESETS[0].value;
  const selectedFont = additional.fontFamily || CV_FONT_PRESETS[0];
  const selectedFormat = additional.pageFormat || 'a4';

  const buildCurrentPayload = (): CVData => {
    const parsedVisas = visasInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedLanguages = languagesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return {
      ...data,
      personalInfo: {
        ...data.personalInfo,
        visas: parsedVisas,
        languages: parsedLanguages,
      },
    };
  };

  const refreshPdfPreview = async (overrideData?: CVData) => {
    setPdfBusy(true);
    setEngineNotice(null);
    try {
      const blob = await generateCvPdfBlob(overrideData || buildCurrentPayload());
      const nextUrl = URL.createObjectURL(blob);
      setPdfUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return nextUrl;
      });
    } catch (err) {
      setEngineNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Could not render PDF preview.',
      });
    } finally {
      setPdfBusy(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'pdf') {
      void refreshPdfPreview();
    }
  }, [activeTab, selectedTemplate, selectedAccent, selectedFont, selectedFormat]);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExportBusy('import');
    setEngineNotice(null);
    try {
      const { cv: merged, kind, sectionsCount, entriesCount } = await importCvFile(
        file,
        buildCurrentPayload()
      );
      setData(merged);
      setVisasInput((merged.personalInfo.visas || []).join(', '));
      setLanguagesInput((merged.personalInfo.languages || []).join(', '));
      setEngineNotice({
        type: 'ok',
        text: `Imported ${kind} (${sectionsCount} sections, ${entriesCount} items marked 'uploaded'). Review fields below and click Save New CV Version to persist to Supabase.`,
      });
      if (activeTab === 'pdf') {
        void refreshPdfPreview(merged);
      }
    } catch (err) {
      setEngineNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Could not import CV file.',
      });
    } finally {
      setExportBusy(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'md' | 'json') => {
    setExportBusy(format);
    setEngineNotice(null);
    try {
      const current = buildCurrentPayload();
      if (format === 'pdf') {
        const blob = await generateCvPdfBlob(current);
        downloadBlob(blob, getSanitizedCvFileName(current, 'pdf'));
      } else if (format === 'docx') {
        const blob = await generateCvDocxBlob(current);
        downloadBlob(blob, getSanitizedCvFileName(current, 'docx'));
      } else if (format === 'md') {
        const blob = generateCvMarkdownBlob(current);
        downloadBlob(blob, getSanitizedCvFileName(current, 'md'));
      } else {
        const blob = generateCvJsonBlob(current);
        downloadBlob(blob, getSanitizedCvFileName(current, 'json'));
      }
      setEngineNotice({
        type: 'ok',
        text: `Downloaded ${format.toUpperCase()} export (${getSanitizedCvFileName(current, format)}).`,
      });
    } catch (err) {
      setEngineNotice({
        type: 'err',
        text: err instanceof Error ? err.message : `Failed to export ${format.toUpperCase()}.`,
      });
    } finally {
      setExportBusy(null);
    }
  };

  const atsReport = useMemo(() => {
    if (activeTab !== 'ats') return null;
    try {
      return runCvAtsReport(buildCurrentPayload(), jobDescText);
    } catch {
      return null;
    }
  }, [activeTab, data, visasInput, languagesInput, jobDescText]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-white font-['Space_Grotesk']">
              Structured Maritime CV Studio
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {data.version > 0 ? `Saved Version ${data.version}` : 'New Draft (v1)'}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-300 border border-sky-500/20">
              18-Template WASM Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Saving creates a new immutable version in Supabase. Import an existing PDF/LinkedIn/JSON CV, customize across 18 maritime-ready templates, run ATS &amp; job-keyword checks, or export to PDF &amp; Word.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.json,.zip"
            onChange={handleImportFile}
            className="hidden"
          />
          <button
            type="button"
            disabled={Boolean(exportBusy)}
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-100 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            {exportBusy === 'import' ? 'Importing...' : 'Import PDF / JSON / LinkedIn'}
          </button>

          <a
            href="https://cv.chaddewet.com"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 bg-slate-950 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            title="Open the standalone GYCS Crew CV application (export JSON here to transfer your CV)"
          >
            <span>Standalone CV App</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'editor'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. Structured Editor
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pdf')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'pdf'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              2. Templates &amp; PDF Engine
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ats')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'ats'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileSearch className="w-3.5 h-3.5" />
              3. ATS &amp; Job Match
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'preview'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Quick Print Card
            </button>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={() => handleSave()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-950/40"
          >
            {busy ? 'Saving Version...' : `Save New CV Version (v${(data.version || 0) + 1})`}
          </button>
        </div>
      </div>

      {engineNotice && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between gap-3 border ${
            engineNotice.type === 'ok'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {engineNotice.type === 'ok' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{engineNotice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setEngineNotice(null)}
            className="text-[11px] underline opacity-80 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Coach Commentary Bar */}
      {data.coachComments && (
        <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-xl text-xs text-purple-200 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-purple-100 block mb-0.5">
              Coach Review Note (Chad de Wet):
            </span>
            <p className="text-purple-300 leading-relaxed">{data.coachComments}</p>
          </div>
        </div>
      )}

      {/* Guardrail Violation Warning */}
      {!objectiveCheck.isValid && (
        <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Copy Guardrail Rule Triggered:</span>
            <p className="text-rose-300">
              Your profile statement contains prohibited guarantee or placement language. Superyacht
              captains seek humility and discipline; please remove promotional claims.
            </p>
          </div>
        </div>
      )}

      {/* STRUCTURED EDITOR TAB */}
      {activeTab === 'editor' && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT COLUMN: Personal Info, Objective & Additional Maritime Details */}
            <div className="space-y-6">
              {/* 1. Personal Details & Seafarer Status */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  1. Personal Details &amp; Seafarer Status
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      value={data.personalInfo.fullName}
                      onChange={(e) =>
                        setData({
                          ...data,
                          personalInfo: { ...data.personalInfo, fullName: e.target.value },
                        })
                      }
                      placeholder="e.g. Sarah van der Merwe"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Nationality *</label>
                    <input
                      type="text"
                      required
                      value={data.personalInfo.nationality}
                      onChange={(e) =>
                        setData({
                          ...data,
                          personalInfo: { ...data.personalInfo, nationality: e.target.value },
                        })
                      }
                      placeholder="e.g. South African"
                      className={inputClass}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1">
                      Current Base &amp; Relocation Plan *
                    </label>
                    <input
                      type="text"
                      required
                      value={data.personalInfo.location}
                      onChange={(e) =>
                        setData({
                          ...data,
                          personalInfo: { ...data.personalInfo, location: e.target.value },
                        })
                      }
                      placeholder="e.g. Cape Town, South Africa (Relocating to Antibes, France)"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={data.personalInfo.dateOfBirth || ''}
                      onChange={(e) =>
                        setData({
                          ...data,
                          personalInfo: { ...data.personalInfo, dateOfBirth: e.target.value },
                        })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">CV Contact Email</label>
                    <input
                      type="email"
                      value={data.personalInfo.email || ''}
                      onChange={(e) =>
                        setData({
                          ...data,
                          personalInfo: { ...data.personalInfo, email: e.target.value },
                        })
                      }
                      placeholder="crew@example.com"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">CV Phone / WhatsApp</label>
                    <input
                      type="tel"
                      value={data.personalInfo.phone || ''}
                      onChange={(e) =>
                        setData({
                          ...data,
                          personalInfo: { ...data.personalInfo, phone: e.target.value },
                        })
                      }
                      placeholder="+27 82 555 1234"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Passport Expiry Date</label>
                    <input
                      type="date"
                      value={data.personalInfo.passportExpiry || ''}
                      onChange={(e) =>
                        setData({
                          ...data,
                          personalInfo: { ...data.personalInfo, passportExpiry: e.target.value },
                        })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Seafarer Discharge Book</label>
                    <input
                      type="text"
                      value={data.personalInfo.seamanBook || ''}
                      onChange={(e) =>
                        setData({
                          ...data,
                          personalInfo: { ...data.personalInfo, seamanBook: e.target.value },
                        })
                      }
                      placeholder="e.g. SAMSA / Cayman Islands"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Medical Fitness Status</label>
                    <input
                      type="text"
                      value={data.personalInfo.medicalFitness || ''}
                      onChange={(e) =>
                        setData({
                          ...data,
                          personalInfo: { ...data.personalInfo, medicalFitness: e.target.value },
                        })
                      }
                      placeholder="e.g. ENG1 Unrestricted (Valid to 2028)"
                      className={inputClass}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1">
                      Visas Held / In Application (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={visasInput}
                      onChange={(e) => setVisasInput(e.target.value)}
                      placeholder="e.g. Schengen C Visa, B1/B2 US Visa"
                      className={inputClass}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1">
                      Languages Spoken (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={languagesInput}
                      onChange={(e) => setLanguagesInput(e.target.value)}
                      placeholder="e.g. English (Native/Fluent), Afrikaans (Fluent), French (Conversational)"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Tattoo Visibility</label>
                    <input
                      type="text"
                      value={data.personalInfo.tattoos}
                      onChange={(e) =>
                        setData({
                          ...data,
                          personalInfo: { ...data.personalInfo, tattoos: e.target.value },
                        })
                      }
                      placeholder="None / Non-visible in uniform"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Smoking Policy</label>
                    <select
                      value={data.personalInfo.smoker ? 'yes' : 'no'}
                      onChange={(e) =>
                        setData({
                          ...data,
                          personalInfo: {
                            ...data.personalInfo,
                            smoker: e.target.value === 'yes',
                          },
                        })
                      }
                      className={inputClass}
                    >
                      <option value="no">Strict Non-Smoker</option>
                      <option value="yes">Smoker</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1">
                      Water Confidence &amp; Swimming Ability
                    </label>
                    <input
                      type="text"
                      value={data.personalInfo.swimmingAbility || ''}
                      onChange={(e) =>
                        setData({
                          ...data,
                          personalInfo: { ...data.personalInfo, swimmingAbility: e.target.value },
                        })
                      }
                      placeholder="e.g. Strong ocean swimmer · Surf lifeguard trained"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* 2. Maritime Objective & Target Position */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    2. Maritime Objective &amp; Target Role
                  </h3>
                  {getStatusBadge(data.objective.label)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Target Role Title on CV</label>
                    <input
                      type="text"
                      value={data.objective.targetRole || additional.targetRole || ''}
                      onChange={(e) =>
                        setData({
                          ...data,
                          objective: { ...data.objective, targetRole: e.target.value },
                          additional: { ...additional, targetRole: e.target.value },
                        })
                      }
                      placeholder="e.g. Junior Deckhand / Tender Driver"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Target Department</label>
                    <select
                      value={data.objective.targetDepartment || additional.targetDepartment || 'deck'}
                      onChange={(e) =>
                        setData({
                          ...data,
                          objective: { ...data.objective, targetDepartment: e.target.value },
                          additional: { ...additional, targetDepartment: e.target.value },
                        })
                      }
                      className={inputClass}
                    >
                      <option value="deck">Deck</option>
                      <option value="interior">Interior</option>
                      <option value="engineering">Engineering</option>
                      <option value="galley">Galley / Culinary</option>
                    </select>
                  </div>
                </div>

                <label className="block text-xs text-slate-400">
                  Professional Maritime Objective Statement *
                  <textarea
                    rows={4}
                    required
                    value={data.objective.text}
                    onChange={(e) =>
                      setData({
                        ...data,
                        objective: { ...data.objective, text: e.target.value },
                      })
                    }
                    placeholder="Concise 40–60 word profile statement highlighting seamanship discipline, safety compliance, and hospitality work ethic..."
                    className={`${inputClass} mt-1`}
                  />
                </label>
              </div>

              {/* 3. Additional Maritime & Availability Details */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  3. Availability, Contract Preference &amp; Additional Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Available to Join From</label>
                    <input
                      type="date"
                      value={additional.availabilityDate || ''}
                      onChange={(e) =>
                        setData({
                          ...data,
                          additional: { ...additional, availabilityDate: e.target.value },
                        })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Contract Preference</label>
                    <select
                      value={additional.contractPreference || 'seasonal'}
                      onChange={(e) =>
                        setData({
                          ...data,
                          additional: { ...additional, contractPreference: e.target.value },
                        })
                      }
                      className={inputClass}
                    >
                      <option value="seasonal">Seasonal or Permanent</option>
                      <option value="permanent">Permanent</option>
                      <option value="rotational">Rotational</option>
                      <option value="daywork">Daywork &amp; Relief</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Preferred Embarkation Hubs</label>
                    <input
                      type="text"
                      value={additional.preferredPorts || ''}
                      onChange={(e) =>
                        setData({
                          ...data,
                          additional: { ...additional, preferredPorts: e.target.value },
                        })
                      }
                      placeholder="e.g. Antibes, Palma, Monaco, Fort Lauderdale"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Job Search Runway (Months)</label>
                    <input
                      type="number"
                      min={1}
                      max={36}
                      value={additional.runwayMonths ?? 6}
                      onChange={(e) =>
                        setData({
                          ...data,
                          additional: {
                            ...additional,
                            runwayMonths: Math.max(1, Number(e.target.value) || 6),
                          },
                        })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1">
                      Watersports, Interests &amp; Additional Notes
                    </label>
                    <textarea
                      rows={2}
                      value={additional.hobbiesAndInterests || ''}
                      onChange={(e) =>
                        setData({
                          ...data,
                          additional: { ...additional, hobbiesAndInterests: e.target.value },
                        })
                      }
                      placeholder="e.g. Wakeboarding, diving, tender maintenance, specialty coffee, carpentry..."
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Qualifications, Experience, Skills & References */}
            <div className="space-y-6">
              {/* 4. Maritime Qualifications & Certifications */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    4. Maritime Qualifications &amp; Certifications ({data.qualifications.length})
                  </h3>
                  <button
                    type="button"
                    onClick={addQualification}
                    className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Certificate
                  </button>
                </div>

                {!data.qualifications.length && (
                  <p className="text-xs text-slate-400">
                    No qualifications added yet. Click &ldquo;Add Certificate&rdquo; to include STCW,
                    ENG1, PDSD, PB2, or Food Safety certificates.
                  </p>
                )}

                <div className="space-y-3">
                  {data.qualifications.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-slate-400 uppercase">
                          Qualification #{idx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(q.label)}
                          <button
                            type="button"
                            onClick={() => removeQualification(idx)}
                            className="text-rose-400 hover:text-rose-300 p-1"
                            title="Remove qualification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        value={q.name}
                        onChange={(e) => updateQualification(idx, { name: e.target.value })}
                        placeholder="Certificate Name (e.g. STCW 95/2010 Basic Safety Training)"
                        className={inputClass}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={q.issuer}
                          onChange={(e) => updateQualification(idx, { issuer: e.target.value })}
                          placeholder="Issuing Authority (e.g. SSTG / RYA / MCA)"
                          className={inputClass}
                        />
                        <input
                          type="text"
                          value={q.date}
                          onChange={(e) => updateQualification(idx, { date: e.target.value })}
                          placeholder="Date / Validity (e.g. Aug 2026)"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Seamanship & Hospitality Experience */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-400" />
                    5. Seamanship &amp; Transferable Experience ({data.experience.length})
                  </h3>
                  <button
                    type="button"
                    onClick={addExperience}
                    className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Experience
                  </button>
                </div>

                {!data.experience.length && (
                  <p className="text-xs text-slate-400">
                    No experience entries yet. Add vessels, daywork, coastal charters, or relevant
                    hospitality/engineering roles.
                  </p>
                )}

                <div className="space-y-3">
                  {data.experience.map((exp, idx) => (
                    <div
                      key={exp.id || idx}
                      className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-slate-400 uppercase">
                          Experience #{idx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(exp.label)}
                          <button
                            type="button"
                            onClick={() => removeExperience(idx)}
                            className="text-rose-400 hover:text-rose-300 p-1"
                            title="Remove experience"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => updateExperience(idx, { role: e.target.value })}
                          placeholder="Role Title (e.g. Junior Deckhand / Tender Driver)"
                          className={inputClass}
                        />
                        <input
                          type="text"
                          value={exp.employerOrVessel}
                          onChange={(e) =>
                            updateExperience(idx, { employerOrVessel: e.target.value })
                          }
                          placeholder="Vessel or Employer (e.g. M/Y Solaris 45m)"
                          className={inputClass}
                        />
                      </div>

                      <input
                        type="text"
                        value={exp.dates}
                        onChange={(e) => updateExperience(idx, { dates: e.target.value })}
                        placeholder="Dates (e.g. Nov 2025 – Oct 2026)"
                        className={inputClass}
                      />

                      <textarea
                        rows={2}
                        value={exp.description}
                        onChange={(e) => updateExperience(idx, { description: e.target.value })}
                        placeholder="Key duties: washdowns, line handling, tender operations, watchkeeping, guest service..."
                        className={inputClass}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. Key Crew Skills */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-emerald-400" />
                  6. Key Crew Skills ({data.skills.length})
                </h3>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    placeholder="Add skill (e.g. Tender Driving, Teak Maintenance, Silver Service)..."
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>

                <div className="space-y-2">
                  {data.skills.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2"
                    >
                      <input
                        type="text"
                        value={s.name}
                        onChange={(e) => updateSkill(idx, e.target.value)}
                        className="flex-1 bg-transparent text-xs text-slate-200 px-2 focus:outline-none"
                      />
                      {getStatusBadge(s.label)}
                      <button
                        type="button"
                        onClick={() => removeSkill(idx)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                        title="Remove skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 7. Verifiable Professional References */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    7. Verifiable Professional References ({data.references.length})
                  </h3>
                  <button
                    type="button"
                    onClick={addReference}
                    className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Reference
                  </button>
                </div>

                {!data.references.length && (
                  <p className="text-xs text-slate-400">
                    No references listed yet. Add captains, heads of department, or former employers.
                  </p>
                )}

                <div className="space-y-3">
                  {data.references.map((ref, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-slate-400 uppercase">
                          Reference #{idx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(ref.label)}
                          <button
                            type="button"
                            onClick={() => removeReference(idx)}
                            className="text-rose-400 hover:text-rose-300 p-1"
                            title="Remove reference"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={ref.name}
                          onChange={(e) => updateReference(idx, { name: e.target.value })}
                          placeholder="Referee Name (e.g. Capt. Marcus Pieterse)"
                          className={inputClass}
                        />
                        <input
                          type="text"
                          value={ref.role}
                          onChange={(e) => updateReference(idx, { role: e.target.value })}
                          placeholder="Role & Vessel/Company"
                          className={inputClass}
                        />
                      </div>

                      <input
                        type="text"
                        value={ref.contact || ''}
                        onChange={(e) => updateReference(idx, { contact: e.target.value })}
                        placeholder="Referee Phone or Email (optional)"
                        className={inputClass}
                      />

                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={ref.contactShared}
                          onChange={(e) =>
                            updateReference(idx, { contactShared: e.target.checked })
                          }
                          className="rounded accent-emerald-500"
                        />
                        <span>Share referee contact details upon captain / agency request</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={busy}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-emerald-950/40"
            >
              {busy ? 'Saving to Supabase...' : `Save Complete CV Version (v${(data.version || 0) + 1})`}
            </button>
          </div>
        </form>
      )}

      {/* TEMPLATES & WASM PDF ENGINE TAB */}
      {activeTab === 'pdf' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left sidebar: 18 Templates + Design + Multi-format Export */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <LayoutTemplate className="w-4 h-4 text-emerald-400" />
                  Select Yacht CV Template (18 Layouts)
                </h3>
                <span className="text-[11px] font-mono text-emerald-400 uppercase">
                  Active: {selectedTemplate}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                {CV_TEMPLATES.map((tpl) => {
                  const isSelected = selectedTemplate === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() =>
                        setData({
                          ...data,
                          additional: { ...additional, template: tpl.id },
                        })
                      }
                      className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-950/50 border-emerald-500 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold">{tpl.label}</span>
                        {tpl.atsRecommended && (
                          <span className="px-1.5 py-0.5 text-[9px] font-mono bg-emerald-500/20 text-emerald-300 rounded">
                            ATS
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">{tpl.tag}</span>
                    </button>
                  );
                })}
              </div>

              {/* Accent Color, Font & Page Format */}
              <div className="pt-3 border-t border-slate-800 space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1.5">Header &amp; Accent Palette</label>
                  <div className="flex flex-wrap gap-2">
                    {CV_ACCENT_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() =>
                          setData({
                            ...data,
                            additional: { ...additional, accentColor: preset.value },
                          })
                        }
                        className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 text-[11px] transition ${
                          selectedAccent === preset.value
                            ? 'border-white bg-slate-800 text-white font-semibold'
                            : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                          style={{ backgroundColor: preset.hex }}
                        />
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Typography</label>
                    <select
                      value={selectedFont}
                      onChange={(e) =>
                        setData({
                          ...data,
                          additional: { ...additional, fontFamily: e.target.value },
                        })
                      }
                      className={inputClass}
                    >
                      {CV_FONT_PRESETS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Page Size</label>
                    <select
                      value={selectedFormat}
                      onChange={(e) =>
                        setData({
                          ...data,
                          additional: {
                            ...additional,
                            pageFormat: e.target.value === 'letter' ? 'letter' : 'a4',
                          },
                        })
                      }
                      className={inputClass}
                    >
                      <option value="a4">A4 (International Yacht Standard)</option>
                      <option value="letter">US Letter</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Actions */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" />
                Download &amp; Portable Exports
              </h3>
              <p className="text-xs text-slate-400">
                Generated directly in your browser using the embedded Forme WebAssembly vector PDF and DOCX engines.
              </p>
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={Boolean(exportBusy)}
                  onClick={() => handleExport('pdf')}
                  className="px-3 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  {exportBusy === 'pdf' ? 'Building PDF...' : 'Download PDF'}
                </button>
                <button
                  type="button"
                  disabled={Boolean(exportBusy)}
                  onClick={() => handleExport('docx')}
                  className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  {exportBusy === 'docx' ? 'Building DOCX...' : 'Download Word (.docx)'}
                </button>
                <button
                  type="button"
                  disabled={Boolean(exportBusy)}
                  onClick={() => handleExport('md')}
                  className="px-3 py-2 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-slate-300 border border-slate-800 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition"
                >
                  {exportBusy === 'md' ? 'Exporting...' : 'Export Markdown (.md)'}
                </button>
                <button
                  type="button"
                  disabled={Boolean(exportBusy)}
                  onClick={() => handleExport('json')}
                  className="px-3 py-2 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-slate-300 border border-slate-800 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition"
                >
                  {exportBusy === 'json' ? 'Exporting...' : 'Export Portable JSON'}
                </button>
              </div>
            </div>
          </div>

          {/* Right column: Live Vector PDF Preview */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col min-h-[680px]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  Live Vector PDF Preview ({selectedTemplate.toUpperCase()})
                </span>
                {pdfBusy && (
                  <span className="text-[11px] text-emerald-400 font-mono animate-pulse">
                    Rendering WASM PDF...
                  </span>
                )}
              </div>
              <button
                type="button"
                disabled={pdfBusy}
                onClick={() => void refreshPdfPreview()}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${pdfBusy ? 'animate-spin' : ''}`} />
                Refresh PDF
              </button>
            </div>

            {pdfUrl ? (
              <iframe
                title="GYCS Maritime CV PDF Preview"
                src={pdfUrl}
                className="w-full flex-1 rounded-xl border border-slate-800 bg-white min-h-[620px]"
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
                <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
                <span>Generating vector PDF preview in browser...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ATS & JOB DESCRIPTION MATCH TAB */}
      {activeTab === 'ats' && atsReport && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: ATS Structural & Readability Audit */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ATS Readability &amp; Structure Score
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Checks contact completeness, section headings, date formatting, and recruitment software parseability.
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                  {atsReport.ats.score}%
                </span>
                <span className="block text-[10px] text-slate-400 font-mono">
                  {atsReport.ats.passedRules}/{atsReport.ats.totalRules} rules passed
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
              {Object.entries(atsReport.ats.categories).map(([cat, stats]) => (
                <div
                  key={cat}
                  className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-center"
                >
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">
                    {cat}
                  </span>
                  <span className="text-sm font-bold text-white font-mono">
                    {stats.passed}/{stats.total}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Audit Findings ({atsReport.ats.findings.length})
              </h4>
              {atsReport.ats.findings.length === 0 ? (
                <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-200">
                  All ATS structural and contact checks passed.
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {atsReport.ats.findings.map((finding) => (
                    <div
                      key={finding.key}
                      className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-2 ${
                        finding.severity === 'error'
                          ? 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                          : finding.severity === 'warning'
                            ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div>
                        <span className="font-mono font-bold text-[11px] uppercase">
                          [{finding.severity}] {finding.code.replace(/_/g, ' ')}
                        </span>
                        <p className="text-[11px] opacity-85 mt-0.5 font-mono">
                          Location: {finding.pointer || '/'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Yacht Job / Agency Brief Keyword Matcher */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  Yacht Role &amp; Agency Brief Keyword Match
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Paste a superyacht job advert or crew-agency requirement brief to see which terms your CV covers.
                </p>
              </div>
              {atsReport.jd && (
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-sky-400 font-mono">
                    {Math.round(atsReport.jd.weightedCoverage * 100)}%
                  </span>
                  <span className="block text-[10px] text-slate-400 font-mono">
                    {atsReport.jd.matchedCount}/{atsReport.jd.totalTerms} terms
                  </span>
                </div>
              )}
            </div>

            <textarea
              rows={4}
              value={jobDescText}
              onChange={(e) => setJobDescText(e.target.value)}
              placeholder="Paste a yacht job description or crew agency requirement list here..."
              className={inputClass}
            />

            {atsReport.jd && (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-emerald-400 block mb-1.5">
                    Matched on Your CV ({atsReport.jd.matchedTerms.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {atsReport.jd.matchedTerms.length === 0 ? (
                      <span className="text-slate-500">No matching terms yet.</span>
                    ) : (
                      atsReport.jd.matchedTerms.map((term) => (
                        <span
                          key={term}
                          className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[11px]"
                        >
                          ✓ {term}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-amber-400 block mb-1.5">
                    Missing From Your CV ({atsReport.jd.missingTerms.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {atsReport.jd.missingTerms.length === 0 ? (
                      <span className="text-emerald-400">Every extracted requirement term is present!</span>
                    ) : (
                      atsReport.jd.missingTerms.map((term) => (
                        <span
                          key={term}
                          className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[11px]"
                        >
                          + {term}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PREVIEW / PDF TAB */}
      {activeTab === 'preview' && (
        <div className="bg-white text-slate-900 rounded-2xl p-8 sm:p-12 shadow-2xl max-w-3xl mx-auto border border-slate-300 font-sans print:p-0">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-6 mb-6 flex justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-extrabold uppercase tracking-tight text-slate-950">
                {data.personalInfo.fullName || 'Crew Candidate'}
              </h1>
              <p className="text-sm font-bold text-emerald-700 uppercase tracking-widest mt-1">
                {data.objective.targetRole || additional.targetRole || 'Superyacht Crew Candidate'}
              </p>
              <div className="text-xs text-slate-600 mt-2 space-y-0.5">
                <p>
                  Nationality: {data.personalInfo.nationality || '—'} · Location:{' '}
                  {data.personalInfo.location || '—'}
                </p>
                <p>
                  Non-Smoker: {data.personalInfo.smoker ? 'No' : 'Yes'} · Tattoos:{' '}
                  {data.personalInfo.tattoos || 'None / Non-visible'}
                  {data.personalInfo.medicalFitness
                    ? ` · Medical: ${data.personalInfo.medicalFitness}`
                    : ''}
                </p>
                {visasInput && <p>Visas: {visasInput}</p>}
                {languagesInput && <p>Languages: {languagesInput}</p>}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                GYCS Structured CV v{data.version || 1}
              </span>
            </div>
          </div>

          {/* Objective */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
              Professional Maritime Profile
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">{data.objective.text}</p>
          </div>

          {/* Qualifications */}
          {data.qualifications.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Maritime Qualifications &amp; Certifications
              </h3>
              <div className="space-y-2 text-xs">
                {data.qualifications.map((q, idx) => (
                  <div key={idx} className="flex justify-between items-baseline">
                    <div>
                      <span className="font-bold text-slate-900">{q.name}</span>
                      {q.issuer && <span className="text-slate-600"> — {q.issuer}</span>}
                      {q.date && <span className="text-slate-500"> ({q.date})</span>}
                    </div>
                    <span className="text-slate-500 font-mono text-[11px] shrink-0 ml-2">
                      [{q.label}]
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {data.skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Key Seamanship &amp; Crew Skills
              </h3>
              <p className="text-xs text-slate-700">
                {data.skills.map((s) => s.name).join(' · ')}
              </p>
            </div>
          )}

          {/* Experience */}
          {data.experience.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Seamanship &amp; Practical Experience
              </h3>
              <div className="space-y-4 text-xs">
                {data.experience.map((exp, idx) => (
                  <div key={exp.id || idx}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-slate-900">
                        {exp.role} · {exp.employerOrVessel}
                      </span>
                      <span className="text-slate-500 text-[11px] font-mono">{exp.dates}</span>
                    </div>
                    <p className="text-slate-700 text-[11px] mt-1 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* References */}
          {data.references.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Verifiable Professional References
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {data.references.map((r, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded border border-slate-200">
                    <span className="font-bold text-slate-900 block">{r.name}</span>
                    <span className="text-slate-600 text-[11px] block">{r.role}</span>
                    {r.contact && r.contactShared && (
                      <span className="text-slate-700 text-[11px] block">{r.contact}</span>
                    )}
                    <span className="text-[10px] text-emerald-700 block mt-1 font-mono">
                      {r.contactShared
                        ? 'Contact shared upon captain request'
                        : 'Reference on file'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer print action */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
            <span>
              Prepared via Green Yacht Crew Solutions · Document ID: GYCS-CV-{data.version || 1}
            </span>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
