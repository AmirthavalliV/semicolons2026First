import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, CLAIMS_TABLE } from '../lib/dynamo.js';
import { extractFields, calculateSeverity, nextQuestion } from '../lib/logic.js';
import { validatePolicy } from '../lib/policy.js';
import { summarizeClaim } from '../ai/index.js';

export async function chatHandler(event, json) {
  const body = JSON.parse(event.body || '{}');
  const { claimId, message } = body;

  if (!claimId || !message) return json(400, { error: 'claimId and message are required' });

  const resp = await ddb.send(new GetCommand({ TableName: CLAIMS_TABLE, Key: { claimId } }));
  if (!resp.Item) return json(404, { error: 'Claim not found' });

  const claim = resp.Item;

  claim.messages = claim.messages || [];
  claim.messages.push({ role: 'user', text: message, ts: new Date().toISOString() });

  const extracted = extractFields(message);
  claim.policyNumber = claim.policyNumber || extracted.policyNumber;
  claim.incidentDate = claim.incidentDate || extracted.incidentDate;
  claim.claimType = claim.claimType || extracted.claimType;
  claim.description = (claim.description ? claim.description + '
' : '') + (extracted.description || '');

  const policyValidation = await validatePolicy(claim.policyNumber);
  claim.policyValidation = policyValidation;

  claim.severity = calculateSeverity(claim);

  const ai = await summarizeClaim({ claim });
  claim.summary = ai.summary;
  claim.recommendation = ai.recommendation;

  const ready = Boolean(claim.policyNumber && claim.incidentDate && claim.claimType);
  if (ready) {
    claim.status = policyValidation.isValid ? 'Submitted' : 'Needs Review';
    claim.routingLane = (claim.severity >= 60) ? 'HighTouch' : 'FastLane';
  }

  const nq = nextQuestion(claim, policyValidation);
  claim.messages.push({ role: 'agent', text: nq, ts: new Date().toISOString() });

  claim.updatedAt = new Date().toISOString();

  await ddb.send(new PutCommand({ TableName: CLAIMS_TABLE, Item: claim }));

  return json(200, {
    claimId,
    status: claim.status,
    severity: claim.severity,
    summary: claim.summary,
    recommendation: claim.recommendation,
    routingLane: claim.routingLane,
    nextQuestion: nq
  });
}
