require("dotenv").config();
const { MongoMemoryServer } = require("mongodb-memory-server");
const { spawn } = require("child_process");
const path = require("path");

const BACKEND_DIR = __dirname;

const startChild = (script, extraEnv) =>
  spawn(process.execPath, [path.join(BACKEND_DIR, script)], {
    cwd: BACKEND_DIR,
    env: { ...process.env, ...extraEnv },
    stdio: "inherit",
  });

(async () => {
  let dbUrl = process.env.DATABASE_URL;
  let mongod = null;

  if (dbUrl) {
    // Never log the raw connection string: it can contain a password.
    console.log("Using MongoDB from DATABASE_URL.");
  } else {
    try {
      mongod = await MongoMemoryServer.create({ instance: { port: 27017 } });
      dbUrl = mongod.getUri();
      console.log(`In-memory MongoDB started: ${dbUrl}`);
    } catch (error) {
      console.error("Could not start in-memory MongoDB:", error.message);
      console.error("Set DATABASE_URL in backend/.env to use a real MongoDB.");
      process.exit(1);
    }
  }

  const shutdown = () => {
    if (mongod) mongod.stop();
  };
  process.on("exit", shutdown);
  process.on("SIGINT", () => {
    shutdown();
    process.exit(0);
  });

  console.log("Seeding classroom simulation data...");
  const seed = startChild(path.join("seed", "simulation.js"), { DATABASE_URL: dbUrl });

  seed.on("close", (code) => {
    if (code !== 0) {
      console.error(`Seed failed with code ${code}`);
      shutdown();
      process.exit(code || 1);
    }
    console.log("Seed complete. Starting API server...");
    const server = startChild("server.js", { DATABASE_URL: dbUrl });
    server.on("close", () => {
      shutdown();
      process.exit(0);
    });
  });
})();
