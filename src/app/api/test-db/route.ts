import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
      MONGODB_DB: process.env.MONGODB_DB ? 'Set' : 'Not set',
      MONGODB_URI_LENGTH: process.env.MONGODB_URI?.length,
      MONGODB_URI_START: process.env.MONGODB_URI?.substring(0, 20) + '...',
    });
    
    const { db } = await connectToDatabase();
    console.log('Successfully connected to MongoDB');
    
    // Test a simple query
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Test users collection
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log('Number of users:', userCount);
    
    return NextResponse.json({ 
      status: 'success',
      message: 'MongoDB connection successful',
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        MONGODB_URI_SET: !!process.env.MONGODB_URI,
        MONGODB_DB_SET: !!process.env.MONGODB_DB,
      },
      database: {
        name: process.env.MONGODB_DB,
        collections: collections.map(c => c.name),
        userCount
      }
    });
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    return NextResponse.json({ 
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        MONGODB_URI_SET: !!process.env.MONGODB_URI,
        MONGODB_DB_SET: !!process.env.MONGODB_DB,
      }
    }, { status: 500 });
  }
} 