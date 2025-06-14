import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

if (!process.env.MONGODB_DB) {
  throw new Error('Please add your Mongo DB name to .env.local');
}

// Remove any whitespace from the URI
const uri = process.env.MONGODB_URI.trim();
console.log('MongoDB URI format check:', {
  hasProtocol: uri.startsWith('mongodb+srv://'),
  hasUsername: uri.includes('@'),
  hasDatabase: uri.includes('/healthsync'),
  length: uri.length
});

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function connectToDatabase() {
  try {
    console.log('Attempting to connect to MongoDB...');
    const client = await clientPromise;
    console.log('MongoClient connected successfully');
    
    const db = client.db(process.env.MONGODB_DB);
    console.log('Database selected:', process.env.MONGODB_DB);
    
    // Test the connection
    console.log('Testing connection with ping...');
    await db.command({ ping: 1 });
    console.log('Ping successful');
    
    return { client, db };
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    if (error instanceof Error) {
      console.error('Connection error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        code: (error as any).code,
        codeName: (error as any).codeName
      });
    }
    throw new Error(`Failed to connect to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 