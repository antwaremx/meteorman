import { contextBridge, ipcRenderer } from 'electron';

const api = {
  readLegacyState: (): Promise<unknown | null> =>
    ipcRenderer.invoke('state:read-legacy'),
  importCollections: (): Promise<Array<{ name: string; content: string }>> =>
    ipcRenderer.invoke('collections:import'),
  exportCollection: (name: string, content: string): Promise<boolean> =>
    ipcRenderer.invoke('collections:export', name, content)
};

contextBridge.exposeInMainWorld('meteorman', api);
