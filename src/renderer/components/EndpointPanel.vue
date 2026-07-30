<template>
  <section class="endpoint-panel">
    <div class="endpoint-toolbar">
      <v-btn
        class="documentation-button"
        color="secondary"
        prepend-icon="mdi-book-open-variant-outline"
        size="small"
        variant="text"
        @click="documentationOpen = true"
      >
        Documentation
      </v-btn>
      <div class="endpoint-request" :class="{ publication: endpointType === 'publication' }">
        <v-select
          v-model="endpointType"
          :items="endpointTypeOptions"
          aria-label="Endpoint type"
          item-title="title"
          item-value="value"
          label="Request type"
          @update:model-value="saveEndpointType"
        />
        <v-text-field
          v-model="endpointName"
          :placeholder="endpointType === 'method' ? 'Enter method name' : 'Enter publication name'"
          aria-label="Endpoint name"
          label="Endpoint"
          prepend-inner-icon="mdi-api"
          @blur="saveName"
        />
        <v-text-field
          v-if="endpointType === 'publication'"
          v-model="collectionName"
          aria-label="Publication collection name"
          label="Collection"
          placeholder="Enter collection name"
          prepend-inner-icon="mdi-database-outline"
          @blur="saveCollectionName"
        />
        <v-btn
          color="secondary"
          :disabled="sending"
          :loading="sending"
          prepend-icon="mdi-send-outline"
          @click="send"
        >
          {{ sending ? 'Sending…' : 'Send' }}
        </v-btn>
        <v-btn
          color="secondary"
          prepend-icon="mdi-content-save-outline"
          variant="tonal"
          @click="openSaveDialog"
        >
          Save
        </v-btn>
      </div>
    </div>

    <div
      ref="requestResponse"
      class="request-response"
      :class="{ 'is-resizing': resizing }"
      :style="splitStyle"
    >
      <section class="arguments-pane">
        <div class="pane-title">
          <div class="pane-heading">
            <v-icon icon="mdi-code-json" size="17" />
            <span>Parameters</span>
            <v-chip size="x-small" variant="tonal">{{ argumentsList.length }}</v-chip>
          </div>
          <v-btn
            color="secondary"
            prepend-icon="mdi-plus"
            size="small"
            variant="text"
            @click="addArgument"
          >
            Add parameter
          </v-btn>
        </div>
        <div class="argument-header"><span>TYPE</span><span>VALUE</span></div>
        <div v-if="!argumentsList.length" class="empty-arguments">
          <v-icon icon="mdi-code-braces" size="28" />
          <span>This request has no parameters.</span>
        </div>
        <div
          v-for="(argument, index) in argumentsList"
          :key="argument.key"
          class="argument-row"
        >
          <v-select
            v-model="argument.type"
            :items="argumentTypeOptions"
            aria-label="Parameter type"
            item-title="title"
            item-value="value"
            @update:model-value="changeArgumentType(index)"
          />
          <v-text-field
            v-if="argument.type === 'string'"
            v-model="argument.value"
            aria-label="String parameter value"
            placeholder="Enter a string value"
            @blur="saveArgument(index)"
          />
          <v-text-field
            v-else-if="argument.type === 'number'"
            v-model.number="argument.value"
            aria-label="Number parameter value"
            type="number"
            placeholder="Value"
            @blur="saveArgument(index)"
          />
          <v-switch
            v-else-if="argument.type === 'boolean'"
            v-model="argument.value"
            class="boolean-input"
            color="secondary"
            :label="argument.value ? 'true' : 'false'"
            @update:model-value="saveArgument(index)"
          />
          <div
            v-else
            class="argument-editor"
            :class="{ 'is-resizing': resizingArgumentIndex === index }"
            :style="{ height: `${argument.editorHeight}px` }"
          >
            <MonacoEditor
              v-model="argument.editorText"
              compact
              @update:model-value="saveJsonArgument(index)"
            />
            <v-btn
              class="expand-editor"
              aria-label="Expand editor"
              icon="mdi-arrow-expand-all"
              size="x-small"
              title="Expand editor"
              variant="text"
              @click="expandedArgument = index"
            />
            <div
              class="argument-editor-resizer"
              role="separator"
              :aria-label="`Resize parameter ${index + 1} editor`"
              aria-orientation="horizontal"
              :aria-valuemin="MIN_ARGUMENT_EDITOR_HEIGHT"
              :aria-valuemax="MAX_ARGUMENT_EDITOR_HEIGHT"
              :aria-valuenow="argument.editorHeight"
              :aria-valuetext="`${argument.editorHeight} pixels`"
              tabindex="0"
              title="Drag to resize. Double-click to reset."
              @dblclick.stop="resetArgumentEditorHeight(index)"
              @keydown="resizeArgumentEditorWithKeyboard($event, index)"
              @pointerdown.stop="startArgumentEditorResizing($event, index)"
            ></div>
          </div>
          <v-btn
            class="remove-argument"
            aria-label="Remove parameter"
            color="error"
            icon="mdi-delete-outline"
            size="small"
            title="Remove parameter"
            variant="text"
            @click="removeArgument(index)"
          />
        </div>
      </section>

      <div
        class="pane-resizer"
        role="separator"
        aria-label="Resize parameters and response panes"
        aria-orientation="horizontal"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="Math.round(splitRatio * 100)"
        tabindex="0"
        title="Drag to resize. Double-click to reset."
        @dblclick="resetSplit"
        @keydown="resizeWithKeyboard"
        @pointerdown="startResizing"
      ></div>

      <section class="response-pane">
        <div class="pane-title">
          <div class="pane-heading">
            <v-icon icon="mdi-console-line" size="17" />
            <span>Response</span>
          </div>
          <v-chip
            v-if="elapsedTime"
            color="success"
            prepend-icon="mdi-timer-outline"
            size="x-small"
            variant="tonal"
          >
            {{ elapsedTime }}
          </v-chip>
        </div>
        <MonacoEditor
          v-if="hasResponse"
          :model-value="responseText"
          read-only
          class="response-editor"
        />
        <div v-else class="empty-response">
          <img :src="emptyLogo" alt="" />
          <strong>Ready for a response</strong>
          <span>Send this request to inspect the server result.</span>
        </div>
      </section>
    </div>

    <v-dialog
      :model-value="documentationOpen"
      max-width="920"
      @update:model-value="handleDocumentationDialog"
    >
      <v-card class="documentation-dialog">
        <v-card-title class="dialog-title">
          <div>
            <div class="dialog-eyebrow">Endpoint reference</div>
            <span>Documentation</span>
          </div>
          <v-btn
            aria-label="Close documentation"
            icon="mdi-close"
            size="small"
            variant="text"
            @click="closeDocumentation"
          />
        </v-card-title>
        <v-divider />
        <v-card-text class="documentation-content">
          <div v-if="editingDescription" class="documentation-editor">
            <MonacoEditor v-model="descriptionDraft" language="markdown" />
          </div>
          <article v-else class="markdown-body" v-html="renderedDescription"></article>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <template v-if="editingDescription">
            <v-btn variant="text" @click="cancelDescription">Cancel</v-btn>
            <v-btn color="primary" prepend-icon="mdi-content-save-outline" @click="saveDescription">
              Save
            </v-btn>
          </template>
          <v-btn
            v-else
            color="secondary"
            prepend-icon="mdi-pencil-outline"
            @click="editingDescription = true"
          >
            {{ endpoint.description ? 'Edit' : 'Add' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="saveDialogOpen" max-width="520">
      <v-card>
        <v-card-title class="dialog-title">
          <span>Save endpoint</span>
          <v-btn
            aria-label="Close"
            icon="mdi-close"
            size="small"
            variant="text"
            @click="saveDialogOpen = false"
          />
        </v-card-title>
        <v-divider />
        <v-card-text class="save-endpoint-fields">
          <v-text-field
            v-model="endpointName"
            label="Endpoint name"
            prepend-inner-icon="mdi-api"
            @blur="saveName"
          />
          <v-select
            v-model="selectedLocation"
            :items="locations"
            item-title="label"
            item-value="value"
            label="Collection or folder"
            prepend-inner-icon="mdi-folder-outline"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="saveDialogOpen = false">Cancel</v-btn>
          <v-btn color="primary" prepend-icon="mdi-content-save-outline" @click="saveToCollection">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      class="argument-dialog"
      :model-value="expandedArgument !== null"
      max-width="1180"
      @update:model-value="handleExpandedDialog"
    >
      <v-card class="expanded-editor-card">
        <v-card-title class="dialog-title">
          <div>
            <div class="dialog-eyebrow">Full-size JSON workspace</div>
            <span>Parameter editor</span>
          </div>
          <v-btn
            aria-label="Close expanded editor"
            icon="mdi-close"
            size="small"
            variant="text"
            @click="expandedArgument = null"
          />
        </v-card-title>
        <v-divider />
        <v-card-text class="expanded-editor-content">
          <MonacoEditor
            v-if="expandedArgument !== null && argumentsList[expandedArgument]"
            v-model="argumentsList[expandedArgument]!.editorText"
            @update:model-value="saveJsonArgument(expandedArgument)"
          />
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="expandedArgument = null">Done</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount, ref } from 'vue';
import MarkdownIt from 'markdown-it';
import { useConnectionsStore } from '../stores/connections';
import {
  DEFAULT_ARGUMENT_EDITOR_HEIGHT,
  MAX_ARGUMENT_EDITOR_HEIGHT,
  MIN_ARGUMENT_EDITOR_HEIGHT
} from '../types';
import type {
  ArgumentType,
  Collection,
  CollectionLocation,
  DdpArgument,
  DdpConnection,
  Endpoint,
  EndpointType,
  Folder
} from '../types';
import { noticeKey } from '../notices';
import MonacoEditor from './MonacoEditor.vue';
import emptyLogo from '../assets/MeteormanFinal.png';

interface WorkingArgument extends DdpArgument {
  key: string;
  editorText: string;
  editorHeight: number;
}

interface LocationOption {
  value: string;
  label: string;
  location: CollectionLocation;
}

const props = defineProps<{
  connection: DdpConnection;
  endpoint: Endpoint;
  client?: any;
}>();
const store = useConnectionsStore();
const notice = inject(noticeKey, () => undefined);
const markdown = new MarkdownIt({ html: false, linkify: true, breaks: true });

const endpointType = ref<EndpointType>(props.endpoint.endpointType || 'method');
const endpointName = ref(props.endpoint.name || '');
const collectionName = ref(props.endpoint.collection || '');
const descriptionDraft = ref(props.endpoint.description || '');
const documentationOpen = ref(false);
const editingDescription = ref(false);
const saveDialogOpen = ref(false);
const selectedLocation = ref('');
const expandedArgument = ref<number | null>(null);
const responseText = ref('');
const hasResponse = ref(false);
const elapsedTime = ref('');
const sending = ref(false);
const endpointTypeOptions = [
  { title: 'Method', value: 'method' },
  { title: 'Subscription', value: 'publication' }
];
const argumentTypeOptions = [
  { title: 'String', value: 'string' },
  { title: 'Number', value: 'number' },
  { title: 'Boolean', value: 'boolean' },
  { title: 'Object', value: 'object' },
  { title: 'Array', value: 'array' }
];
const requestResponse = ref<HTMLElement>();
const splitRatio = ref(0.5);
const resizing = ref(false);
const resizingArgumentIndex = ref<number | null>(null);
let activeSubscription: any = null;
let activePointerId: number | null = null;
let previousBodyCursor = '';
let previousBodyUserSelect = '';
let argumentResizePointerId: number | null = null;
let argumentResizeStartY = 0;
let argumentResizeStartHeight = DEFAULT_ARGUMENT_EDITOR_HEIGHT;
let previousArgumentResizeBodyCursor = '';
let previousArgumentResizeBodyUserSelect = '';

const SPLITTER_SIZE = 9;
const MIN_PANE_SIZE = 120;
const KEYBOARD_RESIZE_STEP = 24;

const splitStyle = computed<Record<string, string>>(() => ({
  '--arguments-ratio': `${splitRatio.value}fr`,
  '--response-ratio': `${1 - splitRatio.value}fr`
}));

function splitBounds(): {
  availableHeight: number;
  minRatio: number;
  maxRatio: number;
} | null {
  if (!requestResponse.value) return null;
  const availableHeight = requestResponse.value.getBoundingClientRect().height - SPLITTER_SIZE;
  if (availableHeight <= 0) return null;
  const minimum = Math.min(MIN_PANE_SIZE, availableHeight / 2);
  const minRatio = minimum / availableHeight;
  return {
    availableHeight,
    minRatio,
    maxRatio: 1 - minRatio
  };
}

function setSplitRatio(nextRatio: number): void {
  const bounds = splitBounds();
  if (!bounds) return;
  splitRatio.value = Math.min(bounds.maxRatio, Math.max(bounds.minRatio, nextRatio));
}

function resizeFromPointer(event: PointerEvent): void {
  if (event.pointerId !== activePointerId || !requestResponse.value) return;
  const bounds = splitBounds();
  if (!bounds) return;
  const { top } = requestResponse.value.getBoundingClientRect();
  const argumentsHeight = event.clientY - top - SPLITTER_SIZE / 2;
  setSplitRatio(argumentsHeight / bounds.availableHeight);
}

function stopResizing(event?: PointerEvent): void {
  if (event && event.pointerId !== activePointerId) return;
  activePointerId = null;
  resizing.value = false;
  window.removeEventListener('pointermove', resizeFromPointer);
  window.removeEventListener('pointerup', stopResizing);
  window.removeEventListener('pointercancel', stopResizing);
  document.body.style.cursor = previousBodyCursor;
  document.body.style.userSelect = previousBodyUserSelect;
}

function startResizing(event: PointerEvent): void {
  if (event.button !== 0) return;
  event.preventDefault();
  activePointerId = event.pointerId;
  resizing.value = true;
  previousBodyCursor = document.body.style.cursor;
  previousBodyUserSelect = document.body.style.userSelect;
  document.body.style.cursor = 'row-resize';
  document.body.style.userSelect = 'none';
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  window.addEventListener('pointermove', resizeFromPointer);
  window.addEventListener('pointerup', stopResizing);
  window.addEventListener('pointercancel', stopResizing);
  resizeFromPointer(event);
}

function resizeWithKeyboard(event: KeyboardEvent): void {
  const bounds = splitBounds();
  if (!bounds) return;
  let nextRatio = splitRatio.value;
  if (event.key === 'ArrowUp') {
    nextRatio -= KEYBOARD_RESIZE_STEP / bounds.availableHeight;
  } else if (event.key === 'ArrowDown') {
    nextRatio += KEYBOARD_RESIZE_STEP / bounds.availableHeight;
  } else if (event.key === 'Home') {
    nextRatio = bounds.minRatio;
  } else if (event.key === 'End') {
    nextRatio = bounds.maxRatio;
  } else {
    return;
  }
  event.preventDefault();
  setSplitRatio(nextRatio);
}

function resetSplit(): void {
  splitRatio.value = 0.5;
}

function clampArgumentEditorHeight(height: number): number {
  return Math.round(
    Math.min(MAX_ARGUMENT_EDITOR_HEIGHT, Math.max(MIN_ARGUMENT_EDITOR_HEIGHT, height))
  );
}

function resizeArgumentEditorFromPointer(event: PointerEvent): void {
  if (
    event.pointerId !== argumentResizePointerId ||
    resizingArgumentIndex.value === null
  ) {
    return;
  }
  const argument = argumentsList.value[resizingArgumentIndex.value];
  if (!argument) return;
  argument.editorHeight = clampArgumentEditorHeight(
    argumentResizeStartHeight + event.clientY - argumentResizeStartY
  );
}

function stopArgumentEditorResizing(event?: PointerEvent): void {
  if (event && event.pointerId !== argumentResizePointerId) return;
  const index = resizingArgumentIndex.value;
  argumentResizePointerId = null;
  resizingArgumentIndex.value = null;
  window.removeEventListener('pointermove', resizeArgumentEditorFromPointer);
  window.removeEventListener('pointerup', stopArgumentEditorResizing);
  window.removeEventListener('pointercancel', stopArgumentEditorResizing);
  document.body.style.cursor = previousArgumentResizeBodyCursor;
  document.body.style.userSelect = previousArgumentResizeBodyUserSelect;
  if (index !== null) saveArgument(index);
}

function startArgumentEditorResizing(event: PointerEvent, index: number): void {
  if (event.button !== 0) return;
  const argument = argumentsList.value[index];
  if (!argument) return;
  event.preventDefault();
  const handle = event.currentTarget as HTMLElement;
  handle.focus();
  handle.setPointerCapture(event.pointerId);
  argumentResizePointerId = event.pointerId;
  resizingArgumentIndex.value = index;
  argumentResizeStartY = event.clientY;
  argumentResizeStartHeight = argument.editorHeight;
  previousArgumentResizeBodyCursor = document.body.style.cursor;
  previousArgumentResizeBodyUserSelect = document.body.style.userSelect;
  document.body.style.cursor = 'row-resize';
  document.body.style.userSelect = 'none';
  window.addEventListener('pointermove', resizeArgumentEditorFromPointer);
  window.addEventListener('pointerup', stopArgumentEditorResizing);
  window.addEventListener('pointercancel', stopArgumentEditorResizing);
}

function resizeArgumentEditorWithKeyboard(event: KeyboardEvent, index: number): void {
  const argument = argumentsList.value[index];
  if (!argument) return;
  let nextHeight = argument.editorHeight;
  if (event.key === 'ArrowUp') {
    nextHeight -= 12;
  } else if (event.key === 'ArrowDown') {
    nextHeight += 12;
  } else if (event.key === 'Home') {
    nextHeight = MIN_ARGUMENT_EDITOR_HEIGHT;
  } else if (event.key === 'End') {
    nextHeight = MAX_ARGUMENT_EDITOR_HEIGHT;
  } else {
    return;
  }
  event.preventDefault();
  argument.editorHeight = clampArgumentEditorHeight(nextHeight);
  saveArgument(index);
}

function resetArgumentEditorHeight(index: number): void {
  const argument = argumentsList.value[index];
  if (!argument) return;
  argument.editorHeight = DEFAULT_ARGUMENT_EDITOR_HEIGHT;
  saveArgument(index);
}

const toWorkingArgument = (argument: DdpArgument): WorkingArgument => {
  const cloned = JSON.parse(JSON.stringify(argument)) as DdpArgument;
  return {
    ...cloned,
    key: crypto.randomUUID(),
    editorHeight: clampArgumentEditorHeight(
      cloned.editorHeight ?? DEFAULT_ARGUMENT_EDITOR_HEIGHT
    ),
    editorText:
      argument.type === 'array'
        ? JSON.stringify(argument.array ?? [], null, 2)
        : JSON.stringify(argument.json ?? {}, null, 2)
  };
};
const argumentsList = ref<WorkingArgument[]>(props.endpoint.args.map(toWorkingArgument));

const renderedDescription = computed(() =>
  markdown.render(props.endpoint.description || '*No documentation yet.*')
);

const locations = computed<LocationOption[]>(() => {
  const options: LocationOption[] = [];
  const appendFolders = (
    collection: Collection,
    folders: Folder[],
    parentLabel: string,
    parentFolderIds: string[]
  ): void => {
    for (const folder of folders) {
      const label = `${parentLabel} / ${folder.name}`;
      const folderIds = [...parentFolderIds, folder.id];
      options.push({
        value: JSON.stringify({ collectionId: collection.id, folderIds }),
        label,
        location: { collectionId: collection.id, folderIds }
      });
      appendFolders(
        collection,
        folder.children.filter((child): child is Folder => child.type === 'folder'),
        label,
        folderIds
      );
    }
  };

  for (const collection of props.connection.collections) {
    const rootLocation = { collectionId: collection.id, folderIds: [] };
    options.push({
      value: JSON.stringify(rootLocation),
      label: collection.name,
      location: rootLocation
    });
    appendFolders(
      collection,
      collection.children.filter((child): child is Folder => child.type === 'folder'),
      collection.name,
      []
    );
  }
  return options;
});

function saveEndpointType(): void {
  store.updateEndpoint(props.connection.id, props.endpoint.id, {
    endpointType: endpointType.value
  });
}

function saveName(): void {
  store.updateEndpoint(props.connection.id, props.endpoint.id, {
    name: endpointName.value,
    title: endpointName.value.trim() || props.endpoint.title
  });
}

function saveCollectionName(): void {
  store.updateEndpoint(props.connection.id, props.endpoint.id, {
    collection: collectionName.value
  });
}

function createArgument(type: ArgumentType = 'string'): WorkingArgument {
  return {
    key: crypto.randomUUID(),
    type,
    value: type === 'boolean' ? false : type === 'number' ? 0 : '',
    json: {},
    array: [],
    editorHeight: DEFAULT_ARGUMENT_EDITOR_HEIGHT,
    editorText: type === 'array' ? '[]' : '{}'
  };
}

function addArgument(): void {
  argumentsList.value.push(createArgument());
  saveArgument(argumentsList.value.length - 1);
}

function changeArgumentType(index: number): void {
  const argument = argumentsList.value[index];
  if (!argument) return;
  argument.value = argument.type === 'boolean' ? false : argument.type === 'number' ? 0 : '';
  argument.json = {};
  argument.array = [];
  argument.editorText = argument.type === 'array' ? '[]' : '{}';
  saveArgument(index);
}

function serialisableArgument(argument: WorkingArgument): DdpArgument {
  return {
    type: argument.type,
    value: argument.value,
    json: argument.json,
    array: argument.array,
    editorHeight: argument.editorHeight
  };
}

function saveArgument(index: number): void {
  const argument = argumentsList.value[index];
  if (!argument) return;
  store.saveArgument(
    props.connection.id,
    props.endpoint.id,
    index,
    serialisableArgument(argument)
  );
}

function saveJsonArgument(index: number): void {
  const argument = argumentsList.value[index];
  if (!argument) return;
  try {
    const parsed: unknown = JSON.parse(argument.editorText);
    if (argument.type === 'array') {
      if (!Array.isArray(parsed)) throw new Error('Expected an array');
      argument.array = parsed;
    } else {
      if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
        throw new Error('Expected an object');
      }
      argument.json = parsed as Record<string, unknown>;
    }
    saveArgument(index);
  } catch {
    // Monaco marks invalid JSON; the last valid value remains persisted.
  }
}

