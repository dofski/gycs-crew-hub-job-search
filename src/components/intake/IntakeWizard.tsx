/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Compass,
  Ship,
  Sparkles,
  Wallet,
  Clock,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  XCircle
} from 'lucide-react';
import type { Department } from '../../lib/constants.ts';
import { useFeatureFlags } from '../../lib/feature-flags.ts';

export interface IntakeAssessmentData {
  motivation: string;
  department: Department;
  previousExperience: string[];
  swimmingConfidence: 'beginner' | 'competent' | 'strong_surfer';
  tattoosVisible: boolean;
  smoker: boolean;
  runwayMonths: number;
  runwayZar: number;
  availableDate: string;
  hasPassport: boolean;
  passportExpiryYear: number;
  medicalConditionsAcknowledged: boolean;
  expectations: {
    acknowledgesNoGuaranteedPlacement: boolean;
    readyFor8WeekLiveCoaching: boolean;
    understandsDockwalkingHardship: boolean;
  };
}

interface IntakeWizardProps {
  onComplete: (data: IntakeAssessmentData) => void;
  initialData?: Partial<IntakeAssessmentData>;
}

export const IntakeWizard: React.FC<IntakeWizardProps> = ({ onComplete, initialData }) => {
  const { flags } = useFeatureFlags();
  const [step, setStep] = useState<number>(1);

  const [formData, setFormData] = useState<IntakeAssessmentData>({
    motivation: initialData?.motivation || 'Looking to transition my hospitality and coastal sports background into an international yachting career with clear professional supervision.',
    department: initialData?.department || 'deck',
    previousExperience: initialData?.previousExperience || ['Hospitality', 'Watersports', 'Lifesaving'],
    swimmingConfidence: initialData?.swimmingConfidence || 'strong_surfer',
    tattoosVisible: initialData?.tattoosVisible || false,
    smoker: initialData?.smoker || false,
    runwayMonths: initialData?.runwayMonths || 5,
    runwayZar: initialData?.runwayZar || 85000,
    availableDate: initialData?.availableDate || '2027-02-01',
    hasPassport: initialData?.hasPassport !== undefined ? initialData.hasPassport : true,
    passportExpiryYear: initialData?.passportExpiryYear || 2028,
    medicalConditionsAcknowledged: initialData?.medicalConditionsAcknowledged || true,
    expectations: {
      acknowledgesNoGuaranteedPlacement: true,
      readyFor8WeekLiveCoaching: true,
      understandsDockwalkingHardship: true,
    },
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const toggleExperience = (item: string) => {
    if (formData.previousExperience.includes(item)) {
      setFormData({
        ...formData,
        previousExperience: formData.previousExperience.filter((x) => x !== item),
      });
    } else {
      setFormData({
        ...formData,
        previousExperience: [...formData.previousExperience, item],
      });
    }
  };

  const handleNext = () => {
    setValidationError(null);
    if (step === 1 && !formData.motivation.trim()) {
      setValidationError('Please share your motivation and current background.');
      return;
    }
    if (step === 2) {
      if ((formData.department === 'engineering' && !flags.engineering_department) ||
          (formData.department === 'galley' && !flags.galley_department)) {
        setValidationError('Specialist coaching for this department is currently paused. Please choose Deck or Interior for the pilot cohort.');
        return;
      }
    }
    if (step === 4 && formData.runwayMonths < 2) {
      setValidationError('Superyacht search in the Mediterranean or Caribbean requires at least 2-3 months of realistic financial runway.');
      return;
    }
    if (step === 6) {
      if (!formData.expectations.acknowledgesNoGuaranteedPlacement) {
        setValidationError('You must acknowledge that GYCS provides career coaching and readiness review, not a guaranteed employment outcome.');
        return;
      }
      onComplete(formData);
      return;
    }
    setStep(step + 1);
  };

  return (
    <div className="max-w-3xl mx-auto py-4">
      {/* Step Indicators */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Intake Assessment: Step {step} of 6
          </span>
          <span className="text-xs text-slate-400">
            {step === 1 && 'Motivation & Fit'}
            {step === 2 && 'Department Alignment'}
            {step === 3 && 'Skills & Experience'}
            {step === 4 && 'Financial Runway'}
            {step === 5 && 'Travel & Medical Readiness'}
            {step === 6 && 'Expectations & Guardrails'}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </div>

      {validationError && (
        <div className="mb-4 p-3 bg-rose-950/50 border border-rose-500/50 rounded-lg text-xs text-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{validationError}</span>
        </div>
      )}

      {/* STEP 1: MOTIVATION */}
      {step === 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-3">
              <Compass className="w-3.5 h-3.5" />
              <span>Step 1: Your Yacht Career Goal</span>
            </div>
            <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">
              Why do you want to join the superyacht industry?
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Be authentic. We use this to evaluate whether your expectations align with real onboard working conditions.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Tell us about your background, goals, and what sparked your interest:
            </label>
            <textarea
              rows={4}
              value={formData.motivation}
              onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder:text-slate-600"
              placeholder="e.g. Grew up sailing in Durban, worked 2 years in high-end restaurant service, want to enter deck or interior under experienced coaching..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Swimming & Water Confidence
              </label>
              <select
                value={formData.swimmingConfidence}
                onChange={(e) => setFormData({ ...formData, swimmingConfidence: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="strong_surfer">Strong Swimmer / Surfer / Diver</option>
                <option value="competent">Competent Swimmer (Comfortable in open water)</option>
                <option value="beginner">Basic Swimmer (Needs ocean confidence building)</option>
              </select>
            </div>

            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
              <span className="block text-xs font-semibold text-slate-300">
                Physical Attributes & Hiring Preferences
              </span>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Visible Tattoos (Hands/Neck/Face):</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tattoosVisible: !formData.tattoosVisible })}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                    formData.tattoosVisible ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {formData.tattoosVisible ? 'Yes (Visible)' : 'No / Concealable'}
                </button>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Tobacco Smoker:</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, smoker: !formData.smoker })}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                    formData.smoker ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {formData.smoker ? 'Yes' : 'Strict Non-Smoker'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: DEPARTMENT FIT */}
      {step === 2 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-3">
              <Ship className="w-3.5 h-3.5" />
              <span>Step 2: Department Pathway</span>
            </div>
            <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">
              Which department pathway suits your skillset?
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              GYCS is currently coaching Deck and Interior tracks. Engineering and Galley tracks require specialist certified coaches and are temporarily gated.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Deck Card */}
            <div
              onClick={() => setFormData({ ...formData, department: 'deck' })}
              className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                formData.department === 'deck'
                  ? 'bg-emerald-950/30 border-emerald-500 shadow-md shadow-emerald-950/50'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-bold text-white">Deck Department</span>
                {formData.department === 'deck' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              </div>
              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                Exterior maintenance, tender operations, mooring line handling, washdowns, watchkeeping, watersports setup.
              </p>
              <div className="text-[11px] text-emerald-300/90 font-medium">
                Target Role: Junior Deckhand / Tender Driver
              </div>
            </div>

            {/* Interior Card */}
            <div
              onClick={() => setFormData({ ...formData, department: 'interior' })}
              className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                formData.department === 'interior'
                  ? 'bg-emerald-950/30 border-emerald-500 shadow-md shadow-emerald-950/50'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-bold text-white">Interior Department</span>
                {formData.department === 'interior' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              </div>
              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                High-end guest service, housekeeping, laundry management, mixology, table styling, food safety hygiene.
              </p>
              <div className="text-[11px] text-emerald-300/90 font-medium">
                Target Role: Junior Steward / Stewardess
              </div>
            </div>

            {/* Engineering Card (Disabled / Feature Flagged) */}
            <div className="p-5 rounded-xl border border-slate-800/80 bg-slate-950/30 opacity-60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-400">Engineering</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  Specialist Pending
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Requires AEC 1 & 2 plus certified marine engineering mentor. Gated until coach is available.
              </p>
            </div>

            {/* Galley Card (Disabled / Feature Flagged) */}
            <div className="p-5 rounded-xl border border-slate-800/80 bg-slate-950/30 opacity-60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-400">Galley / Chef</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  Specialist Pending
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Culinary diploma & yacht chef coach required. Gated until specialist is onboard.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: EXPERIENCE */}
      {step === 3 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step 3: Transferable Skills</span>
            </div>
            <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">
              What existing experience do you bring?
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select all skills you have real experience with. In the GYCS CV Studio, every item will be categorized as <span className="text-emerald-400 font-mono">claimed</span>, <span className="text-sky-400 font-mono">uploaded</span>, or <span className="text-purple-400 font-mono">verified</span>.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              'Hospitality / Bar / Waitron',
              'Hotel Housekeeping',
              'Watersports / Wakeboarding',
              'Surf Lifesaving / Rescue',
              'Carpentry / Woodworking',
              'Painting / Varnish',
              'Basic Electrical / Mechanical',
              'Scuba Diving (PADI/SSI)',
              'Fitness Training / Yoga',
              'Barista / Wine Knowledge',
              'Detailing / Valeting',
              'Small Boat Handling',
            ].map((skill) => {
              const selected = formData.previousExperience.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleExperience(skill)}
                  className={`p-3 rounded-xl border text-left text-xs font-medium transition ${
                    selected
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-200 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{skill}</span>
                    {selected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 4: FINANCIAL RUNWAY */}
      {step === 4 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-3">
              <Wallet className="w-3.5 h-3.5" />
              <span>Step 4: Financial Runway Assessment</span>
            </div>
            <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">
              Do you have enough savings to search abroad safely?
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Never gamble your last Rand on a one-way flight. A realistic Antibes or Palma dockwalking stay costs €1,200–€1,800/month for shared crew house accommodation and groceries.
            </p>
          </div>

          <div className="space-y-6 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="font-semibold text-slate-300">Living Runway Abroad:</span>
                <span className="font-bold text-emerald-400">{formData.runwayMonths} Months</span>
              </div>
              <input
                type="range"
                min={1}
                max={12}
                value={formData.runwayMonths}
                onChange={(e) => setFormData({ ...formData, runwayMonths: Number(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>1 month (High risk)</span>
                <span>3-4 months (Recommended minimum)</span>
                <span>6+ months (Secure)</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Total Accessible Emergency & Training Runway (ZAR):
              </label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">R</span>
                <input
                  type="number"
                  step={5000}
                  value={formData.runwayZar}
                  onChange={(e) => setFormData({ ...formData, runwayZar: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Approx. €{Math.round(formData.runwayZar / 20).toLocaleString()} at current exchange rates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: TRAVEL & MEDICAL READINESS */}
      {step === 5 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-3">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Step 5: Travel Documents & Seafarer Medical</span>
            </div>
            <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">
              Statutory Prerequisites & Health Guidance
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              GYCS does not make medical diagnoses or provide legal visa services. We guide you to accredited providers.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start justify-between gap-4">
              <div>
                <span className="font-semibold text-xs text-slate-200 block mb-1">
                  Valid South African Biometric Passport
                </span>
                <p className="text-[11px] text-slate-400">
                  Must have at least 2 blank visa pages and 6+ months validity beyond your intended return date.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, hasPassport: !formData.hasPassport })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition ${
                  formData.hasPassport
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {formData.hasPassport ? 'Passport Ready' : 'Need to Apply / Renew'}
              </button>
            </div>

            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
              <span className="font-semibold text-xs text-slate-200 block">
                Seafarer Medical Next Step (ENG1 / SAMSA Equivalent)
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                All seafarers require an unrestricted physical and colour-vision fitness examination. In South Africa, UK MCA-approved doctors operate in Cape Town Foreshore and Durban. South African SAMSA-accredited medicals are also accepted by certain flag states.
              </p>
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  Consult a certified maritime doctor before booking expensive yacht courses. Never assume passing without taking the test.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 6: EXPECTATIONS & GUARDRAILS */}
      {step === 6 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold mb-3">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Step 6: Non-Negotiable Candidate Agreement</span>
            </div>
            <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">
              Our 3 Commitments to You
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              GYCS operates under strict ethical standards. Please review and confirm the 3 distinct pillars:
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-slate-200 block mb-0.5">1. Delivery Promise</span>
                  <p className="text-slate-400">
                    We deliver the 8-week structured group coaching curriculum, weekly live sessions with Chad de Wet, assignment critique, and CV studio tools.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-slate-200 block mb-0.5">2. Documented Readiness Review</span>
                  <p className="text-slate-400">
                    A coach conducts an evidence-based audit of your certificates, practical seamanship, and profile across 7 dimensions before search. (Not a government license).
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-slate-200 block mb-0.5">3. 90-Day Employment Support</span>
                  <p className="text-slate-400">
                    Continuous dockwalking strategy, interview debriefs, and direct partner opportunity referrals during your active search window.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Explicit Guardrail Checkbox */}
          <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.expectations.acknowledgesNoGuaranteedPlacement}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    expectations: {
                      ...formData.expectations,
                      acknowledgesNoGuaranteedPlacement: e.target.checked,
                    },
                  })
                }
                className="mt-0.5 w-4 h-4 rounded text-emerald-500 accent-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-xs text-slate-200 leading-relaxed font-medium">
                I understand that GYCS provides professional coaching and readiness reviews, not an employment guarantee. Hiring decisions rest solely with yacht captains and management companies.
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="mt-6 flex items-center justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        ) : <div />}

        <button
          type="button"
          onClick={handleNext}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition"
        >
          {step === 6 ? 'Submit for Coach Review' : 'Next Step'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
