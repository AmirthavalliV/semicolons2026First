# Salesforce / Agentforce Stubs (Optional)

This folder is a starter scaffold if your hackathon provides an Agentforce-enabled Salesforce org.

## What’s here
- `sfdx-project.json` so you can open this in VS Code + Salesforce extensions.
- A starter Apex controller and a simple LWC chat component that demonstrate a claim intake flow.

## Suggested next steps
- Create custom objects: `Policy__c`, `Claim__c`, `ClaimDocument__c`, `ClaimConversation__c`
- Implement Apex Actions: ValidatePolicy, CreateOrUpdateClaim, AssessSeverity, RouteClaim
- Create Experience Cloud pages: Claim Filing + Claim Tracking

## Suggested mapping (AWS MVP -> Salesforce)
- DynamoDB ClaimsTable -> `Claim__c` custom object (or Case)
- DynamoDB PoliciesTable -> `Policy__c`
- Lambda `/chat` -> Apex controller / Agentforce Action
- Frontend React -> Experience Cloud site with LWC components

## Agentforce note
Agent Script is intended for hybrid reasoning: deterministic if/else + variables + action chaining.
