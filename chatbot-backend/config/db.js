const mongoose = require('mongoose');

const connectDB = async () => {
    // Ne tente pas de se connecter si on est en environnement de test
  if (process.env.NODE_ENV === 'test') {
    console.log('Environnement de test détecté : skip connexion MongoDB réelle');
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;

