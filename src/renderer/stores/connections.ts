import { defineStore } from 'pinia';
import {
  DEFAULT_ARGUMENT_EDITOR_HEIGHT,
  MAX_ARGUMENT_EDITOR_HEIGHT,
  MIN_ARGUMENT_EDITOR_HEIGHT
} from '../types';
import type {
  Collection,
  CollectionElement,
  CollectionLocation,
  DdpArgument,
  DdpConnection,
  Endpoint,
  EndpointType,
  Folder
} from '../types';

const createId = (prefix: string): string => `${prefix}-${crypto.randomUUID()}`;

const cloneState = <T>(value: T): T =>
  JSON.parse(JSON.stringify(value)) as T;

const createEndpoint = (title = 'Endpoint 1'): Endpoint => ({
  id: createId('endpoint'),
  type: 'endpoint',
  title,
  name: '',
  endpointType: 'method',
  description: '',
  args: []
});

const createConnection = (title: string): DdpConnection => ({
  id: createId('connection'),
  title,
  collections: [],
  openEndpoints: [createEndpoint()]
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const normaliseArgument = (value: unknown): DdpArgument => {
  const argument = isRecord(value) ? value : {};
  const legacyType = isRecord(argument.type) ? argument.type.name : argument.type;
  const allowedTypes = ['object', 'string', 'number', 'boolean', 'array'] as const;
  const type = allowedTypes.includes(legacyType as (typeof allowedTypes)[number])
    ? (legacyType as DdpArgument['type'])
    : 'string';
  const savedEditorHeight =
    typeof argument.editorHeight === 'number' && Number.isFinite(argument.editorHeight)
      ? argument.editorHeight
      : DEFAULT_ARGUMENT_EDITOR_HEIGHT;
  const editorHeight = Math.round(
    Math.min(
      MAX_ARGUMENT_EDITOR_HEIGHT,
      Math.max(MIN_ARGUMENT_EDITOR_HEIGHT, savedEditorHeight)
    )
  );

  return {
    type,
    value:
      typeof argument.value === 'string' ||
      typeof argument.value === 'number' ||
      typeof argument.value === 'boolean'
        ? argument.value
        : type === 'boolean'
          ? false
          : null,
    json: isRecord(argument.json) ? argument.json : {},
    array: Array.isArray(argument.array) ? argument.array : [],
    editorHeight
  };
};

const findElement = (
  elements: CollectionElement[],
  id: string
): CollectionElement | undefined => {
  for (const element of elements) {
    if (element.id === id) return element;
    if (element.type === 'folder') {
      const nested = findElement(element.children, id);
      if (nested) return nested;
    }
  }
  return undefined;
};

const removeElement = (elements: CollectionElement[], id: string): boolean => {
  const index = elements.findIndex((element) => element.id === id);
  if (index >= 0) {
    elements.splice(index, 1);
    return true;
  }

  return elements.some(
    (element) => element.type === 'folder' && removeElement(element.children, id)
  );
};

const normaliseEndpoint = (value: Partial<Endpoint>): Endpoint => ({
  id: value.id || createId('endpoint'),
  type: 'endpoint',
  title: value.title || value.name || 'Endpoint',
  name: value.name || '',
  endpointType: value.endpointType === 'publication' ? 'publication' : 'method',
  description: value.description || '',
  collection: value.collection,
  args: Array.isArray(value.args) ? value.args.map(normaliseArgument) : []
});

const normaliseElement = (value: Partial<CollectionElement>): CollectionElement => {
  if (value.type === 'endpoint') return normaliseEndpoint(value as Partial<Endpoint>);
  const folder = value as Partial<Folder>;

  return {
    id: folder.id || createId('folder'),
    type: 'folder',
    name: folder.name || 'Untitled folder',
    children: Array.isArray(folder.children)
      ? folder.children.map((child: CollectionElement) => normaliseElement(child))
      : []
  };
};

const normaliseCollection = (value: Partial<Collection>): Collection => ({
  id: value.id || createId('collection'),
  type: 'collection',
  name: value.name || 'Untitled collection',
  description: value.description || '',
  children: Array.isArray(value.children)
    ? value.children.map((child) => normaliseElement(child))
    : []
});

const findDestination = (
  connection: DdpConnection,
  location: CollectionLocation
): Collection | Folder | undefined => {
  let current: Collection | Folder | undefined = connection.collections.find(
    (collection) => collection.id === location.collectionId
  );

  for (const folderId of location.folderIds) {
    if (!current) return undefined;
    const next: CollectionElement | undefined = current.children.find(
      (child): child is Folder => child.type === 'folder' && child.id === folderId
    );
    current = next;
  }

  return current;
};

export const useConnectionsStore = defineStore('connections', {
  state: (): { ddpConnections: DdpConnection[] } => ({
    ddpConnections: [createConnection('Connection 1')]
  }),

  actions: {
    async hydrate(): Promise<void> {
      const saved = localStorage.getItem('meteorman.connections.v3');
      try {
        const persisted = saved
          ? (JSON.parse(saved) as { ddpConnections?: DdpConnection[] })
          : await window.meteorman.readLegacyState();
        const legacyConnections =
          persisted &&
          typeof persisted === 'object' &&
          'connections' in persisted &&
          persisted.connections &&
          typeof persisted.connections === 'object' &&
          'ddpConnections' in persisted.connections
            ? persisted.connections.ddpConnections
            : undefined;
        const connections =
          persisted &&
          typeof persisted === 'object' &&
          'ddpConnections' in persisted
            ? persisted.ddpConnections
            : legacyConnections;

        if (Array.isArray(connections) && connections.length > 0) {
          this.ddpConnections = connections.map((connection: DdpConnection, index: number) => ({
            id: connection.id || createId('connection'),
            title: connection.title || `Connection ${index + 1}`,
            collections: Array.isArray(connection.collections)
              ? connection.collections.map(normaliseCollection)
              : [],
            openEndpoints:
              Array.isArray(connection.openEndpoints) && connection.openEndpoints.length > 0
                ? connection.openEndpoints.map(normaliseEndpoint)
                : [createEndpoint()]
          }));
          if (!saved) {
            localStorage.setItem(
              'meteorman.connections.v3',
              JSON.stringify({ ddpConnections: this.ddpConnections })
            );
          }
        }
      } catch {
        if (saved) localStorage.removeItem('meteorman.connections.v3');
      }
    },

    addConnection(): DdpConnection {
      let index = 1;
      while (this.ddpConnections.some(({ title }) => title === `Connection ${index}`)) {
        index += 1;
      }
      const connection = createConnection(`Connection ${index}`);
      this.ddpConnections.push(connection);
      return connection;
    },

    removeConnection(connectionId: string): void {
      if (this.ddpConnections.length <= 1) return;
      const index = this.ddpConnections.findIndex(({ id }) => id === connectionId);
      if (index >= 0) this.ddpConnections.splice(index, 1);
    },

    addEndpoint(connectionId: string): Endpoint | undefined {
      const connection = this.ddpConnections.find(({ id }) => id === connectionId);
      if (!connection) return undefined;

      let index = 1;
      while (connection.openEndpoints.some(({ title }) => title === `Endpoint ${index}`)) {
        index += 1;
      }
      const endpoint = createEndpoint(`Endpoint ${index}`);
      connection.openEndpoints.push(endpoint);
      return endpoint;
    },

    closeEndpoint(connectionId: string, endpointId: string): void {
      const connection = this.ddpConnections.find(({ id }) => id === connectionId);
      if (!connection || connection.openEndpoints.length <= 1) return;
      const index = connection.openEndpoints.findIndex(({ id }) => id === endpointId);
      if (index >= 0) connection.openEndpoints.splice(index, 1);
    },

    openEndpoint(connectionId: string, endpoint: Endpoint): void {
      const connection = this.ddpConnections.find(({ id }) => id === connectionId);
      if (!connection) return;
      if (!connection.openEndpoints.some(({ id }) => id === endpoint.id)) {
        connection.openEndpoints.push(normaliseEndpoint(cloneState(endpoint)));
      }
    },

    updateEndpoint(
      connectionId: string,
      endpointId: string,
      patch: Partial<Pick<Endpoint, 'name' | 'title' | 'description' | 'endpointType' | 'collection'>>
    ): void {
      const endpoint = this.getOpenEndpoint(connectionId, endpointId);
      if (!endpoint) return;
      Object.assign(endpoint, patch);
      if (patch.name !== undefined && patch.name.trim()) endpoint.title = patch.name.trim();
    },

    saveArgument(
      connectionId: string,
      endpointId: string,
      index: number,
      argument: DdpArgument
    ): void {
      const endpoint = this.getOpenEndpoint(connectionId, endpointId);
      if (!endpoint) return;
      endpoint.args[index] = cloneState(argument);
    },

    removeArgument(connectionId: string, endpointId: string, index: number): void {
      this.getOpenEndpoint(connectionId, endpointId)?.args.splice(index, 1);
    },

    addCollection(connectionId: string, name: string): boolean {
      const connection = this.ddpConnections.find(({ id }) => id === connectionId);
      const cleanName = name.trim();
      if (!connection || !cleanName || connection.collections.some((item) => item.name === cleanName)) {
        return false;
      }

      connection.collections.push({
        id: createId('collection'),
        type: 'collection',
        name: cleanName,
        description: '',
        children: []
      });
      return true;
    },

    importCollection(connectionId: string, data: unknown): boolean {
      const connection = this.ddpConnections.find(({ id }) => id === connectionId);
      if (!connection || !data || typeof data !== 'object') return false;
      const collection = normaliseCollection(data as Partial<Collection>);
      if (connection.collections.some(({ name }) => name === collection.name)) return false;
      connection.collections.push(collection);
      return true;
    },

    addFolder(connectionId: string, parentId: string, name: string): boolean {
      const parent = this.getContainer(connectionId, parentId);
      const cleanName = name.trim();
      if (!parent || !cleanName || parent.children.some((item) => item.name === cleanName)) {
        return false;
      }
      parent.children.push({
        id: createId('folder'),
        type: 'folder',
        name: cleanName,
        children: []
      });
      return true;
    },

    addCollectionEndpoint(
      connectionId: string,
      parentId: string,
      name: string,
      endpointType: EndpointType,
      description: string
    ): boolean {
      const parent = this.getContainer(connectionId, parentId);
      const cleanName = name.trim();
      if (!parent || !cleanName || parent.children.some((item) => item.name === cleanName)) {
        return false;
      }
      parent.children.push({
        ...createEndpoint(cleanName),
        title: cleanName,
        name: cleanName,
        endpointType,
        description
      });
      return true;
    },

    removeCollectionElement(connectionId: string, elementId: string): void {
      const connection = this.ddpConnections.find(({ id }) => id === connectionId);
      if (!connection) return;
      const collectionIndex = connection.collections.findIndex(({ id }) => id === elementId);
      if (collectionIndex >= 0) {
        connection.collections.splice(collectionIndex, 1);
        return;
      }
      for (const collection of connection.collections) {
        if (removeElement(collection.children, elementId)) return;
      }
    },

    saveEndpointToCollection(
      connectionId: string,
      endpointId: string,
      location: CollectionLocation
    ): boolean {
      const connection = this.ddpConnections.find(({ id }) => id === connectionId);
      const endpoint = this.getOpenEndpoint(connectionId, endpointId);
      if (!connection || !endpoint || !endpoint.name.trim()) return false;

      const destination = findDestination(connection, location);
      if (!destination) return false;

      const duplicate = destination.children.find(
        (item) => item.type === 'endpoint' && item.name === endpoint.name && item.id !== endpoint.id
      );
      if (duplicate) return false;

      const saved = cloneState(endpoint);
      const existingIndex = destination.children.findIndex(({ id }) => id === endpoint.id);
      if (existingIndex >= 0) destination.children[existingIndex] = saved;
      else destination.children.push(saved);
      return true;
    },

    getOpenEndpoint(connectionId: string, endpointId: string): Endpoint | undefined {
      return this.ddpConnections
        .find(({ id }) => id === connectionId)
        ?.openEndpoints.find(({ id }) => id === endpointId);
    },

    getContainer(connectionId: string, elementId: string): Collection | Folder | undefined {
      const connection = this.ddpConnections.find(({ id }) => id === connectionId);
      if (!connection) return undefined;
      const collection = connection.collections.find(({ id }) => id === elementId);
      if (collection) return collection;
      for (const root of connection.collections) {
        const element = findElement(root.children, elementId);
        if (element?.type === 'folder') return element;
      }
      return undefined;
    }
  }
});
