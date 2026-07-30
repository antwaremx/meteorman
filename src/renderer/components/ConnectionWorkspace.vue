<template>
  <main class="workspace">
    <ServerConnection ref="server" />

    <div class="tabs-row endpoint-tabs" aria-label="Endpoints">
      <v-tabs
        v-model="selectedEndpointId"
        color="secondary"
        density="compact"
        show-arrows
      >
        <v-tab
          v-for="endpoint in connection.openEndpoints"
          :key="endpoint.id"
          :value="endpoint.id"
          class="app-tab"
        >
          <span class="tab-label">{{ endpoint.title }}</span>
          <v-icon
            class="tab-close"
            icon="mdi-close"
            size="16"
            role="button"
            aria-label="Close endpoint"
            tabindex="0"
            @click.stop="closeEndpoint(endpoint.id)"
            @keydown.enter.stop="closeEndpoint(endpoint.id)"
          />
        </v-tab>
      </v-tabs>
      <v-btn
        aria-label="Add endpoint"
        icon="mdi-plus"
        size="small"
        title="Add endpoint"
        variant="text"
        @click="addEndpoint"
      />
    </div>

    <div class="workspace-columns">
      <CollectionSidebar
        :connection="connection"
        @open-endpoint="openEndpoint"
      />
      <EndpointPanel
        v-if="selectedEndpoint"
        :key="selectedEndpoint.id"
        :connection="connection"
        :endpoint="selectedEndpoint"
        :client="server?.client"
      />
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useConnectionsStore } from '../stores/connections';
import type { DdpConnection, Endpoint } from '../types';
import ServerConnection from './ServerConnection.vue';
import CollectionSidebar from './CollectionSidebar.vue';
import EndpointPanel from './EndpointPanel.vue';

const props = defineProps<{ connection: DdpConnection }>();
const store = useConnectionsStore();
const server = ref<InstanceType<typeof ServerConnection>>();
const selectedEndpointId = ref(props.connection.openEndpoints[0]?.id ?? '');
const selectedEndpoint = computed(() =>
  props.connection.openEndpoints.find(({ id }) => id === selectedEndpointId.value)
);

watch(
  () => props.connection.openEndpoints.map(({ id }) => id),
  (ids) => {
    if (!ids.includes(selectedEndpointId.value)) selectedEndpointId.value = ids[0] ?? '';
  }
);

function addEndpoint(): void {
  const endpoint = store.addEndpoint(props.connection.id);
  if (endpoint) selectedEndpointId.value = endpoint.id;
}

function closeEndpoint(endpointId: string): void {
  store.closeEndpoint(props.connection.id, endpointId);
}

function openEndpoint(endpoint: Endpoint): void {
  store.openEndpoint(props.connection.id, endpoint);
  selectedEndpointId.value = endpoint.id;
}
</script>
