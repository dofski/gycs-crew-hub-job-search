/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedStateTransition, summarizeReadinessMatrix } from './pathway-rules.ts';
import { validateCopy } from './guardrails.ts';
import type { ReadinessDimension } from './constants.ts';

test('isAllowedStateTransition permits legal forward journey sequence', () => {
  assert.equal(isAllowedStateTransition('exploring', 'pathway_agreed').allowed, true);
  assert.equal(isAllowedStateTransition('pathway_agreed', 'preparing').allowed, true);
  assert.equal(isAllowedStateTransition('preparing', 'training_complete').allowed, true);
  assert.equal(isAllowedStateTransition('training_complete', 'profile_ready').allowed, true);
  assert.equal(isAllowedStateTransition('profile_ready', 'search_active').allowed, true);
  assert.equal(isAllowedStateTransition('search_active', 'interviewing').allowed, true);
  assert.equal(isAllowedStateTransition('interviewing', 'offer').allowed, true);
  assert.equal(isAllowedStateTransition('offer', 'employment_started').allowed, true);
  assert.equal(isAllowedStateTransition('employment_started', 'first_season_supported').allowed, true);
});

test('isAllowedStateTransition blocks illegal skips', () => {
  // Cannot jump straight from exploring to employment or training without pathway agreed
  const res1 = isAllowedStateTransition('exploring', 'employment_started');
  assert.equal(res1.allowed, false);

  const res2 = isAllowedStateTransition('exploring', 'search_active');
  assert.equal(res2.allowed, false);

  const res3 = isAllowedStateTransition('paused', 'employment_started');
  assert.equal(res3.allowed, false);
});

test('isAllowedStateTransition allows non-linear states safely', () => {
  // Any state can trigger coach review when a blocker occurs
  assert.equal(isAllowedStateTransition('preparing', 'needs_review').allowed, true);
  assert.equal(isAllowedStateTransition('search_active', 'needs_review').allowed, true);

  // Coach can redirect from needs_review to any state
  assert.equal(isAllowedStateTransition('needs_review', 'preparing').allowed, true);
  assert.equal(isAllowedStateTransition('needs_review', 'exploring').allowed, true);

  // Pausing is always a valid safe state
  assert.equal(isAllowedStateTransition('exploring', 'paused').allowed, true);
  assert.equal(isAllowedStateTransition('preparing', 'paused').allowed, true);
});

test('validateCopy catches forbidden employment guarantee claims', () => {
  const bad1 = validateCopy('Join today for a 100% placement guarantee on Mediterranean superyachts.');
  assert.equal(bad1.isValid, false);
  assert.ok(bad1.violations.length > 0);

  const bad2 = validateCopy('Get an instant yacht job within 14 days.');
  assert.equal(bad2.isValid, false);

  const good = validateCopy('Start your yacht career with a plan—not an expensive guess. 8 weeks of live coaching.');
  assert.equal(good.isValid, true);
  assert.equal(good.violations.length, 0);
});

test('summarizeReadinessMatrix tallies qualitative dimensions without single percentage', () => {
  const dimensions: ReadinessDimension[] = [
    { key: 'training', label: 'Training', level: 'coach_approved', measuredBy: 'Certificates', sourceOfTruth: 'docs' },
    { key: 'medical', label: 'Medical', level: 'verified', measuredBy: 'ENG1', sourceOfTruth: 'docs' },
    { key: 'profile', label: 'Profile', level: 'submitted', measuredBy: 'CV', sourceOfTruth: 'cv' },
    { key: 'practical_skills', label: 'Practical', level: 'in_progress', measuredBy: 'Tasks', sourceOfTruth: 'assignments' },
    { key: 'travel_work', label: 'Travel/Work', level: 'coach_approved', measuredBy: 'Passport', sourceOfTruth: 'docs' },
    { key: 'search_prep', label: 'Search Prep', level: 'not_started', measuredBy: 'Hub check', sourceOfTruth: 'plan' },
    { key: 'employment_outcome', label: 'Outcome', level: 'not_started', measuredBy: 'Contract', sourceOfTruth: 'outcomes' },
  ];

  const summary = summarizeReadinessMatrix(dimensions);
  assert.equal(summary.coach_approved, 2);
  assert.equal(summary.verified, 1);
  assert.equal(summary.submitted, 1);
  assert.equal(summary.in_progress, 1);
  assert.equal(summary.not_started, 2);
});
