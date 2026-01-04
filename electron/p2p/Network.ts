import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@libp2p/yamux';
import { kadDHT } from '@libp2p/kad-dht';
import { ping } from '@libp2p/ping';
import { identify } from '@libp2p/identify';
import { gossipsub } from '@chainsafe/libp2p-gossipsub';
import { multiaddr } from 'multiaddr';
import { mdns } from '@libp2p/mdns';
import { Role, NodeState } from './types.js';

// Hardcoded bootstrap (for local dev mesh)
const BOOTSTRAP_NODES = [
  '/ip4/127.0.0.1/tcp/6000/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN' 
];

export class P2PNode {
  private node: any;
  public state: NodeState;
  
  constructor() {
    this.state = {
      role: Role.WORKER, // Everyone starts as a worker
      term: 0,
      leaderId: null
    };
  }

  async start() {
    // Dynamic import workaround if needed (but we are in Module mode now)
    
    this.node = await createLibp2p({
      addresses: {
        listen: ['/ip4/0.0.0.0/tcp/0'] // Random high port
      },
      transports: [tcp()],
      connectionEncryption: [noise()],
      streamMuxers: [yamux()],
      services: {
        dht: kadDHT(),
        ping: ping(),
        identify: identify(),
        // @ts-ignore
        pubsub: gossipsub({ allowPublishToZeroPeers: true })
      },
      peerDiscovery: [
        mdns()
      ]
    });

    // MDNS Discovery Event
    this.node.addEventListener('peer:discovery', async (evt: any) => {
      const peer = evt.detail;
      console.log('[Discovery] Found peer:', peer.id.toString());
      try {
        await this.node.dial(peer.id);
        console.log('[Connection] Connected to:', peer.id.toString());
      } catch (err) {
        console.error('[Connection] Failed to dial:', err);
      }
    });

    this.node.addEventListener('peer:connect', (evt: any) => {
      console.log('[Connection] Established with:', evt.detail.toString());
    });

    await this.node.start();
    
    const port = this.node.getMultiaddrs()[0].toString().split('/')[4];
    console.log(`[P2P] Started on port ${port}. Peer ID: ${this.node.peerId.toString()}`);

    // Subscribe to Election channel
    this.node.services.pubsub.subscribe('p2pixel-election');
    this.node.services.pubsub.addEventListener('message', this.handleMessage.bind(this));
    
    // Start Election Clock
    this.startElectionTimer();

    return this.node.peerId.toString();
  }

  private startElectionTimer() {
    // Randomized timeout (15-30s) for Raft-like election
    const timeout = 15000 + Math.random() * 15000;
    setTimeout(() => this.runElection(), timeout);
  }

  private async runElection() {
    if (this.state.role === Role.COORDINATOR) return; // Already leader

    console.log('[Election] Timeout! Starting election...');
    this.state.role = Role.CANDIDATE;
    this.state.term++;
    this.state.leaderId = this.node.peerId.toString(); // Vote for self

    const voteRequest = {
      type: 'VOTE_REQUEST',
      term: this.state.term,
      candidateId: this.node.peerId.toString()
    };
    
    await this.broadcast('p2pixel-election', voteRequest);
  }

  private handleMessage(evt: any) {
    const topic = evt.detail.topic;
    const data = JSON.parse(new TextDecoder().decode(evt.detail.data));
    const from = evt.detail.from.toString();

    console.log(`[P2P] Msg from ${from}:`, data);

    if (topic === 'p2pixel-election') {
        this.handleElectionData(from, data);
    }
  }

  private handleElectionData(from: string, data: any) {
    if (data.type === 'VOTE_REQUEST') {
        if (data.term > this.state.term) {
            console.log(`[Election] Voting for ${from}`);
            this.state.term = data.term;
            this.state.role = Role.WORKER; // Step down
            this.state.leaderId = from;
            // TODO: Send VOTE_ACK
        }
    }
  }

  public getPeerId(): string | null {
    return this.node ? this.node.peerId.toString() : null;
  }

  public getConnectedPeers(): any[] {
    if (!this.node) return [];
    return this.node.getPeers().map((p: any) => ({ id: p.toString() }));
  }

  public async connect(address: string) {
    if (!this.node) throw new Error("Node not started");
    console.log('[Manual] Connecting to:', address);
    await this.node.dial(multiaddr(address));
    return true;
  }

  private async broadcast(topic: string, msg: any) {
    const data = new TextEncoder().encode(JSON.stringify(msg));
    await this.node.services.pubsub.publish(topic, data);
  }
}

export const p2pNode = new P2PNode();
