const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  console.log('Testing MongoDB Atlas connection...');
  console.log('URI:', process.env.MONGODB_URI);
  console.log('---');

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
    });
    
    console.log('Connected successfully!');
    console.log('Database:', mongoose.connection.db.databaseName);
    console.log('Host:', mongoose.connection.host);
    console.log('Port:', mongoose.connection.port);
    
    await mongoose.disconnect();
    console.log('Disconnected');
    process.exit(0);
  } catch (error) {
    console.error('Connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error name:', error.name);
    process.exit(1);
  }
};

testConnection();