const mongoose = require("mongoose");

if (!process.env.MONGO_URL) {
  console.error("MONGO_URL is not defined in environment variables");
  process.exit(1);
}

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("MongoDB Connection Successful");
    }
  } catch (err) {
    console.error("MongoDB Connection Failed:", err.message);
  }
};

// Handle connection events
mongoose.connection.on("error", (err) => {
  console.error("MongoDB Connection Error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB Disconnected");
});

// Handle process termination
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB Connection Closed");
    process.exit(0);
  } catch (err) {
    console.error("Error closing MongoDB connection:", err);
    process.exit(1);
  }
});

module.exports = connectDB;
