/// <reference types="vite/client" />

interface Window {
  meteorman: {
    readLegacyState(): Promise<unknown | null>;
    importCollections(): Promise<Array<{ name: string; content: string }>>;
    exportCollection(name: string, content: string): Promise<boolean>;
  };
}

declare module 'simpleddp';
declare module 'simpleddp-plugin-login';
declare module 'isomorphic-ws';
declare module 'monaco-editor-worker' {
  const WorkerConstructor: new () => Worker;
  export default WorkerConstructor;
}
declare module 'monaco-json-worker' {
  const WorkerConstructor: new () => Worker;
  export default WorkerConstructor;
}
