// Quick script to check if vectors exist in Pinecone
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pinecone.index('memories');

// Get the user ID and person ID you just deleted
const userId = process.argv[2]; // Pass as first argument
const personId = process.argv[3]; // Pass as second argument

if (!userId || !personId) {
  console.log('Usage: node check-pinecone.js <userId> <personId>');
  process.exit(1);
}

console.log(`Checking Pinecone for vectors related to person: ${personId}`);
console.log(`User ID: ${userId}`);

// You would need the memory IDs to check specific vectors
// For now, let's just check the index stats
const stats = await index.describeIndexStats();
console.log('Index stats:', JSON.stringify(stats, null, 2));
