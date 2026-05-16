export function rulesSummarize({ claim }) {
  const desc = (claim.description || '').trim();
  const short = desc.length > 220 ? desc.slice(0, 220) + '…' : desc;
  const summary = `Claim for policy ${claim.policyNumber || 'N/A'} (${claim.claimType || 'Unknown type'}). Incident: ${claim.incidentDate || 'N/A'}. Details: ${short}`;

  let recommendation = 'Proceed with standard checks and update claimant with next steps.';
  if ((claim.severity || 0) >= 60) {
    recommendation = 'Route to senior adjuster for human review. Request supporting documents and confirm coverage.';
  }

  return { summary, recommendation };
}
