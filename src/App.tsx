/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar.tsx';
import { GuardrailWarning } from './components/shared/GuardrailWarning.tsx';
import { ConsentBanner } from './components/shared/ConsentBanner.tsx';
import { OpenDecisionsModal } from './components/shared/OpenDecisionsModal.tsx';
import { AuditTrail } from './components/shared/AuditTrail.tsx';

import { TodayView } from './components/today/TodayView.tsx';
import { IntakeWizard, type IntakeAssessmentData } from './components/intake/IntakeWizard.tsx';
import { IntakeResult } from './components/intake/IntakeResult.tsx';
import { MilestoneTimeline } from './components/pathway/MilestoneTimeline.tsx';
import { DocumentVault } from './components/documents/DocumentVault.tsx';
import { CVStudio } from './components/cv/CVStudio.tsx';
import { LearningHub } from './components/learn/LearningHub.tsx';
import { LiveRoom } from './components/live/LiveRoom.tsx';
import { OpportunityBoard } from './components/opportunities/OpportunityBoard.tsx';
import { ApplicationTracker } from './components/applications/ApplicationTracker.tsx';
import { DestinationGuide } from './components/explore/DestinationGuide.tsx';
import { CoachConsole } from './components/coach/CoachConsole.tsx';
import { ConsentSettings } from './components/settings/ConsentSettings.tsx';
import { JobSearchMap } from './components/job-search/JobSearchMap.tsx';

import {
  INITIAL_PROFILES,
  INITIAL_DOCUMENTS,
  INITIAL_READINESS_SARAH,
  INITIAL_CV_SARAH,
  INITIAL_MILESTONES_SARAH,
  INITIAL_LESSONS,
  INITIAL_LIVE_SESSIONS,
  INITIAL_OPPORTUNITIES,
  INITIAL_APPLICATIONS,
  INITIAL_OUTCOMES,
} from './lib/mockData.ts';

import type {
  UserProfile,
  DocumentItem,
  CVData,
  LessonItem,
  LiveSession,
  Opportunity,
  Application,
  VerifiedOutcome,
} from './types/database.ts';
import type { Milestone, JourneyState, ReadinessDimension, ReadinessLevel } from './lib/constants.ts';

