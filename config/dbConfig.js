const mongoose = require("mongoose");

if (!process.env.MONGO_URL) {
  console.error("MONGO_URL is not defined in environment variables");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB Connection Successful");
  })
  .catch((err) => {
    console.error("MongoDB Connection Failed:", err.message);
    process.exit(1);
  });

const connection = mongoose.connection;

connection.on("error", (err) => {
  console.error("MongoDB Connection Error:", err.message);
});

module.exports = connection;
