import { MongoClient } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = 'mongodb+srv://hospital:Harsh1094@cluster0.rgtzqle.mongodb.net/';
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!globalThis._mongoClientPromise) {
  client = new MongoClient(uri);
  globalThis._mongoClientPromise = client.connect();
}
clientPromise = globalThis._mongoClientPromise!;

export default clientPromise;
