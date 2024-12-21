import mongoose from 'mongoose';

mongoose.Promise = global.Promise;

class Connection {
  constructor(testUri) {
    this.mongoUri = testUri || 'mongodb://localhost:27017/test_db'; // Default to local test DB if no URI provided
    this.connection = null;
  }

  async connect() {
    try {
      await mongoose.connect(this.mongoUri);
      this.connection = mongoose.connection;
    } catch (err) {
      console.error('Error connecting to MongoDB:', err);
      throw err;
    }
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect();
    }
  }

  async cleanup() {
    if (!this.connection) {
      throw new Error('No database connection to clean up');
    }

    const models = Object.keys(this.connection.models);
    const promises = models.map((model) =>
      this.connection.models[model].deleteMany({})
    );

    await Promise.all(promises);
  }
}

export default Connection;
