import editorWorker from 'monaco-editor-worker';
import jsonWorker from 'monaco-json-worker';

self.MonacoEnvironment = {
  getWorker(_moduleId: string, label: string) {
    if (label === 'json') return new jsonWorker();
    return new editorWorker();
  }
};
