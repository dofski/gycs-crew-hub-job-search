/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  GraduationCap,
  PlayCircle,
  FileText,
  CheckCircle,
  Clock,
  Sparkles,
  Send,
  HelpCircle
} from 'lucide-react';
import type { LessonItem } from '../../types/database.ts';

interface LearningHubProps {
  lessons: LessonItem[];
  onToggleLessonComplete: (lessonId: string) => void;
  onSubmitAssignment: (lessonId: string, text: string) => void;
}

export const LearningHub: React.FC<LearningHubProps> = ({
  lessons,
  onToggleLessonComplete,
  onSubmitAssignment,
}) => {
  const [selectedLessonId, setSelectedLessonId] = useState<string>(lessons[0]?.id || 'les-1');
  const [submissionText, setSubmissionText] = useState('');

  const currentLesson = lessons.find((l) => l.id === selectedLessonId) || lessons[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionText.trim() || !currentLesson) return;
    onSubmitAssignment(currentLesson.id, submissionText);
    setSubmissionText('');
  };

  if (!currentLesson) {
    return (
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-400">
        No published lessons are currently available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Programme Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Cohort Track: Oct – Nov 2026 (Zero to First Contract)</span>
          </div>
          <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">
            8-Week Guided Maritime Curriculum
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Live coaching, seamanship foundations, safety compliance, and Mediterranean search tactics.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400">Curriculum Progress</span>
          <div className="text-lg font-bold text-emerald-400 font-mono">
            {lessons.filter((l) => l.completed).length} / {lessons.length} Modules
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Lesson Modules List (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Weekly Modules
          </span>
          <div className="space-y-2">
            {lessons.map((lesson) => {
              const isSelected = lesson.id === selectedLessonId;
              return (
                <button
                  key={lesson.id}
                  onClick={() => setSelectedLessonId(lesson.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3 ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-200'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="mt-0.5">
                    {lesson.completed ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      Week {lesson.week} · {lesson.durationMins} mins
                    </span>
                    <h4 className="text-xs font-semibold text-white truncate mt-0.5">
                      {lesson.title}
                    </h4>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Lesson Detail & Assignment (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                  Week {currentLesson.week} Module
                </span>
                <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] mt-0.5">
                  {currentLesson.title}
                </h3>
              </div>

              <button
                onClick={() => onToggleLessonComplete(currentLesson.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  currentLesson.completed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{currentLesson.completed ? 'Completed' : 'Mark as Complete'}</span>
              </button>
            </div>

            {/* Gumlet Video Player or Fallback */}
            {currentLesson.videoUrl || currentLesson.gumletAssetId ? (
              <div className="aspect-video bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative">
                <iframe
                  loading="lazy"
                  title={currentLesson.title || 'Gumlet course video player'}
                  src={
                    currentLesson.videoUrl ||
                    `https://play.gumlet.io/embed/${currentLesson.gumletAssetId}`
                  }
                  className="w-full h-full border-0"
                  referrerPolicy="origin"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write"
                />
              </div>
            ) : (
              <div className="aspect-video bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                  <PlayCircle className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-semibold text-slate-200">
                  Interactive Video &amp; Coaching Lecture
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Presented by Chad de Wet. Streamed via signed private Gumlet player.
                </p>
              </div>
            )}

            <div className="prose prose-invert prose-xs text-slate-300 leading-relaxed pt-2">
              <p>{currentLesson.content}</p>
            </div>

            {/* Assignment Section */}
            {currentLesson.assignment && (
              <div className="mt-6 pt-6 border-t border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-sky-400 tracking-wider">
                      Cohort Assignment
                    </span>
                    <h4 className="text-sm font-bold text-white mt-0.5">
                      {currentLesson.assignment.title}
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                    Status: {currentLesson.assignment.status}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                  <strong className="text-slate-100 block mb-1">Instructions:</strong>
                  {currentLesson.assignment.instructions}
                </div>

                {currentLesson.assignment.submittedContent && (
                  <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <strong className="text-slate-400 block mb-1">Your Submission:</strong>
                    <p className="italic text-slate-200">{currentLesson.assignment.submittedContent}</p>
                  </div>
                )}

                {currentLesson.assignment.coachFeedback && (
                  <div className="p-3.5 bg-purple-950/30 border border-purple-500/30 rounded-xl text-xs text-purple-200">
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-purple-100">Coach Feedback (Chad de Wet):</strong>
                      {currentLesson.assignment.score && (
                        <span className="font-mono text-purple-300 font-bold">
                          Score: {currentLesson.assignment.score}/100
                        </span>
                      )}
                    </div>
                    <p className="leading-relaxed">{currentLesson.assignment.coachFeedback}</p>
                  </div>
                )}

                {/* Submit Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <textarea
                    rows={3}
                    placeholder="Enter your reflection or assignment response..."
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Assignment to Coach</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
