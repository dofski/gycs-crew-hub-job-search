/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ResumeData } from '@reactive-resume/schema/resume/data';
import type { Template } from '@reactive-resume/schema/templates';
import type { AtsReport } from '@reactive-resume/resume/ats';
import type { JdMatchReport } from '@reactive-resume/resume/ats-pdf';
import { defaultResumeData, sectionDefaults } from '@reactive-resume/schema/resume/default';
import { templateSchema } from '@reactive-resume/schema/templates';
import { createResumePdfBlob } from '@reactive-resume/pdf/browser';
import { getResumeSectionTitle } from '@reactive-resume/pdf/section-title';
import { convertLegacyStylesheet, needsLegacyStyleConversion } from '@reactive-resume/pdf/semantic-legacy';
import { lintResumeForAts } from '@reactive-resume/resume/ats';
import { buildExtractedDocument, HARVEST_DEFAULTS, harvestPdfDocument, matchJobDescription } from '@reactive-resume/resume/ats-pdf';
import { buildMarkdown } from '@reactive-resume/resume/markdown';
import { parseJSONResume } from '@reactive-resume/import/json-resume';
import { parseReactiveResumeJSON } from '@reactive-resume/import/reactive-resume-json';
import { parseReactiveResumeV4JSON } from '@reactive-resume/import/reactive-resume-v4-json';
import { documentToLines } from '@reactive-resume/import/pdf-lines';
import { parseResumeText } from '@reactive-resume/import/plain-text';
import type { CVData, CVEducation, CVExperience, VerificationStatus } from '../types/database.ts';

export interface TemplateOption {
  id: Template;
  label: string;
  tag: string;
  atsRecommended?: boolean;
}

export const CV_TEMPLATES: TemplateOption[] = [
  { id: 'onyx', label: 'Onyx', tag: 'Maritime Standard • Two-Column', atsRecommended: true },
  { id: 'lapras', label: 'Lapras', tag: 'Executive Officer • Single-Column', atsRecommended: true },
  { id: 'azurill', label: 'Azurill', tag: 'Clean Deck & Interior • Sidebar' },
  { id: 'bronzor', label: 'Bronzor', tag: 'Structured Technical • Engineering', atsRecommended: true },
  { id: 'chikorita', label: 'Chikorita', tag: 'Modern Yacht Crew • Bold Header' },
  { id: 'ditgar', label: 'Ditgar', tag: 'Compact Refit & Survey • Dense' },
  { id: 'ditto', label: 'Ditto', tag: 'Balanced Dual-Column • All-Rounder' },
  { id: 'gengar', label: 'Gengar', tag: 'High-Contrast Accent • Senior Crew' },
  { id: 'glalie', label: 'Glalie', tag: 'Crisp Minimalist • Entry / Junior', atsRecommended: true },
  { id: 'kakuna', label: 'Kakuna', tag: 'Classic Chronological • ATS First', atsRecommended: true },
  { id: 'leafish', label: 'Leafish', tag: 'Hospitality & Steward(ess) • Warm' },
  { id: 'meowth', label: 'Meowth', tag: 'Editorial Layout • Galley & Chef' },
  { id: 'persian', label: 'Persian', tag: 'Traditional Formal • Captain / HoD', atsRecommended: true },
  { id: 'pikachu', label: 'Pikachu', tag: 'Dynamic Sidebar • Deck / Watersports' },
  { id: 'porygon', label: 'Porygon', tag: 'Grid Precision • ETO / AV-IT' },
  { id: 'rhyhorn', label: 'Rhyhorn', tag: 'Strong Typography • Bosun / Mate' },
  { id: 'scizor', label: 'Scizor', tag: 'Sharp Header • Rotational Crew' },
  { id: 'smeargle', label: 'Smeargle', tag: 'Creative Portfolio • Media / Charter' },
];

export const CV_ACCENT_PRESETS = [
  { label: 'GYCS Emerald', value: 'rgba(5, 150, 105, 1)', hex: '#059669' },
  { label: 'Deep Ocean Navy', value: 'rgba(15, 23, 42, 1)', hex: '#0f172a' },
  { label: 'Maritime Teal', value: 'rgba(13, 148, 136, 1)', hex: '#0d9488' },
  { label: 'Royal Regatta Blue', value: 'rgba(29, 78, 216, 1)', hex: '#1d4ed8' },
  { label: 'Bridge Slate', value: 'rgba(51, 65, 85, 1)', hex: '#334155' },
  { label: 'Classic Charcoal', value: 'rgba(24, 24, 27, 1)', hex: '#18181b' },
];

