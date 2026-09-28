const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const NPM = process.platform === "win32" ? "npm.cmd" : "npm";
const log = (msg) => console.log(`[setup] ${msg}`);

const run = (args, cwd, label) => {
  log(`${label}...`);
  const result = spawnSync(NPM, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    console.error(`\n[setup] FAILED: ${label}`);
    process.exit(result.status || 1);
  }
};

const ensureEnv = (dir) => {
  const envPath = path.join(dir, ".env");
  if (fs.existsSync(envPath)) {
    log(`.env already exists in ${path.basename(dir)}, leaving it untouched`);
    return;
  }
  const examplePath = path.join(dir, ".env.example");
  if (!fs.existsSync(examplePath)) return;
  fs.copyFileSync(examplePath, envPath);
  log(`created ${path.join(path.basename(dir), ".env")} from .env.example`);
};

const setEnvValue = (dir, key, value) => {
  const envPath = path.join(dir, ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  const index = lines.findIndex((l) => l.startsWith(`${key}=`));
  if (index === -1) {
    lines.push(`${key}=${value}`);
  } else if (lines[index] === `${key}=change-me-local-classroom-secret`) {
    lines[index] = `${key}=${value}`;
  }
  fs.writeFileSync(envPath, lines.join("\n"));
};

const main = () => {
  console.log("\nFacebook-and-OSINT-Lab setup\n");

  run(["install", "--no-audit", "--no-fund"], ROOT, "installing root dependencies");
  run(
    ["install", "--no-audit", "--no-fund"],
    path.join(ROOT, "backend"),
    "installing backend dependencies"
  );
  run(
    ["install", "--no-audit", "--no-fund"],
    path.join(ROOT, "frontend"),
    "installing frontend dependencies"
  );

  ensureEnv(path.join(ROOT, "backend"));
  ensureEnv(path.join(ROOT, "frontend"));

  setEnvValue(
    path.join(ROOT, "backend"),
    "TOKEN_SECRET",
    crypto.randomBytes(32).toString("hex")
  );

  log("done. Start everything with: npm start");
  console.log("");
};

main();
