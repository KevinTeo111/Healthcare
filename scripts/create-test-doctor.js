require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function createTestDoctor() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB successfully');

    const db = client.db('prescriptionApp');
    console.log('Using database:', 'prescriptionApp');
    
    const collection = db.collection('users');

    // First check if user exists
    const existingUser = await collection.findOne({
      email: 'harshshah1094@gmail.com',
      role: 'doctor'
    });

    console.log('Existing user check:', {
      exists: !!existingUser,
      email: existingUser?.email,
      role: existingUser?.role
    });

    // Hash the password
    const password = 'test123';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    const testDoctor = {
      email: 'harshshah1094@gmail.com',
      password: hashedPassword,
      role: 'doctor',
      firstName: 'Harsh',
      lastName: 'Shah',
      fullName: 'Harsh Shah',
      createdAt: new Date()
    };

    // Use upsert to either create or update the user
    const result = await collection.updateOne(
      { email: testDoctor.email, role: 'doctor' },
      { $set: testDoctor },
      { upsert: true }
    );

    console.log('Update result:', {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount
    });

    // Verify the user exists and password is correct
    const verifyUser = await collection.findOne({
      email: testDoctor.email,
      role: 'doctor'
    });

    if (verifyUser) {
      console.log('User verification:', {
        exists: true,
        email: verifyUser.email,
        role: verifyUser.role,
        hasPassword: !!verifyUser.password,
        passwordStartsWith: verifyUser.password.substring(0, 5)
      });

      // Test password verification
      const isPasswordValid = await bcrypt.compare(password, verifyUser.password);
      console.log('Password verification:', {
        isValid: isPasswordValid
      });
    } else {
      console.log('Failed to verify user in database');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

createTestDoctor();
