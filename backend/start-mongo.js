const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

(async () => {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  console.log("MongoDB started at:", uri);
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
  // Keep the process running
  process.on("SIGINT", async () => {
    await mongoose.disconnect();
    await mongod.stop();
    process.exit(0);
  });
})();