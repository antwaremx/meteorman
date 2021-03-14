<template>
  <v-list dense>
    <v-subheader v-if="!indexesByFolder.length">All collections</v-subheader>
    <a v-else class="text-decoration-none text--accent-1" @click="exitFromFolder">
      <v-icon>mdi-menu-left</v-icon>
      {{ folderTemporal.name }}
    </a>
    <v-list-item v-for="(item, i) in items" :key="i">
      <template v-slot:default="{ active }">
        <v-list-item-icon>
          <v-icon v-if="item.type==='folder'">
            mdi-folder
          </v-icon>
          <v-icon v-else-if="item.type==='endpoint'">
            {{ icons[item.endpointType] }}
          </v-icon>
          <v-icon v-else>
            mdi-folder-table
          </v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title v-text="item.name"></v-list-item-title>
        </v-list-item-content>
        <v-list-item-action v-if="item.type!=='endpoint'">
          <v-btn x-small @click="enterToFolder(i)" icon>
            <v-icon x-small color="grey lighten-1">mdi-play</v-icon>
          </v-btn>
        </v-list-item-action>
      </template>
    </v-list-item>
  </v-list>
</template>

<script>
export default {
  name: 'SelectCollectionOrFolder',
  props: ['connection'],
  data: () => ({
    items: [],
    icons: {
      method: 'mdi-alpha-m-circle-outline',
      publication: 'mdi-alpha-p-circle-outline',
      collection: 'mdi-folder-table',
      folder: 'mdi-folder'
    },
    folderTemporal: {},
    selectedItem: 0,
    indexesByFolder: []
  }),
  beforeMount() {
    this.items = this.connection.collections;
  },
  methods: {
    enterToFolder(indexFolder) {
      this.folderTemporal = this.items[indexFolder];
      this.indexesByFolder.push(indexFolder);
      this.items = this.folderTemporal.children;
    },
    exitFromFolder() {
      this.indexesByFolder.pop();
      let newList = this.connection.collections;
      let folderTemporal = {};
      for (let index of this.indexesByFolder) {
        folderTemporal = newList[index];
        newList = folderTemporal.children;
      }
      this.folderTemporal = folderTemporal;
      if (this.folderTemporal.children) {
        this.items = this.folderTemporal.children;
      } else {
        this.items = newList;
      }
    }
  }
};
</script>

<style scoped>

</style>