import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import os from 'os';

import { fileURLToPath } from 'url';
  
// Polyfill CustomEvent for Node environment (required by libp2p)
if (typeof CustomEvent === "undefined") {
  // @ts-ignore
  global.CustomEvent = class CustomEvent extends Event {
    detail: any;
    constructor(event: string, params: any) {
      super(event, params);
      this.detail = params.detail;
    }
  };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false 
    },
    title: "P2Pixel Node"
  });

  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    const port = process.env.ELECTRON_PORT || 1420;
    mainWindow.loadURL(`http://localhost:${port}`);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }
}

import { p2pNode } from './p2p/Network.js';

// IPC Handlers
ipcMain.handle('get_specs', async () => {
  const cpus = os.cpus();
  const ram = os.totalmem();
  return `${cpus[0].model} (${cpus.length} cores) | ${(ram / 1024 / 1024 / 1024).toFixed(1)} GB RAM`;
});

ipcMain.handle('get_p2p_status', async () => {
  return {
    peerId: p2pNode.getPeerId()
  };
});

ipcMain.handle('get_peers', async () => {
  return p2pNode.getConnectedPeers();
});

ipcMain.handle('connect_peer', async (_, address) => {
  return p2pNode.connect(address);
});

app.whenReady().then(async () => {
  createWindow();

  try {
    const id = await p2pNode.start();
    console.log(`[Main] P2Pixel Node Online: ${id}`);
  } catch (err) {
    console.error(`[Main] Failed to start P2P:`, err);
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
