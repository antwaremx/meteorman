<template>
  <v-container fluid>
    <header-view id="headerView"></header-view>
    <v-main>
      <v-row>
        <v-col cols="12" md="12">
          <v-tabs v-model="connectionTab" class="connection-tabs">
            <v-tab v-for="ddp in ddpConnections" :key="ddp.title">
              {{ ddp.title }}
              <v-icon x-small right @click="removeDdpConnection(ddp)">
                mdi-close
              </v-icon>
            </v-tab>
            <v-btn icon class="align-self-center mr-4" @click="addDdpConnection">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-tabs>
        </v-col>
      </v-row>
      <v-tabs-items v-model="connectionTab">
        <v-tab-item v-for="ddp in ddpConnections" :key="ddp.title">
            <Split class="split-area-left">
              <SplitArea :size="25">
                <aside-view id="aside" v-bind:connection="ddp"></aside-view>
              </SplitArea>
              <SplitArea :size="75">
                <router-view id="section" v-bind:connection="ddp" name="sectionView"></router-view>
              </SplitArea>
            </Split>
        </v-tab-item>
      </v-tabs-items>
    </v-main>
  </v-container>
</template>

<script>
import HeaderView from './shared/HeaderView';
import AsideView from './shared/AsideView';
import { createNamespacedHelpers } from 'vuex';

const { mapState, mapMutations } = createNamespacedHelpers('connections');

export default {
  name: 'LayoutSPA',
  components: {
    HeaderView,
    AsideView
  },
  data: () => ({
    connectionTab: null
  }),
  beforeMount() {
    this.initializeConnections();
  },
  computed: {
    ...mapState(['ddpConnections'])
  },
  methods: {
    ...mapMutations(['initializeConnections', 'addConnection', 'removeConnection']),
    addDdpConnection() {
      this.addConnection();
    },
    removeDdpConnection(connection) {
      this.removeConnection(connection.title);
    }
  }
};
</script>

<style scoped>

.split-area-left {
  height: calc(100vh - 120px);
}
.connection-tabs {
  border-bottom: 1px solid #eee;
}
#headerView{
  -webkit-app-region: drag;
}
</style>
