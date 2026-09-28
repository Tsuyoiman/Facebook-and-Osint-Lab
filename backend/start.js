const dotenv = require("dotenv");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const BACKEND_DIR = __dirname;
const ROOT_DIR = path.join(BACKEND_DIR, "..");

dotenv.config({ path: path.join(BACKEND_DIR, ".env") });
if (!process.env.TOKEN_SECRET) {
  dotenv.config({ path: path.join(ROOT_DIR, "envBackend.env") });
}

if (!process.env.TOKEN_SECRET) {
  console.error(
    "Missing TOKEN_SECRET. Add it to backend/.env or the root envBackend.env file."
  );
  process.exit(1);
}

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
      // Keep the local classroom database on disk so registrations survive
      // a server restart. This is still a local MongoDB process; no external
      // service or credentials are required for classroom development.
      const dbPath = path.join(ROOT_DIR, ".data", "mongodb");
      fs.mkdirSync(dbPath, { recursive: true });
      mongod = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbPath,
          storageEngine: "wiredTiger",
        },
      });
      dbUrl = mongod.getUri();
      console.log(`Persistent local MongoDB started at: ${dbPath}`);
    } catch (error) {
      console.error("Could not start persistent local MongoDB:", error.message);
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

  const startServer = () => {
    console.log("Seed complete. Starting API server...");
    const server = startChild("server.js", { DATABASE_URL: dbUrl });
    server.on("close", () => {
      shutdown();
      process.exit(0);
    });
  };

  const startSeed = () => {
    console.log("Seeding classroom simulation data...");
    const seed = startChild(path.join("seed", "simulation.js"), {
      DATABASE_URL: dbUrl,
    });

    seed.on("close", async (code) => {
      if (code === 0) {
        startServer();
        return;
      }

      if (process.env.DATABASE_URL) {
        console.error(
          "Configured MongoDB is unavailable or seeding failed. " +
            "The server will stop instead of using a disposable fallback database."
        );
      }
      console.error(`Seed failed with code ${code}. Check DATABASE_URL and MongoDB availability.`);
      shutdown();
      process.exit(code || 1);
    });
  };

  startSeed();
})();
