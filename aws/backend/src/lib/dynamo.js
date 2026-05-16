import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
export const ddb = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true }
});

export const CLAIMS_TABLE = process.env.CLAIMS_TABLE;
export const POLICIES_TABLE = process.env.POLICIES_TABLE;
