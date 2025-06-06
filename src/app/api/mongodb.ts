import { MongoClient, MongoClientOptions } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 60000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  retryReads: true,
  w: 'majority',
  wtimeoutMS: 2500,
};

let client: MongoClient | undefined;
let clientPromise: Promise<MongoClient>;

async function createClient() {
  try {
    const newClient = new MongoClient(uri, options);
    await newClient.connect();
    console.log('MongoDB client connected successfully');
    return newClient;
  } catch (error) {
    console.error('Failed to create MongoDB client:', error);
    throw error;
  }
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = createClient();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = createClient();
}

export async function connectToDatabase() {
  try {
    const client = await clientPromise;
    const db = client.db('prescriptionApp');
    
    // Test the connection
    await db.command({ ping: 1 });
    console.log('Successfully connected to MongoDB.');
    
    return { client, db };
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    // Attempt to reconnect
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        console.error('Error closing MongoDB client:', closeError);
      }
    }
    // Create a new client and try again
    client = new MongoClient(uri, options);
    clientPromise = createClient();
    const newClient = await clientPromise;
    const db = newClient.db('prescriptionApp');
    return { client: newClient, db };
  }
}

// Add connection error handling
clientPromise.catch(async (err) => {
  console.error('MongoDB connection error:', err);
  if (client) {
    try {
      await client.close();
    } catch (closeError) {
      console.error('Error closing MongoDB client:', closeError);
    }
  }
  // Attempt to reconnect
  client = new MongoClient(uri, options);
  clientPromise = createClient();
});

export default clientPromise;
