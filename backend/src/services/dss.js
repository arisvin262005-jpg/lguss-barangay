const { CASE_STATUS, DSS_DECISION, CERT_TYPES } = require('../config/constants');

/**
 * Rule-Based Decision Support System
 *
 * INPUT:  residentId, certType, casesInvolved (array of case records)
 * OUTPUT: { decision, reason, recommendedAction, flags, timestamp }
 *
 * RULES:
 * R1: Active KP case (status=Filed|Mediation) → Hold + supervisor approval required
 * R2: Respondent in active mediation requesting clearance → Auto-Deny
 * R3: 3+ cases in last 2 years → Flag "Repeat Involved Party" → Require supervisor
 * R4: All cases dismissed/settled → Clear to process → Approve
 * R5: No case history → Approve
 */

const twoYearsAgo = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 2);
  return d;
};

const evaluateDSS = ({ residentId, certType, residents = [], casesInvolved = [], requestedBy }) => {
  const timestamp = new Date().toISOString();
  const flags = [];
  let decision = DSS_DECISION.APPROVE;
  let reason = 'No issues found. Resident has no active or disqualifying records in any Mamburao barangay.';
  let recommendedAction = 'Proceed with certification issuance.';

  // 1. Identify the current applicant
  const applicant = residents.find(r => r.id === residentId);
  if (!applicant) return { decision: DSS_DECISION.HOLD, reason: 'Resident record not found.', flags: ['INVALID_RESIDENT'], timestamp };

  // 2. Identity Matching: Find all IDs belonging to the same person (Cross-Barangay)
  // Logic: Same First Name, Last Name, and BirthDate
  const matchingResidents = residents.filter(r => 
    r.firstName.toLowerCase() === applicant.firstName.toLowerCase() &&
    r.lastName.toLowerCase() === applicant.lastName.toLowerCase() &&
    r.birthDate === applicant.birthDate
  );
  
  const allIdentities = matchingResidents.map(r => r.id);
  const otherBrgyNames = [...new Set(matchingResidents.filter(r => r.id !== residentId).map(r => r.barangay))];

  // 3. Collect ALL cases involving any of these identities
  const residentCases = casesInvolved.filter(
    (c) => allIdentities.includes(c.complainantId) || allIdentities.includes(c.respondentId)
  );

  // Active cases check
  const activeCases = residentCases.filter(
    (c) => c.status === CASE_STATUS.FILED || c.status === CASE_STATUS.MEDIATION
  );

  // Cases in last 2 years
  const cutoff = twoYearsAgo();
  const recentCases = residentCases.filter((c) => new Date(c.filedDate) >= cutoff);

  // 4. CROSS-BARANGAY FLAG
  const externalCases = activeCases.filter(c => c.barangay !== applicant.barangay);
  if (externalCases.length > 0) {
      flags.push('EXTERNAL_RECORD_FOUND');
      const brgys = [...new Set(externalCases.map(c => c.barangay))];
      reason = `PENDING CASE DETECTED: Resident has ${externalCases.length} active case(s) in other barangays (${brgys.join(', ')}). Centralized policy blocks clearance until cleared by the originating barangay.`;
      decision = DSS_DECISION.DENY;
      recommendedAction = `Issuance BLOCKED. Applicant must settle pending obligations in Brgy ${brgys[0]} before a clearance can be issued in ${applicant.barangay}.`;
      return { decision, reason, recommendedAction, flags, timestamp, residentId, certType, requestedBy };
  }

  // Rule 2: Respondent in active mediation requesting Barangay Clearance → DENY
  if (certType === CERT_TYPES.CLEARANCE) {
    const respondentInMediation = residentCases.filter(
      (c) => allIdentities.includes(c.respondentId) && c.status === CASE_STATUS.MEDIATION
    );
    if (respondentInMediation.length > 0) {
      flags.push('Respondent in Active Mediation');
      decision = DSS_DECISION.DENY;
      reason = `Resident is a respondent in ${respondentInMediation.length} active mediation case(s) within the jurisdiction.`;
      recommendedAction = 'Deny issuance. Inform applicant that clearance can only be issued after case resolution.';
      return { decision, reason, recommendedAction, flags, timestamp, residentId, certType, requestedBy };
    }
  }

  // Rule 1: Active case → HOLD
  if (activeCases.length > 0) {
    flags.push('With Active Case');
    decision = DSS_DECISION.HOLD;
    reason = `Resident has ${activeCases.length} active KP case(s) currently filed or under mediation.`;
    recommendedAction = 'Place certification on hold. Require supervisor approval before processing.';
  }

  // Rule 3: 3+ cases in 2 years → Repeat Involved Party
  if (recentCases.length >= 3) {
    flags.push('Repeat Involved Party');
    if (decision === DSS_DECISION.APPROVE) {
      decision = DSS_DECISION.HOLD;
      reason = `Resident has been involved in ${recentCases.length} total case(s) across all Mamburao barangays within the last 2 years (Pattern Detection: Potential Repeat Offender).`;
      recommendedAction = 'Flag for background check. Require Barangay Secretary or Admin supervisory approval before release.';
    }
  }

  // Rule 4: All cases dismissed/settled
  const allResolved = residentCases.length > 0 && residentCases.every(
    (c) => c.status === CASE_STATUS.SETTLED || c.status === CASE_STATUS.DISMISSED
  );
  if (allResolved && decision === DSS_DECISION.APPROVE) {
    reason = 'All prior cases in the centralized database have been settled or dismissed. Resident is cleared.';
    recommendedAction = 'Proceed with certification issuance. No active concerns detected in any jurisdiction.';
  }

  return { decision, reason, recommendedAction, flags, timestamp, residentId, certType, requestedBy };
};

/**
 * Log DSS result (returns structured log entry)
 */
const buildDSSLogEntry = (evaluation, triggeredBy) => ({
  ...evaluation,
  triggeredBy,
  logged_at: new Date().toISOString(),
});

module.exports = { evaluateDSS, buildDSSLogEntry };
