<template>
  <div class="tree-node">
    <v-list-item
      class="tree-row"
      :class="{ endpoint: item.type === 'endpoint' }"
      rounded="lg"
      @click="activate"
    >
      <template #prepend>
        <v-icon
          v-if="item.type !== 'endpoint'"
          :icon="expanded ? 'mdi-chevron-down' : 'mdi-chevron-right'"
          size="20"
        />
        <v-avatar
          v-else
          class="endpoint-mark"
          color="secondary"
          size="22"
          variant="tonal"
        >
          {{ item.endpointType === 'method' ? 'M' : 'P' }}
        </v-avatar>
      </template>
      <v-list-item-title>{{ item.name }}</v-list-item-title>
      <template #append>
        <v-menu v-model="menuOpen" location="bottom end">
          <template #activator="{ props: menuProps }">
            <v-btn
              v-bind="menuProps"
              aria-label="Collection actions"
              icon="mdi-dots-horizontal"
              size="x-small"
              variant="text"
              @click.stop
            />
          </template>
          <v-list density="compact" min-width="180">
            <v-list-item
              v-if="item.type !== 'endpoint'"
              prepend-icon="mdi-folder-plus-outline"
              title="Add folder"
              @click="openAction('folder')"
            />
            <v-list-item
              v-if="item.type !== 'endpoint'"
              prepend-icon="mdi-api"
              title="Add endpoint"
              @click="openAction('endpoint')"
            />
            <v-list-item
              v-if="item.type === 'collection'"
              prepend-icon="mdi-export"
              title="Export"
              @click="exportItem"
            />
            <v-divider />
            <v-list-item
              base-color="error"
              prepend-icon="mdi-delete-outline"
              title="Remove"
              @click="openAction('remove')"
            />
          </v-list>
        </v-menu>
      </template>
    </v-list-item>
    <div v-if="item.type !== 'endpoint' && expanded" class="tree-children">
      <CollectionTreeNode
        v-for="child in item.children"
        :key="child.id"
        :connection-id="connectionId"
        :item="child"
        @open-endpoint="$emit('open-endpoint', $event)"
        @export-collection="$emit('export-collection', $event)"
      />
    </div>

    <v-dialog v-model="actionDialogOpen" max-width="480">
      <v-card>
        <v-card-title class="dialog-title">
          <span>{{ actionTitle }}</span>
          <v-btn
            aria-label="Close"
            icon="mdi-close"
            size="small"
            variant="text"
            @click="actionDialogOpen = false"
          />
        </v-card-title>
        <v-divider />
        <v-card-text v-if="actionMode === 'remove'">
          Remove <strong>“{{ item.name }}”</strong>? This removes its nested contents from
          the current workspace.
        </v-card-text>
        <v-card-text v-else class="tree-dialog-fields">
          <v-text-field
            v-model.trim="draftName"
            autofocus
            :label="actionMode === 'folder' ? 'Folder name' : 'Endpoint name'"
            :prepend-inner-icon="actionMode === 'folder' ? 'mdi-folder-outline' : 'mdi-api'"
            @keydown.enter="submitAction"
          />
          <template v-if="actionMode === 'endpoint'">
            <v-select
              v-model="draftEndpointType"
              :items="endpointTypes"
              item-title="title"
              item-value="value"
              label="Endpoint type"
            />
            <v-textarea
              v-model="draftDescription"
              auto-grow
              label="Description"
              rows="3"
              variant="outlined"
            />
          </template>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="actionDialogOpen = false">Cancel</v-btn>
          <v-btn
            :color="actionMode === 'remove' ? 'error' : 'primary'"
            :disabled="actionMode !== 'remove' && !draftName"
            @click="submitAction"
          >
            {{ actionMode === 'remove' ? 'Remove' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { useConnectionsStore } from '../stores/connections';
import type { Collection, CollectionElement, Endpoint, EndpointType } from '../types';
import { noticeKey } from '../notices';

const props = defineProps<{
  connectionId: string;
  item: Collection | CollectionElement;
}>();
const emit = defineEmits<{
  'open-endpoint': [endpoint: Endpoint];
  'export-collection': [collection: Collection];
}>();
const store = useConnectionsStore();
const notice = inject(noticeKey, () => undefined);
const expanded = ref(true);
const menuOpen = ref(false);
const actionDialogOpen = ref(false);
const actionMode = ref<'folder' | 'endpoint' | 'remove'>('folder');
const draftName = ref('');
const draftEndpointType = ref<EndpointType>('method');
const draftDescription = ref('');
const endpointTypes = [
  { title: 'Method', value: 'method' },
  { title: 'Subscription', value: 'publication' }
];
const actionTitle = computed(() => {
  if (actionMode.value === 'folder') return `New folder in ${props.item.name}`;
  if (actionMode.value === 'endpoint') return `New endpoint in ${props.item.name}`;
  return `Remove ${props.item.name}`;
});

function activate(): void {
  menuOpen.value = false;
  if (props.item.type === 'endpoint') emit('open-endpoint', props.item);
  else expanded.value = !expanded.value;
}

function openAction(mode: 'folder' | 'endpoint' | 'remove'): void {
  menuOpen.value = false;
  actionMode.value = mode;
  draftName.value = '';
  draftEndpointType.value = 'method';
  draftDescription.value = '';
  actionDialogOpen.value = true;
}

function submitAction(): void {
  if (actionMode.value === 'remove') {
    store.removeCollectionElement(props.connectionId, props.item.id);
    actionDialogOpen.value = false;
    return;
  }
  if (!draftName.value) return;
  const saved =
    actionMode.value === 'folder'
      ? store.addFolder(props.connectionId, props.item.id, draftName.value)
      : store.addCollectionEndpoint(
          props.connectionId,
          props.item.id,
          draftName.value,
          draftEndpointType.value,
          draftDescription.value
        );
  if (!saved) {
    notice(
      `That ${actionMode.value === 'folder' ? 'folder' : 'endpoint'} name is already in use.`,
      'error'
    );
    return;
  }
  actionDialogOpen.value = false;
}

function exportItem(): void {
  menuOpen.value = false;
  if (props.item.type === 'collection') emit('export-collection', props.item);
}

</script>