export const CV_FONT_PRESETS = [
  'IBM Plex Serif',
  'Inter',
  'Merriweather',
  'Roboto',
  'Lora',
  'Plus Jakarta Sans',
];

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toHtmlParagraphs(raw: string): string {
  const trimmed = (raw || '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('<p>') || trimmed.startsWith('<ul>')) return trimmed;
  const lines = trimmed
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return '';
  const isBulletList = lines.length > 1 && lines.every((l) => /^[-•*]\s+/.test(l));
  if (isBulletList) {
    const items = lines.map((l) => `<li><p>${escapeHtml(l.replace(/^[-•*]\s+/, ''))}</p></li>`).join('');
    return `<ul>${items}</ul>`;
  }
  return lines.map((l) => `<p>${escapeHtml(l)}</p>`).join('');
}

function stripHtmlToText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .join('\n');
}

export function getValidTemplate(raw?: string): Template {
  const parsed = templateSchema.safeParse(raw);
  return parsed.success ? parsed.data : 'onyx';
}

/**
 * Converts Crew Hub's structured maritime `CVData` into a full `@reactive-resume/schema` `ResumeData`
 * document ready for WASM PDF rendering, DOCX/Markdown export, and ATS linting.
 */
export function cvDataToResumeData(cv: CVData): ResumeData {
  const base: ResumeData = structuredClone(defaultResumeData);
  const p = cv.personalInfo;
  const add = cv.additional || {};

  const targetRole = cv.objective.targetRole || add.targetRole || '';
  const targetDept = cv.objective.targetDepartment || add.targetDepartment || '';
  const headlineParts = [
    targetRole,
    targetDept ? `${targetDept.charAt(0).toUpperCase()}${targetDept.slice(1)} Department` : '',
  ].filter(Boolean);

  const customFields: ResumeData['basics']['customFields'] = [];
  const pushField = (id: string, icon: string, text: string) => {
    if (!text.trim()) return;
    customFields.push({ id, icon, text: text.trim(), link: '' });
  };

  if (p.nationality) pushField('cf-nationality', 'flag', `Nationality: ${p.nationality}`);
  if (p.dateOfBirth) pushField('cf-dob', 'calendar', `DOB: ${p.dateOfBirth}`);
  if (p.visas && p.visas.length > 0) pushField('cf-visas', 'identification-card', `Visas: ${p.visas.join(', ')}`);
  if (p.medicalFitness) pushField('cf-medical', 'heartbeat', `Medical: ${p.medicalFitness}`);
  if (p.seamanBook) pushField('cf-seaman', 'anchor', `Seaman's Book: ${p.seamanBook}`);
  if (p.passportExpiry) pushField('cf-passport', 'identification-badge', `Passport Exp: ${p.passportExpiry}`);
  if (p.swimmingAbility) pushField('cf-swim', 'waves', `Water: ${p.swimmingAbility}`);
  pushField(
    'cf-lifestyle',
    'shield-check',
    `${p.smoker ? 'Smoker' : 'Non-Smoker'} • Tattoos: ${p.tattoos || 'None / Non-visible'}`
  );
  if (add.availabilityDate || add.contractPreference || add.preferredPorts) {
    const availBits = [
      add.availabilityDate ? `Available: ${add.availabilityDate}` : '',
      add.contractPreference ? `Contract: ${add.contractPreference}` : '',
      add.preferredPorts ? `Ports: ${add.preferredPorts}` : '',
    ].filter(Boolean);
    pushField('cf-avail', 'compass', availBits.join(' • '));
  }

  base.picture = {
    ...base.picture,
    url: add.avatarUrl || '',
    hidden: !add.avatarUrl,
  };

  base.basics = {
    name: p.fullName || 'Yacht Crew Candidate',
    headline: headlineParts.join(' • '),
    email: p.email || '',
    phone: p.phone || '',
    location: p.location || '',
    website: { url: '', label: '' },
    customFields,
  };

  base.summary = {
    ...sectionDefaults('article'),
    title: 'Career Objective',
    hidden: !cv.objective.text.trim(),
    content: toHtmlParagraphs(cv.objective.text),
  };

  base.sections.experience = {
    ...sectionDefaults('briefcase'),
    title: 'Professional Experience',
    hidden: cv.experience.length === 0,
    items: cv.experience
      .filter((e) => e.role.trim() || e.employerOrVessel.trim())
      .map((e, idx) => ({
        id: e.id || `exp-${idx + 1}`,
        hidden: false,
        company: e.employerOrVessel || 'Vessel / Employer',
        position: e.role || 'Crew Member',
        location: '',
        period: e.dates || '',
        website: { url: '', label: '', inlineLink: false },
        description: toHtmlParagraphs(e.description),
        roles: [],
      })),
  };

  base.sections.certifications = {
    ...sectionDefaults('certificate'),
    title: 'Licenses & Certifications',
    columns: 1,
    hidden: cv.qualifications.length === 0,
    items: cv.qualifications
      .filter((q) => q.name.trim())
      .map((q, idx) => ({
        id: `cert-${idx + 1}`,
        hidden: false,
        title: q.name,
        issuer: q.issuer || '',
        date: q.date || '',
        website: { url: '', label: '', inlineLink: false },
        description: '',
      })),
  };

  base.sections.skills = {
    ...sectionDefaults('compass-tool'),
    title: 'Skills & Expertise',
    columns: 2,
    layout: 'default',
    keywordLayout: 'inline',
    hidden: cv.skills.length === 0,
    items: cv.skills
      .filter((s) => s.name.trim())
      .map((s, idx) => ({
        id: `skill-${idx + 1}`,
        hidden: false,
        icon: '',
        iconColor: '',
        name: s.name,
        proficiency: s.label === 'verified' ? 'Verified' : s.label === 'reviewed' ? 'Coach Reviewed' : '',
        level: 0,
        keywords: [],
      })),
  };

  base.sections.languages = {
    ...sectionDefaults('translate'),
    title: 'Languages',
    columns: 2,
    hidden: !p.languages || p.languages.length === 0,
    items: (p.languages || [])
      .filter((l) => l.trim())
      .map((lang, idx) => ({
        id: `lang-${idx + 1}`,
        hidden: false,
        language: lang.trim(),
        fluency: '',
        level: 0,
      })),
  };

  const hobbyText = (add.hobbiesAndInterests || '').trim();
  const hobbyItems = hobbyText
    ? hobbyText
        .split(/[,;\n]+/)
        .map((h) => h.trim())
        .filter(Boolean)
    : [];

  base.sections.interests = {
    ...sectionDefaults('football'),
    title: 'Hobbies & Interests',
    columns: 2,
    hidden: hobbyItems.length === 0,
    items: hobbyItems.map((name, idx) => ({
      id: `interest-${idx + 1}`,
      hidden: false,
      icon: '',
      iconColor: '',
      name,
      keywords: [],
    })),
  };

  base.sections.references = {
    ...sectionDefaults('phone'),
    title: 'References',
    columns: 2,
    hidden: cv.references.length === 0,
    items: cv.references
      .filter((r) => r.name.trim())
      .map((r, idx) => ({
        id: `ref-${idx + 1}`,
        hidden: false,
        name: r.name,
        position: r.role || '',
        website: { url: '', label: '', inlineLink: false },
        phone: r.contactShared ? r.contact || '' : 'Contact on file (GYCS)',
        description: '',
      })),
  };

  base.metadata.template = getValidTemplate(add.template);
  base.metadata.page.format = add.pageFormat === 'letter' ? 'letter' : 'a4';
  base.metadata.page.gapY = 4;
  base.metadata.page.marginY = 10;
  base.metadata.design.colors.primary = add.accentColor || 'rgba(5, 150, 105, 1)';
  const fontFamily = add.fontFamily || 'IBM Plex Serif';
  base.metadata.typography.body.fontFamily = fontFamily;
  base.metadata.typography.heading.fontFamily = fontFamily;

  // Ensure Certifications, Experience, Summary, and References appear prominently on Page 1
  base.metadata.layout = {
    sidebarWidth: 34,
    pages: [
      {
        fullWidth: false,
        main: ['summary', 'experience', 'certifications', 'education', 'references', 'projects', 'volunteer'],
        sidebar: ['skills', 'languages', 'interests', 'awards', 'profiles', 'publications'],
      },
    ],
  };

  return base;
}

