import { NextResponse } from 'next/server';
import { connectToDatabase } from '../mongodb';

export async function GET() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'URI is set' : 'URI is not set');
    
    const { db } = await connectToDatabase();
    console.log('Connected to database successfully');

    // Test the connection by listing collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    // Try to count users
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log('Number of users:', userCount);

    // Fetch one user document to inspect its structure
    const sampleUser = userCount > 0 ? await usersCollection.findOne({}) : null;

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful!',
      collections: collections.map(c => c.name),
      usersCollectionExists: collections.some(c => c.name === 'users'),
      userCount: userCount,
      sampleUser: sampleUser
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 