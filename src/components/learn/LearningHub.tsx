/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import type { LessonItem, LiveSession } from '../../types/database.ts';
import {
  LAUNCHPAD_COURSE_METADATA,
  LAUNCHPAD_INFRASTRUCTURE,
  LAUNCHPAD_PHASES,
  LAUNCHPAD_WEEKS,
  getLaunchpadWeekByNumber,
} from '../../lib/launchpad-syllabus.ts';
import {
  PlayCircle,
  FileText,
  CheckCircle2,
  Clock,
  Video,
  MessageSquare,
  Send,
  Award,
  Calendar,
  ExternalLink,
  ShieldAlert,
  Compass,
  Target,
  Layers,
  Wrench,
  BookOpen,
  ClipboardCheck,
} from 'lucide-react';
import { LaunchpadWorksheets } from '../worksheets/LaunchpadWorksheets.tsx';

interface LearningHubProps {
  lessons: LessonItem[];
  liveSessions?: LiveSession[];
  onToggleLessonComplete: (id: string) => void;
  onSubmitAssignment: (lessonId: string, text: string) => void;
  onAskQuestion?: (sessionId: string, question: string) => void;
  userId?: string;
}

export const LearningHub: React.FC<LearningHubProps> = ({
  lessons,
  liveSessions = [],
  onToggleLessonComplete,
  onSubmitAssignment,
  onAskQuestion,
}) => {
  const [selectedLessonId, setSelectedLessonId] = useState<string>(lessons[0]?.id || '');
  const [assignmentText, setAssignmentText] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'curriculum' | 'worksheets' | 'matrix' | 'live'>('curriculum');
  const [worksheetTargetWeek, setWorksheetTargetWeek] = useState<number>(1);
  const [consentChecked, setConsentChecked] = useState<Record<string, boolean>>({});
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<'all' | 'know' | 'prepare' | 'execute'>('all');

  useEffect(() => {
    if ((!selectedLessonId || !lessons.some((l) => l.id === selectedLessonId)) && lessons[0]?.id) {
      setSelectedLessonId(lessons[0].id);
    }
  }, [lessons, selectedLessonId]);

  const enrichedLessons = lessons.map((lesson) => {
    const syllabus = getLaunchpadWeekByNumber(lesson.week);
    return {
      ...lesson,
      phase: lesson.phase || syllabus.phase,
      phaseCode: lesson.phaseCode || syllabus.phaseCode,
      moduleFocus: lesson.moduleFocus || syllabus.moduleFocus,
      growAnchor: lesson.growAnchor || syllabus.growAnchor,
      coreObjective: lesson.coreObjective || syllabus.coreObjective || lesson.content,
      platformTool: lesson.platformTool || syllabus.platformTool,
      operationalLessons:
        lesson.operationalLessons && lesson.operationalLessons.length > 0
          ? lesson.operationalLessons
          : syllabus.operationalLessons,
      techDeliverable: lesson.techDeliverable || syllabus.techDeliverable,
      weeklyMilestone: lesson.weeklyMilestone || syllabus.weeklyMilestone,
      primaryOutput: lesson.primaryOutput || syllabus.primaryOutput,
      deckUrl: lesson.deckUrl || syllabus.deckUrl,
    };
  });

  const filteredLessons =
    selectedPhaseFilter === 'all'
      ? enrichedLessons
      : enrichedLessons.filter((l) => l.phaseCode === selectedPhaseFilter);

  const activeLesson =
    enrichedLessons.find((l) => l.id === selectedLessonId) || filteredLessons[0] || enrichedLessons[0];
  const completedCount = enrichedLessons.filter((l) => l.completed).length;

  const getPhaseBadgeStyle = (phaseCode?: string) => {
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
      {/* Course Architecture Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full">
              <Compass className="w-3.5 h-3.5" />
              Green Yacht Crew Solutions (GYCS)
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {LAUNCHPAD_COURSE_METADATA.title}
            </h2>
            <p className="text-sm text-slate-300">
              <span className="text-slate-400 font-semibold">Instructor / Systems Architect:</span>{' '}
              {LAUNCHPAD_COURSE_METADATA.instructor}
            </p>
            <p className="text-xs text-teal-300/90 font-medium">
              Delivery Framework: {LAUNCHPAD_COURSE_METADATA.deliveryFramework}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveSubTab('curriculum')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeSubTab === 'curriculum'
                  ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20 font-bold'
                  : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              8-Week Modules ({completedCount}/{enrichedLessons.length})
            </button>
            <button
              onClick={() => {
                setWorksheetTargetWeek(activeLesson?.week || 1);
                setActiveSubTab('worksheets');
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeSubTab === 'worksheets'
                  ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20 font-bold'
                  : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              Worksheets &amp; Checklists
            </button>
            <button
              onClick={() => setActiveSubTab('matrix')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeSubTab === 'matrix'
                  ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20 font-bold'
                  : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              Deliverables Matrix & Stack
            </button>
            <button
              onClick={() => setActiveSubTab('live')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeSubTab === 'live'
                  ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20 font-bold'
                  : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Video className="w-4 h-4" />
              Live Coaching & Q&A ({liveSessions.length})
            </button>
          </div>
        </div>

        {/* 3-Phase Acceleration Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-800/80">
          {LAUNCHPAD_PHASES.map((phaseObj) => {
            const isSelected = selectedPhaseFilter === phaseObj.code;
            const phaseLessons = enrichedLessons.filter((l) => l.phaseCode === phaseObj.code);
            const phaseCompleted = phaseLessons.filter((l) => l.completed).length;
            return (
              <button
                key={phaseObj.code}
                type="button"
                onClick={() => {
                  setActiveSubTab('curriculum');
                  setSelectedPhaseFilter(isSelected ? 'all' : phaseObj.code);
                  if (!isSelected && phaseLessons[0]) {
                    setSelectedLessonId(phaseLessons[0].id);
                  }
                }}
                className={`text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-teal-500/15 border-teal-500/40 shadow-md'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded border ${getPhaseBadgeStyle(phaseObj.code)}`}>
                    {phaseObj.phase}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {phaseObj.weeks} · {phaseCompleted}/{phaseLessons.length} done
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-2">{phaseObj.subtitle}</p>
                <div className="flex flex-wrap gap-1.5">
                  {phaseObj.bullets.map((b) => (
                    <span
                      key={b}
                      className="text-[11px] bg-slate-900/90 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md"
                    >
                      • {b}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {activeSubTab === 'curriculum' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Lesson Sidebar */}
          <div className="lg:col-span-4 space-y-2.5">
            <div className="flex items-center justify-between px-2 mb-1">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                8-Week Acceleration Syllabus
              </div>
              {selectedPhaseFilter !== 'all' && (
                <button
                  onClick={() => setSelectedPhaseFilter('all')}
                  className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold"
                >
                  Show All 8 Weeks
                </button>
              )}
            </div>
            {filteredLessons.map((lesson) => {
              const isSelected = lesson.id === activeLesson?.id;
              return (
                <button
                  key={lesson.id}
                  onClick={() => setSelectedLessonId(lesson.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-teal-500/10 border-teal-500/40 text-white shadow-sm'
                      : 'bg-slate-900/50 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {lesson.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-400">
                        {lesson.week}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
                      <span className="font-mono uppercase text-teal-400 font-semibold">
                        Week 0{lesson.week} · {lesson.phaseCode?.toUpperCase()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {lesson.durationMins}m
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-white mt-0.5 leading-snug">
                      {lesson.title}
                    </div>
                    {lesson.growAnchor && (
                      <div className="text-[11px] text-slate-400 mt-1 truncate">
                        GROW: {lesson.growAnchor}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {lesson.platformTool && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                          {lesson.platformTool}
                        </span>
                      )}
                      {lesson.assignment && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                            lesson.assignment.status === 'reviewed'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : lesson.assignment.status === 'submitted'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {lesson.assignment.status === 'reviewed'
                            ? 'Coach Approved'
                            : lesson.assignment.status === 'submitted'
                            ? 'Submitted'
                            : 'Deliverable Due'}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Lesson Viewer */}
          <div className="lg:col-span-8">
            {activeLesson && (
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 space-y-6">
                {/* Header & Completion Button */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-5">
                  <div className="space-y-2 max-w-xl">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className={`font-bold uppercase px-2.5 py-0.5 rounded border ${getPhaseBadgeStyle(activeLesson.phaseCode)}`}>
                        {activeLesson.phase}
                      </span>
                      <span className="bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded capitalize font-medium">
                        {activeLesson.type} module
                      </span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {activeLesson.durationMins} mins
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white">{activeLesson.title}</h3>
                    {activeLesson.growAnchor && (
                      <div className="inline-flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/25 px-3 py-1 rounded-lg">
                        <Target className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          <strong className="font-semibold">GROW Anchor:</strong> {activeLesson.growAnchor}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {activeLesson.deckUrl && (
                      <a
                        href={activeLesson.deckUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-950 border border-slate-700 text-slate-200 hover:border-teal-500/50 hover:text-teal-300 transition-all flex items-center gap-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                        Teaching Deck
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    )}
                    <button
                      onClick={() => onToggleLessonComplete(activeLesson.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                        activeLesson.completed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {activeLesson.completed ? 'Completed' : 'Mark as Complete'}
                    </button>
                  </div>
                </div>

                {/* Core Objective Banner */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-teal-400 mb-1">
                    Core Objective
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {activeLesson.coreObjective || activeLesson.content}
                  </p>
                </div>

                {/* Video Player (Gumlet AI Stream or Fallback Player) */}
                {activeLesson.videoUrl || activeLesson.gumletAssetId ? (
                  <div className="aspect-video bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative">
                    <iframe
                      loading="lazy"
                      title={activeLesson.title || 'Gumlet course video player'}
                      src={
                        activeLesson.videoUrl ||
                        `https://play.gumlet.io/embed/${activeLesson.gumletAssetId}`
                      }
                      className="w-full h-full border-0"
                      referrerPolicy="origin"
                      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center mb-3">
                      <PlayCircle className="w-8 h-8" />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-200">
                      Interactive Video &amp; GROW Coaching Lecture
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-md">
                      Presented by Chad de Wet (Yachtmaster Offshore 200GT, Enterprise AI/API Architect). Streamed via signed private Gumlet player.
                    </p>
                  </div>
                )}

                {/* Learning Modules & Operational Lessons */}
                {activeLesson.operationalLessons && activeLesson.operationalLessons.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-teal-400" />
                        Learning Modules & Operational Lessons
                      </h4>
                      {activeLesson.platformTool && (
                        <span className="text-xs font-medium text-teal-300 bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded-lg">
                          Core Tool: {activeLesson.platformTool}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {activeLesson.operationalLessons.map((group, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-4 space-y-2"
                        >
                          <div className="text-sm font-bold text-white">{group.title}</div>
                          <ul className="space-y-1.5">
                            {group.points.map((pt, pIdx) => (
                              <li
                                key={pIdx}
                                className="text-xs text-slate-300 leading-relaxed flex items-start gap-2"
                              >
                                <span className="text-teal-400 font-bold mt-0.5">•</span>
                                <span>{pt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tech & Digital Deliverable + Weekly Milestone Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-teal-950/20 border border-teal-500/30 rounded-xl p-4 space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5" />
                      Tech & Digital Deliverable
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {activeLesson.techDeliverable}
                    </p>
                    {activeLesson.primaryOutput && (
                      <div className="pt-1 text-[11px] font-semibold text-teal-300">
                        Primary Output: {activeLesson.primaryOutput}
                      </div>
                    )}
                  </div>

                  <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-xl p-4 space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" />
                      Weekly Milestone Sign-Off
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {activeLesson.weeklyMilestone}
                    </p>
                  </div>
                </div>

                {/* Open Interactive Week Worksheet & Follow-Along Checklist Banner */}
                <div className="bg-slate-950/80 border border-teal-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                      <ClipboardCheck className="w-4 h-4 text-teal-400" />
                      Week 0{activeLesson.week} Interactive Client Worksheet &amp; Follow-Along Checklist
                    </div>
                    <p className="text-xs text-slate-300">
                      Complete the 6-point operational checklist and 4 structured worksheet exercises for Week {activeLesson.week}, or export a printable Markdown copy.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setWorksheetTargetWeek(activeLesson.week);
                      setActiveSubTab('worksheets');
                    }}
                    className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    Open Week {activeLesson.week} Worksheet
                  </button>
                </div>

                {/* Assignment Box */}
                {activeLesson.assignment && (
                  <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" /> Practical Coaching Deliverable
                        </span>
                        <h4 className="text-base font-bold text-white mt-1">
                          {activeLesson.assignment.title}
                        </h4>
                        <p className="text-xs text-slate-300 mt-1">
                          {activeLesson.assignment.instructions}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize shrink-0 ${
                          activeLesson.assignment.status === 'reviewed'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : activeLesson.assignment.status === 'submitted'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {activeLesson.assignment.status}
                      </span>
                    </div>

                    {activeLesson.assignment.submittedContent ? (
                      <div className="space-y-3 pt-2 border-t border-slate-800/80">
                        <div>
                          <div className="text-[11px] font-semibold uppercase text-slate-400">
                            Your Submission:
                          </div>
                          <p className="text-xs text-slate-200 bg-slate-900 p-3 rounded-lg mt-1 border border-slate-800">
                            {activeLesson.assignment.submittedContent}
                          </p>
                        </div>

                        {activeLesson.assignment.coachFeedback && (
                          <div className="bg-teal-950/30 border border-teal-500/30 rounded-lg p-3">
                            <div className="flex items-center justify-between text-xs font-semibold text-teal-300 mb-1">
                              <span className="flex items-center gap-1.5">
                                <Award className="w-4 h-4" /> Coach Feedback (Chad de Wet)
                              </span>
                              {activeLesson.assignment.score && (
                                <span>Score: {activeLesson.assignment.score}/100</span>
                              )}
                            </div>
                            <p className="text-xs text-slate-200">
                              {activeLesson.assignment.coachFeedback}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3 pt-2">
                        <textarea
                          value={assignmentText}
                          onChange={(e) => setAssignmentText(e.target.value)}
                          placeholder="Enter your deliverable summary, audit parameters, or link to your CV Studio / Candidate Funnel output..."
                          rows={3}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                        />
                        <button
                          onClick={() => {
                            if (assignmentText.trim()) {
                              onSubmitAssignment(activeLesson.id, assignmentText.trim());
                              setAssignmentText('');
                            }
                          }}
                          className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-all"
                        >
                          <Send className="w-3.5 h-3.5" /> Submit Deliverable for Coach Review
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'worksheets' && (
        <LaunchpadWorksheets
          lessons={enrichedLessons}
          initialWeek={worksheetTargetWeek}
          onSaveWorksheet={(lessonId, serializedMarkdown) => {
            onSubmitAssignment(lessonId, serializedMarkdown);
          }}
        />
      )}

      {activeSubTab === 'matrix' && (
        <div className="space-y-6">
          {/* Weekly Curriculum & Deliverables Matrix */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Weekly Curriculum & Deliverables Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Complete 8-week operational roadmap across Phase 1 (KNOW), Phase 2 (PREPARE), and Phase 3 (EXECUTE).
                </p>
              </div>
              <span className="text-xs font-mono text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-lg">
                GROW Coaching Model
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-3">Week</th>
                    <th className="py-3 px-3">Phase</th>
                    <th className="py-3 px-3">Module Focus</th>
                    <th className="py-3 px-3">GROW Anchor</th>
                    <th className="py-3 px-3">Core Platform Tool</th>
                    <th className="py-3 px-3">Primary Output / Deliverable</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-xs">
                  {LAUNCHPAD_WEEKS.map((w) => {
                    const matchingLesson = enrichedLessons.find((l) => l.week === w.week);
                    return (
                      <tr key={w.week} className="hover:bg-slate-950/50 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-white">
                          0{w.week}
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getPhaseBadgeStyle(
                              w.phaseCode
                            )}`}
                          >
                            {w.phaseCode.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-white">
                          {w.moduleFocus}
                        </td>
                        <td className="py-3.5 px-3 text-slate-300">{w.growAnchor}</td>
                        <td className="py-3.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700 text-[11px]">
                            {w.platformTool}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-emerald-300 font-medium">
                          {w.primaryOutput}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => {
                              if (matchingLesson) {
                                setSelectedLessonId(matchingLesson.id);
                              }
                              setSelectedPhaseFilter('all');
                              setActiveSubTab('curriculum');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 font-semibold text-[11px]"
                          >
                            Open Week {w.week}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Course Tooling & Technical Infrastructure */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white">
                Course Tooling & Technical Infrastructure
              </h3>
              <p className="text-xs text-slate-400">
                Integrated 5-pillar technology stack powering your 8-Week Superyacht Career Launchpad across Web and Android.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {LAUNCHPAD_INFRASTRUCTURE.map((tool) => (
                <div
                  key={tool.number}
                  className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-teal-400">
                        0{tool.number} · PLATFORM TOOL
                      </span>
                      {tool.domain && (
                        <span className="text-[11px] font-mono text-slate-400">
                          {tool.domain}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white">{tool.name}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                  <a
                    href={tool.url}
                    target={tool.url.startsWith('http') ? '_blank' : undefined}
                    rel={tool.url.startsWith('http') ? 'noreferrer' : undefined}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300"
                  >
                    Launch {tool.name}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'live' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {liveSessions.map((session) => {
            const hasConsented = consentChecked[session.id] || false;
            return (
              <div
                key={session.id}
                className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {session.cohortName}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-400" />
                      {new Date(session.scheduledAt).toLocaleString([], {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{session.title}</h3>
                  <p className="text-xs text-slate-400">
                    Hosted by <span className="text-slate-200 font-medium">{session.coachName}</span> •{' '}
                    {session.durationMins} mins
                  </p>

                  {/* POPIA Recording Consent Gate */}
                  {session.recordingConsentRequired && (
                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        Recording & Replay Consent (POPIA Compliance)
                      </div>
                      <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasConsented}
                          onChange={(e) =>
                            setConsentChecked({ ...consentChecked, [session.id]: e.target.checked })
                          }
                          className="mt-0.5 rounded border-slate-700 text-teal-500 focus:ring-teal-500"
                        />
                        <span>
                          I understand this coaching room is recorded for cohort replay inside the GYCS Crew Hub and consent to participating.
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Join Link */}
                  <div className="pt-1">
                    <a
                      href={hasConsented ? session.meetingUrl : '#'}
                      onClick={(e) => {
                        if (!hasConsented) {
                          e.preventDefault();
                          alert('Please check the recording consent box before joining the live room.');
                        }
                      }}
                      target="_blank"
                      rel="noreferrer"
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        hasConsented
                          ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Video className="w-4 h-4" /> Join Live Coaching Room{' '}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Q&A Queue */}
                <div className="border-t border-slate-800 pt-4 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-teal-400" /> Pre-Submitted Q&A Queue (
                    {session.questions.length})
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {session.questions.map((q) => (
                      <div
                        key={q.id}
                        className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 text-xs flex items-start justify-between gap-2"
                      >
                        <div>
                          <span className="font-semibold text-teal-300">{q.user}: </span>
                          <span className="text-slate-300">{q.text}</span>
                        </div>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                            q.answered
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {q.answered ? 'Answered' : 'Queued'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="Submit a question for Chad..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                    />
                    <button
                      onClick={() => {
                        if (questionText.trim() && onAskQuestion) {
                          onAskQuestion(session.id, questionText.trim());
                          setQuestionText('');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold transition-all"
                    >
                      Ask
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
