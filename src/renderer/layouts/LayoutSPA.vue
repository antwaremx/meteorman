<template>
  <v-container fluid>
    <header-view></header-view>
    <v-main>
      <v-row>
        <v-col cols="12" md="12">
          <v-tabs v-model="connectionTab">
            <v-tab v-for="ddp in connections" :key="ddp.title">
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
        <v-tab-item v-for="ddp in connections" :key="ddp.title">
          <v-row>
            <v-col cols="12" md="3">
              <aside-view id="aside"></aside-view>
            </v-col>
            <v-col cols="12" md="9">
              <router-view id="section" name="sectionView"></router-view>
            </v-col>
          </v-row>
        </v-tab-item>
      </v-tabs-items>
    </v-main>
  </v-container>
</template>

<script>
import HeaderView from './shared/HeaderView';
import AsideView from './shared/AsideView';

export default {
  name: 'LayoutSPA',
  components: {
    HeaderView,
    AsideView
  },
  data: () => ({
    length: 5,
    connectionTab: null,
    connections: [
      { title: 'Connection 1' }
    ]
  }),
  methods: {
    removeDdpConnection(connection) {
      if (this.connections.length > 1) {
        this.connections.splice(this.connections.indexOf(connection), 1);
      }
    },
    addDdpConnection() {
      let i = 1;
      let connectionName = 'Connection ' + i;
      while (this.connections.find(connection => connection.title === connectionName)) {
        i++;
        connectionName = 'Connection ' + i;
      }
      this.connections.push({ title: connectionName });
    }
  }
};
</script>

<style scoped>
#aside, #section {
  border: 1px solid;
}

</style>