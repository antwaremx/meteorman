<template>
  <v-app class="app-shell">
    <v-toolbar class="app-header" color="primary" density="compact" flat>
      <v-spacer />
      <img :src="logo" alt="Meteorman" />
      <v-spacer />
    </v-toolbar>

    <div class="app-content">
      <div class="tabs-row connection-tabs" aria-label="Connections">
        <v-tabs
          v-model="selectedConnectionId"
          color="secondary"
          density="compact"
          show-arrows
        >
          <v-tab
            v-for="connection in store.ddpConnections"
            :key="connection.id"
            :value="connection.id"
            class="app-tab"
          >
            <span class="tab-label">{{ connection.title }}</span>
            <v-icon
              class="tab-close"
              icon="mdi-close"
              size="16"
              role="button"
              aria-label="Close connection"
              tabindex="0"
              @click.stop="removeConnection(connection.id)"
              @keydown.enter.stop="removeConnection(connection.id)"
            />
          </v-tab>
        </v-tabs>
        <v-btn
          aria-label="Add connection"
          icon="mdi-plus"
          size="small"
          title="Add connection"
          variant="text"
          @click="addConnection"
        />
      </div>

      <ConnectionWorkspace
        v-if="selectedConnection"
        :key="selectedConnection.id"
        :connection="selectedConnection"
      />
    </div>

    <v-snackbar
      v-model="noticeVisible"
      :color="notice?.kind ?? 'info'"
      location="bottom end"
      :timeout="5000"
      rounded="lg"
    >
      <div class="notice-content">
        <v-icon :icon="noticeIcon" size="20" />
        <span>{{ notice?.message }}</span>
      </div>
      <template #actions>
        <v-btn
          aria-label="Dismiss notification"
          icon="mdi-close"
          size="small"
          variant="text"
          @click="noticeVisible = false"
        />
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, provide, ref, watch } from 'vue';
import { useConnectionsStore } from './stores/connections';
import ConnectionWorkspace from './components/ConnectionWorkspace.vue';
import { noticeKey, type NoticeKind } from './notices';
import logo from './assets/logobn.png';

const store = useConnectionsStore();

const selectedConnectionId = ref(store.ddpConnections[0]?.id ?? '');
const selectedConnection = computed(() =>
  store.ddpConnections.find(({ id }) => id === selectedConnectionId.value)
);
const notice = ref<{ message: string; kind: NoticeKind } | null>(null);
const noticeVisible = ref(false);
const noticeIcon = computed(() => {
  if (notice.value?.kind === 'success') return 'mdi-check-circle-outline';
  if (notice.value?.kind === 'warning') return 'mdi-alert-outline';
  if (notice.value?.kind === 'error') return 'mdi-alert-circle-outline';
  return 'mdi-information-outline';
});

provide(noticeKey, (message, kind = 'info') => {
  notice.value = { message, kind };
  noticeVisible.value = true;
});

const unsubscribe = store.$subscribe(
  (_mutation, state) => {
    localStorage.setItem('meteorman.connections.v3', JSON.stringify(state));
  },
  { detached: true }
);

watch(
  () => store.ddpConnections.map(({ id }) => id),
  (ids) => {
    if (!ids.includes(selectedConnectionId.value)) {
      selectedConnectionId.value = ids[0] ?? '';
    }
  }
);

function addConnection(): void {
  selectedConnectionId.value = store.addConnection().id;
}

function removeConnection(connectionId: string): void {
  store.removeConnection(connectionId);
}

onBeforeUnmount(() => {
  unsubscribe();
});
</script>
