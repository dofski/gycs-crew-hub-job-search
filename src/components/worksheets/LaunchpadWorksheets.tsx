/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import type { LessonItem } from '../../types/database.ts';
import {
  LAUNCHPAD_WORKSHEETS,
  generateClientWorkbookMarkdown,
  getLaunchpadWorksheetByWeek,
  parseWorksheetFromSubmission,
  serializeWorksheetToSubmission,
} from '../../lib/launchpad-syllabus.ts';
import {
  CheckSquare,
  Square,
  FileText,
  Download,
  Send,
  Save,
  Award,
  Target,
  Wrench,
  CheckCircle2,
  ClipboardCheck,
  Sparkles,
} from 'lucide-react';

interface LaunchpadWorksheetsProps {
  lessons: LessonItem[];
  memberName?: string;
  targetRole?: string;
  coachingProgramme?: string;
  initialWeek?: number;
  onSaveWorksheet: (lessonId: string, serializedMarkdown: string, submitToCoach: boolean) => void;
}

export const LaunchpadWorksheets: React.FC<LaunchpadWorksheetsProps> = ({
  lessons,
  memberName,
  targetRole,
  coachingProgramme,
  initialWeek = 1,
  onSaveWorksheet,
}) => {
  const [selectedWeek, setSelectedWeek] = useState<number>(initialWeek);
  const [checklistStateByWeek, setChecklistStateByWeek] = useState<Record<number, Record<string, boolean>>>({});
  const [fieldStateByWeek, setFieldStateByWeek] = useState<Record<number, Record<string, string>>>({});
  const [localSavedBanner, setLocalSavedBanner] = useState<string>('');

  // Initialize from Supabase lesson assignment submissions (and merge any local draft cache)
  useEffect(() => {
    const nextChecklist: Record<number, Record<string, boolean>> = {};
    const nextFields: Record<number, Record<string, string>> = {};

    for (const ws of LAUNCHPAD_WORKSHEETS) {
      const matchingLesson = lessons.find((l) => l.week === ws.week);
      const serverContent = matchingLesson?.assignment?.submittedContent;
      let cachedContent: string | null = null;
      if (typeof window !== 'undefined') {
        try {
          cachedContent = window.localStorage.getItem(`gycs_worksheet_w${ws.week}`);
        } catch {
          cachedContent = null;
        }
      }
      const parsed = parseWorksheetFromSubmission(ws, serverContent || cachedContent);
      nextChecklist[ws.week] = parsed.checklist;
      nextFields[ws.week] = parsed.fields;
    }

    setChecklistStateByWeek(nextChecklist);
    setFieldStateByWeek(nextFields);
  }, [lessons]);

  useEffect(() => {
    if (initialWeek >= 1 && initialWeek <= 8) {
      setSelectedWeek(initialWeek);
    }
  }, [initialWeek]);

  const activeWorksheet = getLaunchpadWorksheetByWeek(selectedWeek);
  const activeLesson = lessons.find((l) => l.week === selectedWeek) || lessons[selectedWeek - 1];
  const activeChecklist = checklistStateByWeek[selectedWeek] || {};
  const activeFields = fieldStateByWeek[selectedWeek] || {};

  const totalChecklistCompleted = useMemo(() => {
    return LAUNCHPAD_WORKSHEETS.reduce((acc, ws) => {
      const wkChecklist = checklistStateByWeek[ws.week] || {};
      return acc + ws.checklistItems.filter((item) => Boolean(wkChecklist[item.id])).length;
    }, 0);
  }, [checklistStateByWeek]);

  const totalChecklistItems = useMemo(() => {
    return LAUNCHPAD_WORKSHEETS.reduce((acc, ws) => acc + ws.checklistItems.length, 0);
  }, []);

  const activeWeekCompletedCount = activeWorksheet.checklistItems.filter((item) =>
    Boolean(activeChecklist[item.id])
  ).length;

  const toggleChecklistItem = (itemId: string) => {
    setLocalSavedBanner('');
    setChecklistStateByWeek((prev) => {
      const currentWeekMap = prev[selectedWeek] || {};
      const updatedWeekMap = {
        ...currentWeekMap,
        [itemId]: !currentWeekMap[itemId],
      };
      const next = { ...prev, [selectedWeek]: updatedWeekMap };
      if (typeof window !== 'undefined') {
        try {
          const serialized = serializeWorksheetToSubmission(
            activeWorksheet,
            updatedWeekMap,
            fieldStateByWeek[selectedWeek] || {}
          );
          window.localStorage.setItem(`gycs_worksheet_w${selectedWeek}`, serialized);
        } catch {
          // ignore storage quota errors
        }
      }
      return next;
    });
  };

  const updateFieldValue = (fieldId: string, value: string) => {
    setLocalSavedBanner('');
    setFieldStateByWeek((prev) => {
      const currentWeekFields = prev[selectedWeek] || {};
      const updatedWeekFields = {
        ...currentWeekFields,
        [fieldId]: value,
      };
      const next = { ...prev, [selectedWeek]: updatedWeekFields };
      if (typeof window !== 'undefined') {
        try {
          const serialized = serializeWorksheetToSubmission(
            activeWorksheet,
            checklistStateByWeek[selectedWeek] || {},
            updatedWeekFields
          );
          window.localStorage.setItem(`gycs_worksheet_w${selectedWeek}`, serialized);
        } catch {
          // ignore storage quota errors
        }
      }
      return next;
    });
  };

  const handleSaveOrSubmit = (submitToCoach: boolean) => {
    const serialized = serializeWorksheetToSubmission(activeWorksheet, activeChecklist, activeFields);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(`gycs_worksheet_w${selectedWeek}`, serialized);
      } catch {
        // ignore
      }
    }
    if (activeLesson) {
      onSaveWorksheet(activeLesson.id, serialized, submitToCoach);
      setLocalSavedBanner(
        submitToCoach
          ? `Week ${selectedWeek} Worksheet & Checklist submitted to Coach Chad for review.`
          : `Week ${selectedWeek} Worksheet & Checklist saved to your Crew Hub account.`
      );
    }
  };

  const handleDownloadMarkdown = (singleWeekOnly: boolean) => {
    const submissionsMap: Record<number, string | undefined> = {};
    for (const ws of LAUNCHPAD_WORKSHEETS) {
      submissionsMap[ws.week] = serializeWorksheetToSubmission(
        ws,
        checklistStateByWeek[ws.week] || {},
        fieldStateByWeek[ws.week] || {}
      );
    }

    const mdContent = singleWeekOnly
      ? serializeWorksheetToSubmission(activeWorksheet, activeChecklist, activeFields)
      : generateClientWorkbookMarkdown(memberName, targetRole, coachingProgramme, submissionsMap);

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = singleWeekOnly
      ? `GYCS-Week-0${selectedWeek}-Worksheet-and-Checklist.md`
      : 'GYCS-8-Week-Superyacht-Career-Launchpad-Client-Workbook.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getPhaseBadgeStyle = (phaseCode: string) => {
    switch (phaseCode) {
      case 'know':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'prepare':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'execute':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-teal-500/15 text-teal-300 border-teal-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Summary & Download Bar */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/30 border border-slate-800/80 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
            <ClipboardCheck className="w-4 h-4" />
            Interactive Client Workbook · 8-Week Follow-Along System
          </div>
          <h2 className="text-xl font-bold text-white">
            GYCS Client Worksheets &amp; Operational Checklists
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Work through each weekly checklist and worksheet as you complete the 8-Week Superyacht Career Launchpad. Your progress syncs to Supabase across Web and Android and submits directly to Coach Chad de Wet.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2.5 text-right">
            <div className="text-[10px] font-mono uppercase text-slate-400">Total Checklist Progress</div>
            <div className="text-sm font-bold text-emerald-400">
              {totalChecklistCompleted} / {totalChecklistItems} Checked ({Math.round((totalChecklistCompleted / totalChecklistItems) * 100)}%)
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleDownloadMarkdown(false)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/20 flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            Download 8-Week Workbook (.md)
          </button>
        </div>
      </div>

      {/* Week Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {LAUNCHPAD_WORKSHEETS.map((ws) => {
          const wkChecklist = checklistStateByWeek[ws.week] || {};
          const doneCount = ws.checklistItems.filter((i) => Boolean(wkChecklist[i.id])).length;
          const isSelected = ws.week === selectedWeek;
          const lessonObj = lessons.find((l) => l.week === ws.week);
          const isSubmitted =
            lessonObj?.assignment?.status === 'submitted' || lessonObj?.assignment?.status === 'reviewed';

          return (
            <button
              key={ws.week}
              type="button"
              onClick={() => {
                setSelectedWeek(ws.week);
                setLocalSavedBanner('');
              }}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                isSelected
                  ? 'bg-teal-500/15 border-teal-500 text-white shadow-md'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-mono font-bold text-teal-400">W0{ws.week}</span>
                {doneCount === ws.checklistItems.length || isSubmitted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <span className="text-[10px] font-mono text-slate-400">
                    {doneCount}/{ws.checklistItems.length}
                  </span>
                )}
              </div>
              <div className="text-xs font-semibold text-white line-clamp-1">
                {ws.worksheetTitle.replace(/^Week \d+ Worksheet:\s*/, '')}
              </div>
              <span className="text-[10px] uppercase font-mono text-slate-400">
                {ws.phaseCode}
              </span>
            </button>
          );
        })}
      </div>

      {localSavedBanner && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{localSavedBanner}</span>
        </div>
      )}

      {/* Active Week Worksheet & Checklist */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded border ${getPhaseBadgeStyle(
                  activeWorksheet.phaseCode
                )}`}
              >
                {activeWorksheet.phase}
              </span>
              <span className="text-xs font-medium text-teal-300 bg-slate-950 border border-slate-800 px-2.5 py-0.5 rounded flex items-center gap-1">
                <Wrench className="w-3 h-3" /> {activeWorksheet.platformTool}
              </span>
              <span className="text-xs font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded">
                Deliverable: {activeWorksheet.primaryDeliverable}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">{activeWorksheet.worksheetTitle}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{activeWorksheet.worksheetSubtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleDownloadMarkdown(true)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              Export Week {selectedWeek} (.md)
            </button>
            <button
              type="button"
              onClick={() => handleSaveOrSubmit(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save Progress
            </button>
            <button
              type="button"
              onClick={() => handleSaveOrSubmit(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/20 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Submit to Coach
            </button>
          </div>
        </div>

        {/* GROW Coaching Prompt */}
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 flex items-start gap-3">
          <Target className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200 leading-relaxed">
            <strong className="text-amber-300 uppercase tracking-wide block mb-0.5">
              GROW Coaching Reflection Prompt
            </strong>
            {activeWorksheet.growPrompt}
          </div>
        </div>

        {/* Part 1: Follow-Along Operational Checklist */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-teal-400" />
              Part 1: Follow-Along Operational Checklist ({activeWeekCompletedCount}/
              {activeWorksheet.checklistItems.length} Completed)
            </h4>
            <button
              type="button"
              onClick={() => {
                const allChecked = activeWeekCompletedCount === activeWorksheet.checklistItems.length;
                const nextMap: Record<string, boolean> = {};
                for (const item of activeWorksheet.checklistItems) {
                  nextMap[item.id] = !allChecked;
                }
                setChecklistStateByWeek((prev) => ({ ...prev, [selectedWeek]: nextMap }));
              }}
              className="text-xs text-teal-400 hover:text-teal-300 font-semibold"
            >
              {activeWeekCompletedCount === activeWorksheet.checklistItems.length
                ? 'Uncheck All'
                : 'Mark All 6 Checked'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeWorksheet.checklistItems.map((item) => {
              const isChecked = Boolean(activeChecklist[item.id]);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleChecklistItem(item.id)}
                  className={`text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                    isChecked
                      ? 'bg-emerald-950/25 border-emerald-500/40 text-white'
                      : 'bg-slate-950/70 border-slate-800/90 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isChecked ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-teal-300">
                        {item.category}
                      </span>
                    </div>
                    <div
                      className={`text-xs font-bold leading-snug ${
                        isChecked ? 'text-emerald-200 line-through decoration-emerald-500/50' : 'text-white'
                      }`}
                    >
                      {item.label}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.detail}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Part 2: Client Worksheet Exercises */}
        <div className="space-y-4 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-400" />
              Part 2: Structured Client Worksheet Exercises
            </h4>
            <span className="text-[11px] text-slate-400">
              Auto-cached locally &amp; synced to Supabase on Save/Submit
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {activeWorksheet.fields.map((field) => (
              <div
                key={field.id}
                className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2"
              >
                <label className="block text-xs font-bold text-white">
                  {field.label}
                </label>
                <p className="text-[11px] text-slate-400">{field.helperText}</p>
                <textarea
                  value={activeFields[field.id] || ''}
                  onChange={(e) => updateFieldValue(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Coach Feedback if reviewed */}
        {activeLesson?.assignment?.coachFeedback && (
          <div className="bg-teal-950/30 border border-teal-500/30 rounded-xl p-4 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-teal-300">
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4" /> Coach Chad de Wet Review Feedback
              </span>
              {activeLesson.assignment.score && (
                <span>Score: {activeLesson.assignment.score}/100</span>
              )}
            </div>
            <p className="text-xs text-slate-200">{activeLesson.assignment.coachFeedback}</p>
          </div>
        )}

        {/* Bottom Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>
              Status:{' '}
              <strong className="text-slate-200 uppercase">
                {activeLesson?.assignment?.status || 'in progress'}
              </strong>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSaveOrSubmit(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save Week {selectedWeek} Worksheet Draft
            </button>
            <button
              type="button"
              onClick={() => handleSaveOrSubmit(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/20 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Week {selectedWeek} Worksheet &amp; Checklist to Coach
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
