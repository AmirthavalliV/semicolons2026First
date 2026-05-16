import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({});

export async function bedrockSummarize({ claim }) {
  const modelId = process.env.BEDROCK_MODEL_ID;
  if (!modelId) {
    const desc = (claim.description || '').trim();
    return {
      summary: `Claim for policy ${claim.policyNumber || 'N/A'} (${claim.claimType || 'Unknown type'}). Details: ${desc.slice(0, 220)}…`,
      recommendation: 'Configure BEDROCK_MODEL_ID to enable AI summaries.'
    };
  }

  const prompt = `Summarize the insurance claim and provide recommendation.

Claim JSON:
${JSON.stringify(claim, null, 2)}`;
  const body = JSON.stringify({ inputText: prompt });

  const resp = await client.send(new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body
  }));

  const text = new TextDecoder().decode(resp.body);
  return {
    summary: text,
    recommendation: 'Review model output; ensure compliance & explainability.'
  };
}
