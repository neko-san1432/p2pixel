# Distributed Minecraft Resource-Pooled Server – System Prompt

## Goal
Design and implement a **distributed, peer-to-peer Minecraft server architecture** that utilizes the **combined computational resources of connected players** to run a single shared world, without relying on consumer cloud sync services and without a permanent master node.

The system must be:
- Fault-tolerant
- Anti-cheat resistant
- Deterministic and verifiable
- Capable of handling node joins/leaves gracefully

---

## Core Architecture

### 1. Node Types (Logical, Not Fixed)
- **Coordinator (Ephemeral)**  
  - Elected dynamically via consensus (Raft-like or Bully algorithm)
  - Manages task scheduling and verification
  - Can migrate instantly if disconnected

- **Workers**
  - Execute assigned deterministic tasks (chunk gen, entity ticks, redstone sim)
  - Contribute fixed, declared resource quotas (CPU/RAM limits)
  - Never write authoritative world state

- **Observers (Optional)**
  - Hold replicated snapshots for redundancy
  - Used for fast recovery and host migration

---

## Task Model

### Chunk-Level Parallelism
- World divided into **chunk regions**
- Tasks include:
  - Chunk generation
  - Scheduled ticks
  - Physics simulation
- Tasks are:
  - Deterministic
  - Stateless per tick
  - Verifiable via hash

### Load Assignment
- Nodes advertise:
  - CPU cores
  - RAM cap
  - Bandwidth cap
- Scheduler assigns work proportionally
- Under congestion → forced equal partitioning

---

## World Data Management

### No Live File Sync
❌ No Google Drive / Dropbox  
❌ No concurrent file writes  

### Snapshot-Based Replication
- Authority node:
  - Produces compressed snapshots
  - Streams to replicas
  - Uses checksums (SHA-256 / BLAKE3)

### Incremental Updates
- Write-Ahead Log (WAL) for:
  - Block updates
  - Entity changes
- Periodic full snapshot + WAL replay

---

## Anti-Cheat & Integrity

### Trust Model
- Clients are untrusted
- Workers are semi-trusted
- Authority verified by quorum

### Protections
- Server-side validation of:
  - Inventory changes
  - Block placement
  - Movement bounds
- Deterministic replay checks
- Random task re-execution for verification
- Majority hash consensus on results

### File Tampering Defense
- World files are read-only on workers
- All authoritative writes require:
  - Signature
  - Consensus approval

---

## Network & Packet Handling

### No Packet Flooding
- Gossip protocol for state propagation
- Vector clocks / Lamport timestamps
- Deduplication via message IDs

### Consensus
- Raft / PBFT-style agreement for:
  - Snapshot acceptance
  - Authority election
  - Rollback decisions

---

## Failure Handling

### Node Disconnect
- In-flight tasks reassigned
- No world corruption
- Performance degrades gracefully

### Authority Failure
- New authority elected
- Latest snapshot + WAL restored
- Resume within seconds

---

## Tech Stack Recommendation

### Core
- **Language:** Rust (performance + safety)
- **Networking:** QUIC (UDP-based, low latency)
- **Serialization:** Protobuf / FlatBuffers
- **Hashing:** BLAKE3

### Minecraft Integration
- Fabric / Paper fork
- Server-side mod/plugin layer
- JVM isolated from scheduler

### Storage
- Local disk + memory-mapped files
- Optional object storage for cold backups

---

## World File Source

### Initial World Options
1. Generate new world via server
2. Copy from:
   - `.minecraft/saves/<world_name>` (LOCAL CLIENT)
   - Existing server world folder

⚠️ Server must be stopped before copying

---

## Non-Goals
- No real-time file sync
- No client authority
- No permanent master server

---

## Outcome
A decentralized, scalable Minecraft server that:
- Uses player machines as a compute cluster
- Resists cheating and corruption
- Survives node churn
- Avoids third-party bottlenecks
