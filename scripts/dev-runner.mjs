import { createServer } from "vite";
import { spawn } from "child_process";
import electron from "electron";
import path from "path";

async function start() {
  const server = await createServer({
    configFile: "vite.config.ts",
    mode: "development",
  });

  await server.listen();
  const address = server.httpServer.address();
  const port = address.port;
  console.log(`Vite server running at http://localhost:${port}`);

  process.env.ELECTRON_PORT = port;

  // Compile Electron TS
  const tsc = spawn("npx", ["tsc", "-p", "electron/tsconfig.json", "--watch"], {
    shell: true,
    stdio: "inherit",
  });

  // Wait for compilation... (simple delay for now)
  await new Promise((r) => setTimeout(r, 2000));

  let electronProcess = null;

  function startElectron() {
    if (electronProcess) {
      electronProcess.kill();
    }

    // Pass essential args to Electron to ensure it loads the right file and enables proper logging
    electronProcess = spawn(electron, [".", "--no-sandbox"], {
      stdio: "inherit",
      env: { ...process.env, NODE_ENV: "development" },
    });

    electronProcess.on("close", () => {
      process.exit();
    });
  }

  startElectron();
}

start();
