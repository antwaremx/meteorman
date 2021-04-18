<template>
  <v-container fluid>
    <server-connection ref="serverRef" @onUpdateConnection="updateConnection"></server-connection>
    <v-tabs v-model="endpointTab">
      <v-tab v-for="endpoint in connection.openEndpoints" :key="endpoint.id" class="endpoint-tab">
        {{ endpoint.title }}
        <v-icon x-small right @click="removeEndpoint(endpoint)">
          mdi-close
        </v-icon>
      </v-tab>
      <v-btn icon class="align-self-center mr-4" @click="addEndpoint">
        <v-icon color="primary">mdi-plus</v-icon>
      </v-btn>
    </v-tabs>
    <v-tabs-items v-model="endpointTab">
      <v-tab-item v-for="endpoint in connection.openEndpoints" :key="endpoint.id">
        <ddp-endpoint v-bind:connection="$refs.serverRef" v-bind:ddpConnection="connection"
                      v-bind:endpoint="endpoint"></ddp-endpoint>
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script>
import ServerConnection from '../components/ServerConnection/ServerConnection';
import DdpEndpoint from '../components/DdpClient/DdpEndpoint';
import { createNamespacedHelpers } from 'vuex';

const { mapMutations } = createNamespacedHelpers('connections');

export default {
  name: 'Home',
  components: { DdpEndpoint, ServerConnection },
  props: ['connection'],
  data() {
    return {
      connected: false,
      endpointTab: null
    };
  },
  beforeCreate() {
    this.$root.$on('updateSelectedTab', (data) => {
      //TODO: Validate only for current connection
      this.endpointTab = this.connection.openEndpoints.findIndex(openEndpoint => openEndpoint.id === data.id);
    });
  },
  beforeMount() {
    this.initializeOpenEndpoints({ connectionName: this.connection.title });
  },
  methods: {
    ...mapMutations(['initializeOpenEndpoints', 'addOpenEndpointToConnection', 'removeOpenEndpointOfConnection']),
    updateConnection(value) {
      //TODO: Add connection data to Vuex object.
      this.connected = value;
    },
    addEndpoint() {
      this.addOpenEndpointToConnection({ connectionName: this.connection.title });
    },
    removeEndpoint(endpoint) {
      this.removeOpenEndpointOfConnection({ connectionName: this.connection.title, openEndpointId: endpoint.id });
    }
  }
};
</script>

<style scoped>
.endpoint-tab {
  text-transform: initial !important;
}
</style>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

::-webkit-scrollbar {
  display: none;
}

.tree-view-item-key {
  color: #9e3731;
  font-weight: normal;
}

.tree-view-item-value-string, .tree-view-item-value-boolean {
  color: #2251a0;
}

.tree-view-item-value-number {
  color: #3c845c;
}

</style>
