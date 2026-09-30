import mongoose from "mongoose";
import dns from "node:dns";

// Configure reliable DNS servers to fix Windows node querySrv ECONNREFUSED/ETIMEOUT issues
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch (err) {
  console.warn("Notice: Could not override default DNS servers:", err.message);
}

const FALLBACK_MONGO_URL = "mongodb://skumar21082001:Skumar121252@ac-zufo2jy-shard-00-00.bakfv7w.mongodb.net:27017,ac-zufo2jy-shard-00-01.bakfv7w.mongodb.net:27017,ac-zufo2jy-shard-00-02.bakfv7w.mongodb.net:27017/AIInterview?ssl=true&replicaSet=atlas-d3we6b-shard-0&authSource=admin";

const connectDb = async () => {
  const primaryUrl = process.env.MONGO_URL;

  const options = {
    dbName: "AIInterview",
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 45000,
  };

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(primaryUrl, options);
    console.log("Connected to MongoDB via Primary SRV");
  } catch (error) {
    console.warn(`Primary MongoDB connection failed (${error.code || error.message}). Attempting Direct Seed Fallback...`);
    try {
      await mongoose.connect(FALLBACK_MONGO_URL, options);
      console.log("Connected to MongoDB via Direct ReplicaSet Seed");
    } catch (fallbackError) {
      console.error("Critical Error: Unable to connect to MongoDB cluster:", fallbackError.message);
    }
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB connection lost. Reconnecting...");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected successfully");
});

export default connectDb;