export default function App() {
  const [profiles, setProfiles] = useState<UserProfile[]>(INITIAL_PROFILES);
  const [currentProfile, setCurrentProfile] = useState<UserProfile>(INITIAL_PROFILES[0]);
  const [activeTab, setActiveTab] = useState<string>('today');
  const [openDecisionsModalOpen, setOpenDecisionsModalOpen] = useState(false);

  // Per-member datasets
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [cvData, setCvData] = useState<CVData>(INITIAL_CV_SARAH);
  const [milestones, setMilestones] = useState<Milestone[]>(INITIAL_MILESTONES_SARAH);
  const [readinessMatrix, setReadinessMatrix] = useState<ReadinessDimension[]>(INITIAL_READINESS_SARAH);
  const [lessons, setLessons] = useState<LessonItem[]>(INITIAL_LESSONS);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>(INITIAL_LIVE_SESSIONS);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(INITIAL_OPPORTUNITIES);
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS);
  const [outcomes, setOutcomes] = useState<VerifiedOutcome[]>(INITIAL_OUTCOMES);

  // Intake State
  const [intakeCompletedData, setIntakeCompletedData] = useState<IntakeAssessmentData | null>(null);

  // Sync journey state change
  const handleUpdateJourneyState = (newState: JourneyState) => {
    const updated = { ...currentProfile, journeyState: newState };
    setCurrentProfile(updated);
    setProfiles(profiles.map((p) => (p.id === currentProfile.id ? updated : p)));
  };

  const handleUpdateMilestoneStatus = (milestoneId: string, status: Milestone['status']) => {
    setMilestones(
      milestones.map((m) => (m.id === milestoneId ? { ...m, status } : m))
    );
  };

  const handleUploadDocument = (doc: Partial<DocumentItem>) => {
    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      userId: currentProfile.id,
      category: doc.category || 'training',
      title: doc.title || 'Untitled Document',
      verificationStatus: 'uploaded',
      fileName: doc.fileName || 'uploaded_doc.pdf',
      fileSizeBytes: doc.fileSizeBytes || 1200000,
      issuingAuthority: doc.issuingAuthority,
      expiryDate: doc.expiryDate,
      isSensitive: Boolean(doc.isSensitive),
    };
    setDocuments([newDoc, ...documents]);
  };

  const handleSaveCV = (newCv: CVData) => {
    setCvData(newCv);
  };

  const handleToggleLessonComplete = (lessonId: string) => {
    setLessons(
      lessons.map((l) => (l.id === lessonId ? { ...l, completed: !l.completed } : l))
    );
  };

  const handleSubmitAssignment = (lessonId: string, text: string) => {
    setLessons(
      lessons.map((l) => {
        if (l.id === lessonId && l.assignment) {
          return {
            ...l,
            assignment: {
              ...l.assignment,
              status: 'submitted',
              submittedContent: text,
            },
          };
        }
        return l;
      })
    );
  };

  const handleAddLiveQuestion = (sessionId: string, questionText: string) => {
    setLiveSessions(
      liveSessions.map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            questions: [
              ...s.questions,
              {
                id: `q-${Date.now()}`,
                user: currentProfile.displayName,
                text: questionText,
                answered: false,
              },
            ],
          };
        }
        return s;
      })
    );
  };

  const handleSaveOpportunityToApplications = (opp: Opportunity) => {
    const existing = applications.find((a) => a.opportunityId === opp.id);
    if (existing) {
      setActiveTab('applications');
      return;
    }
    const newApp: Application = {
      id: `app-${Date.now()}`,
      userId: currentProfile.id,
      opportunityId: opp.id,
      title: opp.title,
      employer: opp.employerName,
      location: opp.location,
      status: 'saved',
      notes: `Saved from direct partner listings on ${new Date().toLocaleDateString()}. Outbound application link recorded.`,
      interviews: [],
    };
    setApplications([newApp, ...applications]);
    setActiveTab('applications');
  };

  const handleUpdateApplicationStatus = (appId: string, status: Application['status']) => {
    setApplications(
      applications.map((a) => (a.id === appId ? { ...a, status } : a))
    );
  };

  const handleAddInterview = (appId: string, date: string, notes: string) => {
    setApplications(
      applications.map((a) => {
        if (a.id === appId) {
          return {
            ...a,
            status: 'interview_scheduled',
            interviews: [
              ...a.interviews,
              {
                id: `int-${Date.now()}`,
                scheduledAt: date,
                format: 'video',
                notes,
                outcome: 'pending',
              },
            ],
          };
        }
        return a;
      })
    );
  };

  const handleUpdateReadinessLevel = (dimKey: string, level: ReadinessLevel) => {
    setReadinessMatrix(
      readinessMatrix.map((d) => (d.key === dimKey ? { ...d, level } : d))
    );
  };

  const handleRecordOutcome = (outcome: Partial<VerifiedOutcome>) => {
    const newOutcome: VerifiedOutcome = {
      id: `out-${Date.now()}`,
      userId: outcome.userId || currentProfile.id,
      memberName: outcome.memberName || currentProfile.displayName,
      roleTitle: outcome.roleTitle || 'Junior Crew',
      vesselName: outcome.vesselName || 'Motor Yacht',
      employmentType: outcome.employmentType || 'seasonal',
      startDate: outcome.startDate || new Date().toISOString().split('T')[0],
      evidenceType: outcome.evidenceType || 'redacted_contract',
      evidenceNotes: outcome.evidenceNotes || '',
      consistentWithPathway: true,
      verifiedBy: 'Chad de Wet',
      verifiedAt: new Date().toISOString(),
      retentionChecks: outcome.retentionChecks || [
        { stage: 'week_1', status: 'pending' },
        { stage: 'week_4', status: 'pending' },
        { stage: 'month_3', status: 'pending' },
        { stage: 'season_end', status: 'pending' },
      ],
    };
    setOutcomes([newOutcome, ...outcomes]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Navigation Header */}
      <Navbar
        currentProfile={currentProfile}
        allProfiles={profiles}
        onSelectProfile={(p) => setCurrentProfile(p)}
        activeTab={activeTab}
        onSelectTab={(t) => setActiveTab(t)}
        onOpenOpenDecisions={() => setOpenDecisionsModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Responsible Career Guardrail Notice */}
        <GuardrailWarning compact={activeTab !== 'today'} />

        {/* Tab Content Routing */}
        {activeTab === 'today' && (
          <TodayView
            profile={currentProfile}
            onNavigate={(t) => setActiveTab(t)}
            onOpenIntake={() => setActiveTab('intake')}
          />
        )}

        {activeTab === 'job_search' && (
          <JobSearchMap
            onSaveToApplications={handleSaveOpportunityToApplications}
          />
        )}

        {activeTab === 'intake' && (
          <div>
            {intakeCompletedData ? (
              <IntakeResult
                data={intakeCompletedData}
                onProceedToPathway={() => setActiveTab('pathway')}
              />
            ) : (
              <IntakeWizard
                onComplete={(data) => {
                  setIntakeCompletedData(data);
                  handleUpdateJourneyState('pathway_agreed');
                }}
              />
            )}
          </div>
        )}

        {activeTab === 'pathway' && (
          <MilestoneTimeline
            milestones={milestones}
            currentJourneyState={currentProfile.journeyState}
            onUpdateJourneyState={handleUpdateJourneyState}
            onUpdateMilestoneStatus={handleUpdateMilestoneStatus}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentVault
            documents={documents}
            onUploadDocument={handleUploadDocument}
          />
        )}

        {activeTab === 'cv' && (
          <CVStudio
            cvData={cvData}
            onSaveCV={handleSaveCV}
          />
        )}

        {activeTab === 'learn' && (
          <LearningHub
            lessons={lessons}
            onToggleLessonComplete={handleToggleLessonComplete}
            onSubmitAssignment={handleSubmitAssignment}
          />
        )}

        {activeTab === 'live' && (
          <LiveRoom
            sessions={liveSessions}
            onAddQuestion={handleAddLiveQuestion}
          />
        )}

        {activeTab === 'opportunities' && (
          <OpportunityBoard
            opportunities={opportunities}
            onSaveToApplications={handleSaveOpportunityToApplications}
          />
        )}

        {activeTab === 'applications' && (
          <ApplicationTracker
            applications={applications}
            onUpdateStatus={handleUpdateApplicationStatus}
            onAddInterview={handleAddInterview}
          />
        )}

        {activeTab === 'explore' && <DestinationGuide />}

        {(activeTab === 'console' || activeTab === 'readiness' || activeTab === 'outcomes') && (
          <CoachConsole
            profiles={profiles}
            readinessMatrix={readinessMatrix}
            outcomes={outcomes}
            onUpdateReadinessLevel={handleUpdateReadinessLevel}
            onRecordOutcome={handleRecordOutcome}
          />
        )}

        {activeTab === 'settings' && <ConsentSettings />}

        {/* Audit Trail Drawer at bottom of Pathway & Documents */}
        {(activeTab === 'pathway' || activeTab === 'documents' || activeTab === 'console') && (
          <div className="mt-8">
            <AuditTrail />
          </div>
        )}
      </main>

      {/* POPIA Consent Banner */}
      <ConsentBanner />

      {/* Open Decisions Requiring a Human Modal */}
      <OpenDecisionsModal
        isOpen={openDecisionsModalOpen}
        onClose={() => setOpenDecisionsModalOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Green Yacht Crew Solutions (Pty) Ltd · Cape Town & Durban, South Africa</p>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => setOpenDecisionsModalOpen(true)} className="hover:text-amber-300 transition">
              Human Decisions (L1-L5 / B1-B9)
            </button>
            <button onClick={() => setActiveTab('settings')} className="hover:text-emerald-300 transition">
              POPIA Privacy & Consent
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
