const { spawn } = require("child_process");
const net = require("net");
const os = require("os");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const FRONTEND_DIR = path.join(ROOT, "frontend");
const NPM = process.platform === "win32" ? "npm.cmd" : "npm";

const isPortFree = (port) =>
  new Promise((resolve) => {
    const tester = net
      .createServer()
      .once("error", () => resolve(false))
      .once("listening", () => tester.close(() => resolve(true)))
      .listen(port, "0.0.0.0");
  });

const isPrivateAddress = (address) => {
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return false;
  if (parts[0] === 10) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  return false;
};

// Virtual adapters (VMware, VirtualBox, Hyper-V) answer on private ranges too,
// but they are not the network peers can reach.
const isVirtualAdapter = (name) =>
  /vmware|virtualbox|vethernet|hyper-v|loopback|tunnel|^tap|bluetooth/i.test(name);

const getLanAddresses = () => {
  const found = [];
  const interfaces = os.networkInterfaces();
  for (const [name, entries] of Object.entries(interfaces)) {
    if (!entries || isVirtualAdapter(name)) continue;
    for (const entry of entries) {
      const { address, family, internal } = entry;
      if (internal || family !== "IPv4") continue;
      if (!isPrivateAddress(address)) continue;
      found.push({ name, address });
    }
  }
  return found;
};

const pickPort = async (preferred) => {
  for (let port = preferred; port < preferred + 20; port += 1) {
    if (await isPortFree(port)) return port;
  }
  throw new Error(`No free port found near ${preferred}`);
};

const prefixStream = (stream, name) => {
  const write = (chunk) => {
    String(chunk)
      .split(/\r?\n/)
      .filter((line) => line.length > 0)
      .forEach((line) => {
        process.stdout.write(`[${name}] ${line}\n`);
      });
  };
  stream.on("data", write);
};

const start = (name, command, args, cwd, extraEnv, useShell = false) => {
  console.log(`[${name}] starting...`);
  const child = spawn(command, args, {
    cwd,
    env: { ...process.env, ...extraEnv },
    stdio: ["inherit", "pipe", "pipe"],
    shell: useShell && process.platform === "win32",
  });
  prefixStream(child.stdout, name);
  prefixStream(child.stderr, name);
  return child;
};

const children = [];
let shuttingDown = false;

// A plain child.kill() only reaches the direct child. On Windows the frontend
// and backend both spawn grandchildren, so the whole tree has to be taken down
// or the servers survive and hold their ports after Ctrl+C.
const killTree = (child) => {
  if (!child || child.killed) return;
  if (process.platform === "win32" && child.pid) {
    spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
      stdio: "ignore",
    });
  } else {
    child.kill("SIGTERM");
  }
};

const shutdown = (code) => {
  if (shuttingDown) return;
  shuttingDown = true;
  children.forEach(killTree);
  process.exit(code);
};

process.on("exit", () => children.forEach(killTree));

const main = async () => {
  const backendPort = await pickPort(Number(process.env.BACKEND_PORT || 8000));
  const frontendPort = await pickPort(Number(process.env.FRONTEND_PORT || 3000));
  const localUrl = `http://localhost:${backendPort}`;

  const lanAddresses = getLanAddresses();
  const fallbackUrl = lanAddresses.length
    ? `http://${lanAddresses[0].address}:${backendPort}`
    : localUrl;
  const backendUrl = process.env.BACKEND_URL_OVERRIDE || fallbackUrl;

  const backend = start(
    "backend",
    process.execPath,
    [path.join(ROOT, "backend", "start.js")],
    ROOT,
    { BACKEND_PORT: String(backendPort) }
  );
  children.push(backend);

  const frontend = start(
    "frontend",
    NPM,
    ["start"],
    FRONTEND_DIR,
    {
      PORT: String(frontendPort),
      HOST: "0.0.0.0",
      BROWSER: process.env.BROWSER || "none",
      REACT_APP_BACKEND_URL: backendUrl,
    },
    true
  );
  children.push(frontend);

  backend.on("exit", (code) => {
    console.log(`[backend] exited with code ${code}`);
    shutdown(code || 0);
  });

  frontend.on("exit", (code) => {
    console.log(`[frontend] exited with code ${code}`);
    shutdown(code || 0);
  });

  process.on("SIGINT", () => shutdown(0));
  process.on("SIGTERM", () => shutdown(0));

  console.log(`\n  on this machine:  http://localhost:${frontendPort}`);
  lanAddresses.forEach(({ name, address }) => {
    console.log(`  on ${name}:  http://${address}:${frontendPort}`);
  });
  console.log(`  api:              ${backendUrl}`);
  console.log("  seeded login:     any seeded username, password C1sc0123\n");
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
