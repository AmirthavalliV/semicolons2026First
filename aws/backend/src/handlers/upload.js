import { PutObjectCommand } from '@aws-sdk/client-s3';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, CLAIMS_TABLE } from '../lib/dynamo.js';
import { s3, DOCS_BUCKET } from '../lib/s3.js';

export async function uploadHandler(event, json) {
  const body = JSON.parse(event.body || '{}');
  const { claimId, fileName, base64 } = body;

  if (!claimId || !fileName || !base64) return json(400, { error: 'claimId, fileName, base64 are required' });

  const resp = await ddb.send(new GetCommand({ TableName: CLAIMS_TABLE, Key: { claimId } }));
  if (!resp.Item) return json(404, { error: 'Claim not found' });

  const claim = resp.Item;
  const key = `${claimId}/${Date.now()}-${sanitize(fileName)}`;
  const buf = Buffer.from(base64, 'base64');

  await s3.send(new PutObjectCommand({
    Bucket: DOCS_BUCKET,
    Key: key,
    Body: buf,
    ContentType: guessContentType(fileName)
  }));

  claim.documents = claim.documents || [];
  claim.documents.push({ fileName, s3Key: key, uploadedAt: new Date().toISOString() });
  claim.updatedAt = new Date().toISOString();

  await ddb.send(new PutCommand({ TableName: CLAIMS_TABLE, Item: claim }));

  return json(200, { ok: true, claimId, fileName });
}

function sanitize(name) {
  return String(name).replace(/[^a-zA-Z0-9._-]/g, '_');
}

function guessContentType(name) {
  const lower = name.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  return 'application/octet-stream';
}
