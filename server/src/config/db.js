const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let memoryServer = null;

const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  maxPoolSize: 10,
  minPoolSize: 1,
};

const connectWithRetry = async (uri, retries = 3, delay = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(uri, MONGO_OPTIONS);
      console.log(`MongoDB connected (attempt ${attempt})`);
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt}/${retries} failed:`, error.message);
      if (attempt < retries) {
        console.log(`Retrying in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
};

const connectDB = async () => {
  try {
    if (process.env.MONGO_URI) {
      await connectWithRetry(process.env.MONGO_URI);
      return;
    }

    memoryServer = await MongoMemoryServer.create({
      instance: { dbName: "devsync" },
    });
    await mongoose.connect(memoryServer.getUri(), MONGO_OPTIONS);
    console.log("MongoDB memory server started");
  } catch (error) {
    console.error("MongoDB connection failed after all retries:", error.message);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected. Attempting to reconnect...");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected");
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed due to app termination");
  process.exit(0);
});

module.exports = connectDB;
