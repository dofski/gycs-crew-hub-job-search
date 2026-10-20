/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { JourneyState, ReadinessDimension, ReadinessLevel } from './constants.ts';

/**
 * Validates whether a state transition from `fromState` to `toState` is allowed
 * according to the GYCS state machine (mirroring PostgreSQL transition_journey_state).
 */
export function isAllowedStateTransition(
  fromState: JourneyState,
  toState: JourneyState
): { allowed: boolean; reason?: string } {
  if (fromState === toState) {
    return { allowed: true };
  }

  // Coach emergency / review override
  if (fromState === 'needs_review') {
    return { allowed: true, reason: 'Coach has resolved review state and redirected pathway.' };
  }

  // Common transitions to non-linear states
  if (toState === 'needs_review') {
    return { allowed: true, reason: 'Flagged for coach review due to blockers or discrepancies.' };
  }

  switch (fromState) {
    case 'exploring':
      if (['pathway_agreed', 'paused', 'alternative_route'].includes(toState)) {
        return { allowed: true };
      }
      return { allowed: false, reason: 'Must agree on pathway with coach before preparing or training.' };

    case 'pathway_agreed':
      if (['preparing', 'paused', 'needs_review', 'alternative_route'].includes(toState)) {
        return { allowed: true };
      }
      return { allowed: false, reason: 'Must enter preparing stage next.' };

    case 'preparing':
      if (['training_complete', 'paused', 'needs_review'].includes(toState)) {
        return { allowed: true };
      }
      return { allowed: false, reason: 'Cannot skip training verification.' };

    case 'training_complete':
      if (['profile_ready', 'needs_review'].includes(toState)) {
        return { allowed: true };
      }
      return { allowed: false, reason: 'Must complete structured CV profile before search.' };

    case 'profile_ready':
      if (['search_active', 'needs_review'].includes(toState)) {
        return { allowed: true };
      }
      return { allowed: false, reason: 'Profile must be active before applications or interviews.' };

    case 'search_active':
      if (['interviewing', 'paused', 'needs_review'].includes(toState)) {
        return { allowed: true };
      }
      return { allowed: false, reason: 'Invalid transition from search active.' };

    case 'interviewing':
      if (['offer', 'search_active', 'needs_review', 'paused'].includes(toState)) {
        return { allowed: true };
      }
      return { allowed: false, reason: 'Invalid transition from interviewing.' };

    case 'offer':
      if (['employment_started', 'search_active', 'needs_review'].includes(toState)) {
        return { allowed: true };
      }
      return { allowed: false, reason: 'Must verify start before moving to employment started.' };

    case 'employment_started':
      if (['first_season_supported', 'needs_review'].includes(toState)) {
        return { allowed: true };
      }
      return { allowed: false, reason: 'Invalid transition from employment started.' };

    case 'paused':
      if (['exploring', 'pathway_agreed', 'preparing', 'search_active'].includes(toState)) {
        return { allowed: true, reason: 'Resumed from paused state.' };
      }
      return { allowed: false, reason: 'Cannot jump straight to offer or employment from paused.' };

    case 'alternative_route':
      if (['exploring', 'paused'].includes(toState)) {
        return { allowed: true, reason: 'Reopened exploration.' };
      }
      return { allowed: false, reason: 'Alternative route requires new exploration intake.' };

    default:
      return { allowed: false, reason: 'Unknown state transition.' };
  }
}

/**
 * Calculates readiness matrix level scores without ever calculating a fake single percentage.
 * Returns count of dimensions at each qualitative status.
 */
export function summarizeReadinessMatrix(dimensions: ReadinessDimension[]): Record<ReadinessLevel, number> {
  const summary: Record<ReadinessLevel, number> = {
    not_started: 0,
    in_progress: 0,
    submitted: 0,
    coach_approved: 0,
    verified: 0,
  };

  for (const dim of dimensions) {
    if (summary[dim.level] !== undefined) {
      summary[dim.level]++;
    }
  }

  return summary;
}
