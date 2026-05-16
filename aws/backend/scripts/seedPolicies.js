import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

// NOTE: When running locally, export POLICIES_TABLE to the physical table name created by SAM.
const table = process.env.POLICIES_TABLE || 'Policies';

const policies = [
  { policyNumber: 'POL-12345', status: 'Active', coverageStart: '2025-01-01', coverageEnd: '2027-12-31', plan: 'Gold' },
  { policyNumber: 'POL-22222', status: 'Active', coverageStart: '2024-06-01', coverageEnd: '2026-06-01', plan: 'Silver' },
  { policyNumber: 'POL-99999', status: 'Inactive', coverageStart: '2023-01-01', coverageEnd: '2024-01-01', plan: 'Basic' }
];

for (const p of policies) {
  await ddb.send(new PutCommand({ TableName: table, Item: p }));
  console.log('Seeded', p.policyNumber);
}

console.log('Done');
