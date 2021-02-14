<template>
  <v-container fluid>
    <server-connection ref="serverRef" @onUpdateConnection="updateConnection"></server-connection>
    <v-tabs v-model="endpointTab">
      <v-tab v-for="endpoint in endpoints" :key="endpoint.title">
        {{ endpoint.title }}
        <v-icon x-small right @click="removeEndpoint(endpoint)">
          mdi-close
        </v-icon>
      </v-tab>
      <v-btn icon class="align-self-center mr-4" @click="addEndpoint">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-tabs>
    <v-tabs-items v-model="endpointTab">
      <v-tab-item v-for="endpoint in endpoints" :key="endpoint.title">
        <ddp-endpoint v-bind:connection="$refs.serverRef"></ddp-endpoint>
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script>
import ServerConnection from '../components/ServerConnection/ServerConnection';
import DdpEndpoint from '../components/DdpClient/DdpEndpoint';

export default {
  name: 'Home',
  components: { DdpEndpoint, ServerConnection },
  data() {
    return {
      connected: false,
      endpointTab: null,
      endpoints: [
        { title: 'Endpoint 1' }
      ]
    };
  },
  methods: {
    updateConnection(value) {
      this.connected = value;
    },
    removeEndpoint(connection) {
      if (this.endpoints.length > 1) {
        this.endpoints.splice(this.endpoints.indexOf(connection), 1);
      }
    },
    addEndpoint() {
      let i = 1;
      let endpointName = 'Endpoint ' + i;
      while (this.endpoints.find(endpoint => endpoint.title === endpointName)) {
        i++;
        endpointName = 'Endpoint ' + i;
      }
      this.endpoints.push({ title: endpointName });
    }
  }
};
</script>

<style scoped>

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
