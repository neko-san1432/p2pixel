# P2Pixel

A decentralized, distributed system for hosting Minecraft servers. This application allows users to form a mesh network where each node contributes CPU, RAM, and storage to host different parts (Shards) of a Minecraft world.

## 🚀 Key Features

- **P2P Network**: Uses `libp2p` (TCP + Noise + Yamux) for peer discovery and secure communication without a central server.
- **Resource Contribution**: Nodes broadcast their System Specs (CPU Model, RAM) to the network.
- **Decentralized Control**: Any node can issue commands to the cluster (Permission system pending).
- **Distributed File Sync (Smart Drop)**:
  - **Global Configs**: Files in `server/global_configs` are instantly synced to all nodes (Leader-Follower model).
  - **Sharding**: Each node runs a specific shard (Directory: `server/nodes/[NodeID]`) to prevent file collisions.

## 🛠 Tech Stack

- **Electron**: For the Desktop Application shell.
- **React + Vite**: For the Dashboard UI.
- **TypeScript**: Application logic.
- **libp2p**: The networking stack (GossipSub, KadDHT).
- **Node.js**: Backend runtime.

## 📦 Installation & Usage

### Option A: Portable Standalone (Windows)

1.  Navigate to `release/win-unpacked`.
2.  Run `P2P Compute Node.exe`.
3.  No external dependencies (Java/Node.js) required for the app itself (Java is required _only_ to run the actual Minecraft Server).

### Option B: Development Mode

1.  Install Node.js (v18+).
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## 📂 File Structure

- `electron/` - Backend code (Main Process, P2P Logic, File Manager).
- `src/` - Frontend code (React Dashboard).
- `server/` - The Data Directory.
  - `global_configs/` - Drop files here to sync them to EVERYONE.
  - `nodes/` - Where the actual Minecraft Server JARs and world data live (Local to each node).
