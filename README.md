# Claims Agent (Hackathon) — AWS Deployable + Salesforce/Agentforce Stubs

This repository gives you a **complete project folder** you can upload/deploy on AWS for your hackathon problem statement:

> Insurance claims processing is slow and manual. Build an AI-powered, conversational, form-less claims solution with automated validation, assessment, summaries, routing, and a self-service portal.

## What’s included

### 1) AWS Deployable MVP (Works end-to-end)
- **Frontend**: React (Vite) web app with:
  - Conversational **claim filing chat**
  - **Claim tracking** view (status, severity, summary, recommendation, documents)
- **Backend**: Node.js (AWS Lambda) + API Gateway + DynamoDB:
  - `POST /start` creates a claim session
  - `POST /chat` processes user messages, extracts fields, validates policy, calculates severity, generates summary & recommendation
  - `GET /claim/{claimId}` returns claim details
  - `POST /upload` uploads a document (stores in S3 + links to claim)
- **Infrastructure as Code**: AWS SAM template to deploy everything quickly.

### 2) Salesforce / Agentforce scaffolding (Optional)
A **minimal SFDX skeleton** is included under `/salesforce-stubs` to show how you’d map the same objects & services in Salesforce (Apex/LWC/Experience Cloud). Agentforce/Agent Script integration is provided as starter stubs for Agentforce-enabled orgs.

## Quick start (AWS)

### Prerequisites
- AWS account + AWS CLI configured
- Install AWS SAM CLI
- Node.js 18+

### 1. Deploy backend + infra (SAM)
```bash
cd aws/backend
sam build
sam deploy --guided
```
If you are on Windows PowerShell and `npm install` is blocked by execution policy, use `npm.cmd` instead.
You can also run the helper script from the repo root:
```powershell
pwsh .\aws\deploy.ps1
```
During guided deploy, choose:
- Stack name: `claims-agent-hackathon`
- Region: your region
- Confirm changesets: Yes

SAM outputs:
- `ApiUrl`
- `WebBucketName`

### 2. Seed sample policies (optional but recommended)
```bash
cd aws/backend
node scripts/seedPolicies.js
```

### 3. Run frontend locally
```bash
cd aws/frontend
npm install
cp .env.example .env
# set VITE_API_URL from SAM output ApiUrl
npm run dev
```

### 4. Host frontend on S3 (static website)
```bash
cd aws/frontend
npm install
npm run build
aws s3 sync dist s3://<WebBucketName> --delete
```

## API endpoints
- `POST /start` → returns `claimId`
- `POST /chat` → send `{ "claimId": "...", "message": "..." }` and get `{ "status": "...", "severity": 0..100, "summary": "...", "recommendation": "...", "nextQuestion": "..." }`
- `GET /claim/{claimId}`
- `POST /upload` → `{ "claimId": "...", "fileName": "...", "base64": "..." }`

## Notes on AI
- By default, AI is **rule-based** to keep the MVP self-contained.
- Optional: plug in **Amazon Bedrock** by setting env vars (see `aws/backend/src/ai/bedrock.js`).

## Mapping to Salesforce/Agentforce
If you do get an Agentforce-enabled org, the **Agent Script hybrid reasoning** approach is ideal: deterministic if/else + action chaining + variables.
See `salesforce-stubs/README.md` for how the AWS endpoints map to Apex/Flows and Experience Cloud.

---
Generated: 2026-05-16T05:23:10.075005
