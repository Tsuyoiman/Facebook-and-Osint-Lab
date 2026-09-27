const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const { spawn } = require("child_process");
const path = require("path");

const BACKEND_DIR = __dirname;

(async () => {
  let dbUrl = process.env.DATABASE_URL;
  try {
    const mongod = await MongoMemoryServer.create({ instance: { port: 27017 } });
    dbUrl = mongod.getUri();
    console.log("MongoDB started at:", dbUrl);
  } catch (e) {
    console.log("Using existing MongoDB at:", dbUrl);
  }

  // Run seed script
  console.log("Seeding database...");
  const seed = spawn("node", [path.join(BACKEND_DIR, "seed", "simulation.js")], {
    cwd: BACKEND_DIR,
    env: { ...process.env, DATABASE_URL: dbUrl },
    stdio: "inherit",
  });
  seed.on("close", (code) => {
    console.log(`Seed completed with code ${code}`);
    // Start server after seed
    const server = spawn("node", [path.join(BACKEND_DIR, "server.js")], {
      cwd: BACKEND_DIR,
      env: { ...process.env, DATABASE_URL: dbUrl },
      stdio: "inherit",
    });
  });
})();