function removeArgument(index: number): void {
  argumentsList.value.splice(index, 1);
  store.removeArgument(props.connection.id, props.endpoint.id, index);
}

function requestArguments(): unknown[] {
  return argumentsList.value.map((argument) => {
    if (argument.type === 'object') return argument.json;
    if (argument.type === 'array') return argument.array;
    if (argument.type === 'number') return Number(argument.value);
    if (argument.type === 'boolean') return Boolean(argument.value);
    return argument.value ?? '';
  });
}

function formatResponse(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return JSON.stringify(value);
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function formatElapsed(milliseconds: number): string {
  if (milliseconds < 1000) return `${milliseconds.toFixed(2)} ms`;
  if (milliseconds < 60_000) return `${(milliseconds / 1000).toFixed(2)} s`;
  return `${(milliseconds / 60_000).toFixed(2)} m`;
}

async function send(): Promise<void> {
  saveName();
  saveCollectionName();
  if (!props.client) {
    notice('Connect to a Meteor server first.', 'warning');
    return;
  }
  if (!endpointName.value.trim()) {
    notice('Enter an endpoint name.', 'warning');
    return;
  }

  sending.value = true;
  const started = performance.now();
  try {
    let result: unknown;
    if (endpointType.value === 'method') {
      result = await props.client.call(endpointName.value, ...requestArguments());
    } else {
      if (!collectionName.value.trim()) {
        notice('Enter the publication collection name.', 'warning');
        return;
      }
      if (activeSubscription && (await activeSubscription.isOn?.())) {
        await activeSubscription.stop();
        props.client.stopChangeListeners?.();
      }
      activeSubscription = props.client.subscribe(endpointName.value, ...requestArguments());
      await activeSubscription.start();
      await activeSubscription.ready();
      result = props.client.collection(collectionName.value).reactive().data();
    }
    responseText.value = formatResponse(result);
    hasResponse.value = true;
  } catch (error) {
    responseText.value = formatResponse(
      error instanceof Error
        ? { name: error.name, message: error.message }
        : error
    );
    hasResponse.value = true;
  } finally {
    elapsedTime.value = formatElapsed(performance.now() - started);
    sending.value = false;
  }
}

function closeDocumentation(): void {
  editingDescription.value = false;
  descriptionDraft.value = props.endpoint.description;
  documentationOpen.value = false;
}

function handleDocumentationDialog(open: boolean): void {
  if (open) documentationOpen.value = true;
  else closeDocumentation();
}

function handleExpandedDialog(open: boolean): void {
  if (!open) expandedArgument.value = null;
}

function cancelDescription(): void {
  descriptionDraft.value = props.endpoint.description;
  editingDescription.value = false;
}

function saveDescription(): void {
  store.updateEndpoint(props.connection.id, props.endpoint.id, {
    description: descriptionDraft.value
  });
  editingDescription.value = false;
}

function openSaveDialog(): void {
  saveName();
  selectedLocation.value = locations.value[0]?.value ?? '';
  saveDialogOpen.value = true;
}

function saveToCollection(): void {
  saveName();
  const option = locations.value.find(({ value }) => value === selectedLocation.value);
  if (!option) {
    notice('Choose a collection or folder.', 'warning');
    return;
  }
  if (
    store.saveEndpointToCollection(
      props.connection.id,
      props.endpoint.id,
      option.location
    )
  ) {
    saveDialogOpen.value = false;
    notice('Endpoint saved to the collection.', 'success');
  } else {
    notice('Enter a unique endpoint name before saving.', 'error');
  }
}

onBeforeUnmount(async () => {
  stopResizing();
  stopArgumentEditorResizing();
  if (activeSubscription && (await activeSubscription.isOn?.())) {
    await activeSubscription.stop();
  }
});
</script>
