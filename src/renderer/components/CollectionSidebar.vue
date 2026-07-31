<template>
  <aside class="collections-sidebar">
    <v-toolbar color="transparent" density="compact" flat>
      <v-toolbar-title class="sidebar-title">Collections</v-toolbar-title>
      <v-btn
        aria-label="Import collections"
        icon="mdi-import"
        size="small"
        title="Import collections"
        variant="text"
        @click="importCollections"
      />
      <v-btn
        aria-label="Create collection"
        icon="mdi-plus"
        size="small"
        title="Create collection"
        variant="tonal"
        @click="openAddCollection"
      />
    </v-toolbar>
    <v-list
      v-if="connection.collections.length"
      class="collection-tree"
      density="compact"
      nav
    >
      <CollectionTreeNode
        v-for="collection in connection.collections"
        :key="collection.id"
        :connection-id="connection.id"
        :item="collection"
        @open-endpoint="$emit('open-endpoint', $event)"
        @export-collection="exportCollection"
      />
    </v-list>
    <div v-else class="empty-sidebar">
      <v-icon color="secondary" icon="mdi-folder-outline" size="34" />
      <strong>No collections yet</strong>
      <span>Import a collection or create your first one.</span>
      <v-btn
        color="secondary"
        prepend-icon="mdi-plus"
        size="small"
        variant="tonal"
        @click="openAddCollection"
      >
        New collection
      </v-btn>
    </div>

    <v-dialog v-model="addDialogOpen" max-width="440">
      <v-card>
        <v-card-title class="dialog-title">
          <span>New collection</span>
          <v-btn
            aria-label="Close"
            icon="mdi-close"
            size="small"
            variant="text"
            @click="addDialogOpen = false"
          />
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-text-field
            v-model.trim="newCollectionName"
            autofocus
            label="Collection name"
            prepend-inner-icon="mdi-folder-outline"
            @keydown.enter="confirmAddCollection"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="addDialogOpen = false">Cancel</v-btn>
          <v-btn color="primary" :disabled="!newCollectionName" @click="confirmAddCollection">
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </aside>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue';
import type { Collection, DdpConnection, Endpoint } from '../types';
import { useConnectionsStore } from '../stores/connections';
import { noticeKey } from '../notices';
import CollectionTreeNode from './CollectionTreeNode.vue';

const props = defineProps<{ connection: DdpConnection }>();
defineEmits<{ 'open-endpoint': [endpoint: Endpoint] }>();
const store = useConnectionsStore();
const notice = inject(noticeKey, () => undefined);
const addDialogOpen = ref(false);
const newCollectionName = ref('');

function openAddCollection(): void {
  newCollectionName.value = '';
  addDialogOpen.value = true;
}

function confirmAddCollection(): void {
  if (!newCollectionName.value) return;
  if (!store.addCollection(props.connection.id, newCollectionName.value)) {
    notice('That collection name is already in use.', 'error');
    return;
  }
  addDialogOpen.value = false;
}

async function importCollections(): Promise<void> {
  const files = await window.meteorman.importCollections();
  let imported = 0;
  for (const file of files) {
    try {
      const data: unknown = JSON.parse(file.content);
      if (store.importCollection(props.connection.id, data)) imported += 1;
      else notice(`${file.name} is invalid or already exists.`, 'warning');
    } catch {
      notice(`${file.name} is not valid JSON.`, 'error');
    }
  }
  if (imported) notice(`Imported ${imported} collection${imported === 1 ? '' : 's'}.`, 'success');
}

async function exportCollection(collection: Collection): Promise<void> {
  const saved = await window.meteorman.exportCollection(
    collection.name,
    JSON.stringify(collection, null, 2)
  );
  if (saved) notice(`Exported ${collection.name}.`, 'success');
}
</script>
