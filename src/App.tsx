import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [specs, setSpecs] = useState("Loading...");
  const [cpuLimit, setCpuLimit] = useState(50);

  const [isMining, setIsMining] = useState(false);

  const [peerId, setPeerId] = useState<string | null>(null);
  const [peers, setPeers] = useState<any[]>([]);
  const [manualAddress, setManualAddress] = useState("");

  const handleManualConnect = async () => {
    try {
      // @ts-ignore
      await window.electron.connectPeer(manualAddress);
      alert("Connection initiated!");
      setManualAddress("");
    } catch (err) {
      alert("Failed to connect: " + err);
    }
  };

  useEffect(() => {
    const fetchStats = () => {
      // @ts-ignore
      if (window.electron) {
        // @ts-ignore
        window.electron.getSpecs()
          .then((specs: string) => setSpecs(specs))
          .catch(console.error);

        // @ts-ignore
        window.electron.getP2PStatus()
          .then((status: any) => setPeerId(status.peerId))
          .catch(console.error);

        // @ts-ignore
        window.electron.getPeers()
          .then((peersList: any[]) => setPeers(peersList))
          .catch(console.error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      <header>
        <h1>P2Pixel Compute Node</h1>
        <div className={`status-badge ${peerId ? 'online' : 'offline'}`}>
          {peerId ? 'ONLINE' : 'CONNECTING...'}
        </div>
      </header>

      <main>
        <div className="card resource-control">
          <h2>Node Status</h2>
          <div className="specs-display">
            <p><strong>System:</strong> {specs}</p>
            <p className="peer-id" style={{fontSize: '0.8em', color: '#888'}}>
              ID: {peerId || 'Waiting for P2P...'}
            </p>
          </div>

          <div className="peers-list-container">
            <h3>Connected Peers ({peers.length})</h3>
            <div className="peers-list">
              {peers.length === 0 ? (
                <p>Scanning network...</p>
              ) : (
                peers.map((peer, i) => (
                  <div key={i} className="peer-item">
                    ✅ {peer.id}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="control-group">
            <h3>Manual Connection</h3>
            <div style={{display: 'flex', gap: '10px'}}>
              <input 
                type="text" 
                placeholder="/ip4/..."
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                style={{flex: 1}}
              />
              <button onClick={handleManualConnect}>Connect</button>
            </div>
          </div>

          <h2>Contribution Limits</h2>
          <div className="control-group">
            <label>Max CPU Usage: {cpuLimit}%</label>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value={cpuLimit} 
              onChange={(e) => setCpuLimit(parseInt(e.target.value))}
            />
          </div>

          <button 
            className={`btn-toggle ${isMining ? 'stop' : 'start'}`}
            onClick={() => setIsMining(!isMining)}
          >
            {isMining ? 'STOP CONTRIBUTING' : 'START CONTRIBUTING'}
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