/**
 * Merges an imported `@reactive-resume/schema` `ResumeData` object into Crew Hub's structured `CVData`,
 * tagging imported items with `uploaded` provenance so coaches know they came from an uploaded file.
 */
export function resumeDataToCvData(resume: ResumeData, current: CVData): CVData {
  const status: VerificationStatus = 'uploaded';

  const expFromResume: CVExperience[] = resume.sections.experience.items
    .filter((i) => i.company.trim() || i.position.trim())
    .map((item, idx) => ({
      id: item.id || `imp-exp-${Date.now()}-${idx}`,
      role: item.position || item.roles?.[0]?.position || 'Crew Member',
      employerOrVessel: item.company || 'Vessel / Employer',
      dates: item.period || item.roles?.[0]?.period || '',
      description: stripHtmlToText(item.description || item.roles?.[0]?.description || ''),
      label: status,
    }));

  const certsFromResume: CVEducation[] = [
    ...resume.sections.certifications.items.map((c) => ({
      name: c.title,
      issuer: c.issuer || '',
      date: c.date || '',
      label: status,
    })),
    ...resume.sections.education.items.map((e) => ({
      name: [e.degree, e.area].filter(Boolean).join(' — ') || e.school,
      issuer: e.school || '',
      date: e.period || '',
      label: status,
    })),
  ].filter((q) => q.name.trim());

  const skillsFromResume = resume.sections.skills.items
    .flatMap((s) => (s.keywords && s.keywords.length > 0 ? [s.name, ...s.keywords] : [s.name]))
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => ({ name, label: status }));

  const languagesFromResume = resume.sections.languages.items
    .map((l) => (l.fluency ? `${l.language} (${l.fluency})` : l.language).trim())
    .filter(Boolean);

  const refsFromResume = resume.sections.references.items
    .filter((r) => r.name.trim())
    .map((r) => ({
      name: r.name,
      role: r.position || '',
      contact: [r.phone, stripHtmlToText(r.description)].filter(Boolean).join(' • '),
      contactShared: true,
      label: status,
    }));

  const interestsText = resume.sections.interests.items
    .map((i) => i.name.trim())
    .filter(Boolean)
    .join(', ');

  const summaryPlain = stripHtmlToText(resume.summary.content);

  return {
    ...current,
    personalInfo: {
      ...current.personalInfo,
      fullName: resume.basics.name.trim() || current.personalInfo.fullName,
      email: resume.basics.email.trim() || current.personalInfo.email,
      phone: resume.basics.phone.trim() || current.personalInfo.phone,
      location: resume.basics.location.trim() || current.personalInfo.location,
      languages: languagesFromResume.length > 0 ? languagesFromResume : current.personalInfo.languages,
    },
    objective: {
      ...current.objective,
      text: summaryPlain || current.objective.text,
      targetRole: resume.basics.headline.trim() || current.objective.targetRole,
      label: summaryPlain ? status : current.objective.label,
    },
    experience: expFromResume.length > 0 ? expFromResume : current.experience,
    qualifications: certsFromResume.length > 0 ? certsFromResume : current.qualifications,
    skills: skillsFromResume.length > 0 ? skillsFromResume : current.skills,
    references: refsFromResume.length > 0 ? refsFromResume : current.references,
    additional: {
      ...current.additional,
      hobbiesAndInterests: interestsText || current.additional?.hobbiesAndInterests,
      template: resume.metadata?.template || current.additional?.template || 'onyx',
    },
  };
}

