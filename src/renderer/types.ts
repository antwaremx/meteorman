export type EndpointType = 'method' | 'publication';
export type ArgumentType = 'none' | 'object' | 'string' | 'number' | 'boolean' | 'array';

export const DEFAULT_ARGUMENT_EDITOR_HEIGHT = 92;
export const MIN_ARGUMENT_EDITOR_HEIGHT = 80;
export const MAX_ARGUMENT_EDITOR_HEIGHT = 320;

export interface DdpArgument {
  type: ArgumentType;
  value: string | number | boolean | null;
  json: Record<string, unknown>;
  array: unknown[];
  editorHeight?: number;
}

export interface Endpoint {
  id: string;
  type: 'endpoint';
  title: string;
  name: string;
  endpointType: EndpointType;
  description: string;
  collection?: string;
  args: DdpArgument[];
}

export interface Folder {
  id: string;
  type: 'folder';
  name: string;
  children: CollectionElement[];
}

export interface Collection {
  id: string;
  type: 'collection';
  name: string;
  description: string;
  children: CollectionElement[];
}

export type CollectionElement = Folder | Endpoint;

export interface DdpConnection {
  id: string;
  title: string;
  collections: Collection[];
  openEndpoints: Endpoint[];
}

export interface CollectionLocation {
  collectionId: string;
  folderIds: string[];
}
