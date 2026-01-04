import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  getSpecs: () => ipcRenderer.invoke('get_specs'),
  getP2PStatus: () => ipcRenderer.invoke('get_p2p_status'),
  getPeers: () => ipcRenderer.invoke('get_peers'),
  on: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, (_, data) => callback(data));
  },
  send: (channel: string, data: any) => {
    ipcRenderer.send(channel, data);
  },
  connectPeer: (address: string) => ipcRenderer.invoke('connect_peer', address)
});