export async function generateCvPdfBlob(cv: CVData): Promise<Blob> {
  const resumeData = cvDataToResumeData(cv);
  return createResumePdfBlob({ data: resumeData });
}

export async function generateCvDocxBlob(cv: CVData): Promise<Blob> {
  const resumeData = cvDataToResumeData(cv);
  const { buildDocx } = await import('@reactive-resume/docx');
  const resolveTitle = (sectionId: string) => getResumeSectionTitle(resumeData, sectionId);
  return buildDocx(resumeData, resolveTitle);
}

export function generateCvMarkdownBlob(cv: CVData): Blob {
  const resumeData = cvDataToResumeData(cv);
  const resolveTitle = (sectionId: string) => getResumeSectionTitle(resumeData, sectionId);
  const md = buildMarkdown(resumeData, resolveTitle);
  return new Blob([md], { type: 'text/markdown;charset=utf-8' });
}

export function generateCvJsonBlob(cv: CVData): Blob {
  const resumeData = cvDataToResumeData(cv);
  return new Blob([JSON.stringify(resumeData, null, 2)], { type: 'application/json' });
}

export function getSanitizedCvFileName(cv: CVData, ext: string): string {
  const rawName = (cv.personalInfo.fullName || 'GYCS-Crew-CV').replace(/[\\/:*?"<>|]/g, '').trim();
  const slug = rawName.split(/\s+/).filter(Boolean).join('-') || 'GYCS-Crew-CV';
  return `${slug}-CV.${ext}`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function runCvAtsReport(
  cv: CVData,
  jobDescription?: string
): { ats: AtsReport; jd: JdMatchReport | null } {
  const resumeData = cvDataToResumeData(cv);
  const ats = lintResumeForAts(resumeData);
  const resolveTitle = (sectionId: string) => getResumeSectionTitle(resumeData, sectionId);
  const resumeText = buildMarkdown(resumeData, resolveTitle);
  const trimmedJd = (jobDescription || '').trim();
  const jd = trimmedJd
    ? matchJobDescription({
        jobDescription: trimmedJd,
        resumeText,
        documentHasHiddenText: false,
      })
    : null;
  return { ats, jd };
}

async function extractPdfLinesInBrowser(file: File): Promise<string[]> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjs.getDocument({ data: bytes, fontExtraProperties: true });
  try {
    const doc = await loadingTask.promise;
    const raw = await harvestPdfDocument(doc, {
      file: { name: file.name, sizeBytes: file.size, magicBytesOk: true },
      maxPages: HARVEST_DEFAULTS.maxPages,
      operatorBudgetMs: 0,
    });
    return documentToLines(buildExtractedDocument(raw));
  } finally {
    void loadingTask.destroy();
  }
}

export async function importCvFile(
  file: File,
  current: CVData
): Promise<{ cv: CVData; kind: string; sectionsCount: number; entriesCount: number }> {
  const name = file.name.toLowerCase();
  const header = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  const isPdf = header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46;

  let resume: ResumeData;
  let kindLabel = 'Document';

  if (isPdf || file.type === 'application/pdf' || name.endsWith('.pdf')) {
    kindLabel = 'PDF Resume';
    const lines = await extractPdfLinesInBrowser(file);
    if (lines.length === 0) {
      throw new Error('This PDF appears to be a scanned image with no selectable text layer.');
    }
    resume = parseResumeText(lines.join('\n'));
  } else if (name.endsWith('.zip') || file.type === 'application/zip') {
    kindLabel = 'LinkedIn Data Export (.zip)';
    const { parseLinkedInExport } = await import('@reactive-resume/import/linkedin');
    resume = await parseLinkedInExport(new Uint8Array(await file.arrayBuffer()));
  } else if (name.endsWith('.json') || file.type === 'application/json') {
    const text = await file.text();
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const unwrapped =
      parsed?.data && typeof parsed.data === 'object' && !('sections' in parsed)
        ? JSON.stringify(parsed.data)
        : text;
    const obj = JSON.parse(unwrapped) as Record<string, unknown>;
    if ('basics' in obj && !('sections' in obj) && !('metadata' in obj)) {
      kindLabel = 'JSON Resume';
      resume = parseJSONResume(unwrapped);
    } else {
      const metadata = obj.metadata as Record<string, unknown> | undefined;
      if (metadata && (Array.isArray(metadata.layout) || !('page' in metadata))) {
        kindLabel = 'Reactive Resume v4 JSON';
        resume = parseReactiveResumeV4JSON(unwrapped);
      } else {
        kindLabel = 'GYCS / Reactive Resume JSON';
        const r = parseReactiveResumeJSON(unwrapped);
        resume = needsLegacyStyleConversion(r.metadata)
          ? { ...r, metadata: { ...r.metadata, stylesheet: convertLegacyStylesheet(r) } }
          : r;
      }
    }
  } else {
    throw new Error('Unsupported file format. Please upload a .pdf, LinkedIn .zip, or .json resume file.');
  }

  const nextCv = resumeDataToCvData(resume, current);
  const entriesCount =
    nextCv.experience.length +
    nextCv.qualifications.length +
    nextCv.skills.length +
    nextCv.references.length;
  const sectionsCount = [
    nextCv.objective.text.trim().length > 0,
    nextCv.experience.length > 0,
    nextCv.qualifications.length > 0,
    nextCv.skills.length > 0,
    nextCv.references.length > 0,
  ].filter(Boolean).length;

  return { cv: nextCv, kind: kindLabel, sectionsCount, entriesCount };
}
