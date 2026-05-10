const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let memoryServer = null;

const connectDB = async () => {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB connected");
      return;
    }

    memoryServer = await MongoMemoryServer.create({
      instance: { dbName: "devsync" },
    });
    await mongoose.connect(memoryServer.getUri());
    console.log("MongoDB memory server started");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
