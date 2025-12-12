const mongoose = require('mongoose');
const config = require('./config');

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      // Set mongoose options for better performance and security
      const options = {
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      };

      this.connection = await mongoose.connect(config.MONGODB_URI, options);
      
      console.log(`✅ MongoDB connected successfully to: ${this.connection.connection.host}`);
      
      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected successfully');
      });
      
      // Handle process termination
      process.on('SIGINT', this.close.bind(this));
      process.on('SIGTERM', this.close.bind(this));
      
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      console.log('\n🔧 Setup Instructions:');
      console.log('1. Install MongoDB: https://www.mongodb.com/try/download/community');
      console.log('2. Start MongoDB service:');
      console.log('   - Windows: net start MongoDB');
      console.log('   - macOS: brew services start mongodb/brew/mongodb-community');
      console.log('   - Linux: sudo systemctl start mongod');
      console.log('3. Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas');
      console.log('4. Update MONGODB_URI in .env file with your connection string\n');
      process.exit(1);
    }
  }

  async close() {
    try {
      await mongoose.connection.close();
      console.log('📝 MongoDB connection closed successfully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error closing MongoDB connection:', error.message);
      process.exit(1);
    }
  }

  getConnection() {
    return this.connection;
  }

  isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

module.exports = new Database();