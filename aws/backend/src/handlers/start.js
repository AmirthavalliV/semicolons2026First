import { v4 as uuidv4 } from 'uuid';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, CLAIMS_TABLE } from '../lib/dynamo.js';

export async function startHandler(event, json) {
  const claimId = `CLM-${Date.now()}-${uuidv4().slice(0, 8)}`;
  const now = new Date().toISOString();

  const item = {
    claimId,
    status: 'Draft',
    createdAt: now,
    updatedAt: now,
    messages: [],
    documents: []
  };

  await ddb.send(new PutCommand({ TableName: CLAIMS_TABLE, Item: item }));

  return json(200, {
    claimId,
    message: 'Hi! Describe what happened. You can include policy number like POL-12345 and date YYYY-MM-DD.'
  });
}
