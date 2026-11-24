const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });


const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');

const app = express();
const PORT = 5001;


app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

async function startServer() {
  const atlasUri = process.env.MONGODB_URI;
  const localUri =
    process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/notesdb';

  if (atlasUri) {
    try {
      await mongoose.connect(atlasUri);
      console.log('Connected to MongoDB Atlas');
    } catch (err) {
      console.error(
        'MongoDB Atlas connection failed; trying local MongoDB:',
        err.message
      );
    }
  } else {
    console.warn('MONGODB_URI is not set; trying local MongoDB.');
  }

  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(localUri);
    console.log('Connected to local MongoDB (notesdb)');
  }

  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exitCode = 1;
});
