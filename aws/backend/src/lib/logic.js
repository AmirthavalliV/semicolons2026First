export function extractFields(text) {
  const t = (text || '').trim();
  const policyMatch = t.match(/POL[- ]?\d{4,}/i);
  const dateMatch = t.match(/(\d{4}-\d{2}-\d{2})/);

  let claimType;
  const lower = t.toLowerCase();
  if (lower.includes('accident')) claimType = 'Accident';
  else if (lower.includes('theft')) claimType = 'Theft';
  else if (lower.includes('fire')) claimType = 'Fire';
  else if (lower.includes('injury')) claimType = 'Injury';

  return {
    policyNumber: policyMatch ? policyMatch[0].replace(' ', '') : undefined,
    incidentDate: dateMatch ? dateMatch[1] : undefined,
    claimType: claimType || undefined,
    description: t || undefined
  };
}

export function calculateSeverity(claim) {
  let score = 10;
  const text = (claim.description || '').toLowerCase();

  if (text.includes('accident')) score += 25;
  if (text.includes('hospital')) score += 35;
  if (text.includes('fire')) score += 45;
  if (text.includes('police')) score += 10;
  if (text.includes('total loss')) score += 30;

  if (!claim.policyNumber) score += 15;
  if (!claim.incidentDate) score += 10;

  return Math.min(100, score);
}

export function nextQuestion(claim, policyValidation) {
  if (!claim.policyNumber) return 'What is your policy number (e.g., POL-12345)?';
  if (!claim.incidentDate) return 'What is the incident date (YYYY-MM-DD)?';
  if (!claim.claimType) return 'What type of claim is this (Accident/Theft/Fire/Injury)?';

  if (policyValidation && !policyValidation.isValid) {
    return `I found an issue with the policy: ${policyValidation.reason}. Please attach documents or provide more details.`;
  }

  return 'Thanks! Your claim is submitted. You can track status on the Claim Tracking page.';
}
