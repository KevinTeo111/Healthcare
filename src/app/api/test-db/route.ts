import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    console.log('MONGODB_DB:', process.env.MONGODB_DB ? 'Set' : 'Not set');
    
    const { db } = await connectToDatabase();
    console.log('Successfully connected to MongoDB');
    
    // Test a simple query
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    return NextResponse.json({ 
      status: 'success',
      message: 'MongoDB connection successful',
      collections: collections.map(c => c.name)
    });
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    return NextResponse.json({ 
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 