import { rulesSummarize } from './rules.js';
import { bedrockSummarize } from './bedrock.js';

export async function summarizeClaim(input) {
  const provider = (process.env.AI_PROVIDER || 'rules').toLowerCase();
  if (provider === 'bedrock') return await bedrockSummarize(input);
  return rulesSummarize(input);
}
