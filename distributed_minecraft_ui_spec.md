# Distributed Minecraft Server – UI & UX Specification

## Purpose
This document defines **all user interfaces** required for the distributed, resource-pooled Minecraft server system:
- Player / Node UI
- Authority / Admin UI
- Developer / Debug UI

This UI layer complements (but is separate from) the core architecture prompt.

---

## UI Layer Overview

### UI Goals
- Transparency (users see what they contribute)
- Safety (clear warnings, limits, permissions)
- Control (join/leave without corruption)
- Trust (verification & anti-cheat visibility)

---

## 1️⃣ Player / Node UI (Launcher)

### Primary Audience
- Regular players
- Resource-contributing nodes

### Core Screens

#### A. Welcome / Join Screen
- World name
- Network status
- Sync state
- Join button
- “Safe disconnect” indicator

#### B. Resource Contribution Panel
- CPU contribution (slider or fixed %)
- RAM cap (GB)
- Network bandwidth cap
- Disk I/O toggle (on/off)

⚠️ Hard limits enforced at OS + scheduler level

#### C. Node Status Dashboard
- Current role:
  - Worker
  - Coordinator (temporary)
  - Idle
- Assigned tasks (chunks / ticks)
- CPU / RAM usage
- Latency to peers

#### D. Trust & Verification
- Node trust score
- Last verification result
- Hash agreement status
- Warning flags if mismatch detected

#### E. Safe Leave
- Graceful disconnect button
- Countdown until state handoff
- Confirmation dialog

---

## 2️⃣ Authority / Admin UI

### Dynamic Role
- Only visible when node is elected coordinator

### Core Panels

#### A. Node Overview
- Active nodes list
- Resource contributions
- Health status
- Suspicion indicators

#### B. Task Scheduler View
- Chunk/task ownership
- Load distribution graph
- Bottleneck alerts

#### C. World State Controls
- Force snapshot
- Snapshot verification status
- Rollback (with quorum confirmation)

#### D. Security Panel
- Cheating alerts
- Divergent hash reports
- Manual quarantine option

---

## 3️⃣ Developer / Debug UI

### Optional (Dev Mode)

#### A. Consensus Monitor
- Election events
- Vote counts
- Term changes

#### B. Network Diagnostics
- Packet loss
- RTT heatmap
- Gossip propagation delays

#### C. Determinism Checker
- Task replay comparison
- Hash mismatch diffs
- Re-execution logs

---

## UX Safety Rules

- No hidden resource usage
- Explicit opt-in for contribution
- Clear warnings on:
  - High CPU usage
  - Authority role assumption
  - Unsafe disconnects

---

## Visual Design Guidelines

- Minimalist, dark-mode default
- Real-time charts (no heavy animations)
- Color codes:
  - Green = verified
  - Yellow = warning
  - Red = fault / quarantine

---

## Tech Stack (UI)

### Desktop App
- **Tauri**
- **Rust backend**
- **React / Svelte frontend**

### Communication
- WebSocket / QUIC bridge
- Protobuf / JSON for UI events

---

## Non-Goals
- No in-game UI dependency
- No admin commands via chat
- No browser-only launcher

---

## Outcome
A secure, transparent, and controllable UI that:
- Makes distributed computing understandable
- Prevents accidental misuse
- Supports debugging and scaling
