import { startHandler } from './start.js';
import { chatHandler } from './chat.js';
import { getClaimHandler } from './getClaim.js';
import { uploadHandler } from './upload.js';

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
  },
  body: JSON.stringify(body)
});

export const handler = async (event) => {
  try {
    if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });

    const path = event.resource || event.path;
    if (path === '/start' && event.httpMethod === 'POST') return await startHandler(event, json);
    if (path === '/chat' && event.httpMethod === 'POST') return await chatHandler(event, json);
    if ((path === '/claim/{claimId}' || (event.path || '').startsWith('/claim/')) && event.httpMethod === 'GET') return await getClaimHandler(event, json);
    if (path === '/upload' && event.httpMethod === 'POST') return await uploadHandler(event, json);

    return json(404, { error: 'Not found', path, method: event.httpMethod });
  } catch (e) {
    console.error(e);
    return json(500, { error: 'Server error', message: e.message });
  }
};
