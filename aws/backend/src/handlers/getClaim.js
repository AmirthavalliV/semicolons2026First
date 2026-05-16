import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, CLAIMS_TABLE } from '../lib/dynamo.js';

export async function getClaimHandler(event, json) {
  const claimId = event.pathParameters?.claimId || (event.path || '').split('/').pop();
  if (!claimId) return json(400, { error: 'claimId is required' });

  const resp = await ddb.send(new GetCommand({ TableName: CLAIMS_TABLE, Key: { claimId } }));
  if (!resp.Item) return json(404, { error: 'Claim not found' });

  return json(200, resp.Item);
}
