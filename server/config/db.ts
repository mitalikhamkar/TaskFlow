//db.ts
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

export let isMongoConnected = false;

export const connectDB = async (): Promise<void> => {
  try {
    const connString = process.env.MONGODB_URI || 'mongodb+srv://mitalikhamkar50_db_user:I9gAkxUmf6YC2rl7@cluster0.ywa8uwr.mongodb.net/taskflow?retryWrites=true&w=majority';
    
    console.log('Connecting to MongoDB Atlas...');
    // Connect to MongoDB using Mongoose, with 5 second timeout to prevent startup hangs
    const conn = await mongoose.connect(connString, {
      dbName: 'taskflow',
      serverSelectionTimeoutMS: 5000,
    });
    isMongoConnected = true;
    console.log(`\x1b[32m✔ MongoDB connected successfully: ${conn.connection.host}\x1b[0m`);

    // First-time database cleanup to start with an empty database
    const markerFile = path.join(process.cwd(), '.db_cleaned');
    if (!fs.existsSync(markerFile)) {
      console.log('Performing database cleanup (removing sample/fake data)...');
      try {
        const db = conn.connection.db!;

const collections = await db.listCollections().toArray();
        const names = collections.map(c => c.name);
        
        if (names.includes('users')) {
          await db.collection('users').deleteMany({});
        }
        if (names.includes('tasks')) {
          await db.collection('tasks').deleteMany({});
        }
        if (names.includes('activities')) {
          await db.collection('activities').deleteMany({});
        }
        
        fs.writeFileSync(markerFile, 'true');
        console.log('✔ Database successfully cleared of all prior/sample/demo data.');
      } catch (cleanError: any) {
        console.error('⚠ Failed to clear database collections:', cleanError.message);
      }
    }
  } catch (error: any) {
    isMongoConnected = false;
    console.error(`\x1b[31m✖ MongoDB Connection failed: ${error.message}\x1b[0m`);
    console.warn(`\x1b[33m⚠ Falling back to a robust in-memory data store for this session.\x1b[0m`);
    console.warn(`\x1b[33m⚠ If you want to use your real MongoDB Atlas cluster, make sure 0.0.0.0/0 is whitelisted in Atlas Network Security!\x1b[0m`);
  }
};
