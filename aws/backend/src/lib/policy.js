import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, POLICIES_TABLE } from './dynamo.js';

export async function validatePolicy(policyNumber) {
  if (!policyNumber) return { isValid: false, reason: 'Missing policy number' };

  const resp = await ddb.send(new GetCommand({
    TableName: POLICIES_TABLE,
    Key: { policyNumber }
  }));

  if (!resp.Item) return { isValid: false, reason: 'Policy not found' };

  const p = resp.Item;
  if (p.status !== 'Active') return { isValid: false, reason: 'Policy is not active' };

  const today = new Date().toISOString().slice(0, 10);
  if (p.coverageStart && today < p.coverageStart) return { isValid: false, reason: 'Coverage not started yet' };
  if (p.coverageEnd && today > p.coverageEnd) return { isValid: false, reason: 'Coverage expired' };

  return { isValid: true, reason: 'OK', policy: p };
}
