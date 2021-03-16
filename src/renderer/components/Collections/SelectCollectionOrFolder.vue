<template>
  <div>
    <div class="subtitle-1 black--text">* Select a collection or folder to save to:</div>
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
  </div>
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
    indexesByFolder: []
  }),
  beforeMount() {
    this.items = this.connection.collections;
  },
  methods: {
    updateLocationOfEndpoint() {
      let newList = this.connection.collections;
      let folderTemporal = {};
      for (let index of this.indexesByFolder) {
        folderTemporal = newList[index];
        newList = folderTemporal.children;
      }
      this.folderTemporal = folderTemporal;
      this.items = newList;
    },
    initializeCurrentLocation(endpointId) {
      //suburmon-0-user.save \ rematch-endpoint | endpoint-1
      const patternLocation = endpointId.split('-');//TODO: Validate names of collections or elements to not include -
      const collectionName = patternLocation[0];
      if (this.connection.collections.find(collection => collection.name === collectionName)) {
        let indexesByFolder = [];
        indexesByFolder.push(this.connection.collections.findIndex(collection => collection.name === collectionName));
        const isInFolder = patternLocation.length === 3;
        if (isInFolder) {
          indexesByFolder = indexesByFolder.concat(patternLocation[1].split('').map(i => parseInt(i)));
        }
        this.indexesByFolder = indexesByFolder;
        this.updateLocationOfEndpoint();
      } else {
        this.indexesByFolder = [];
        this.folderTemporal = {};
        this.items = this.connection.collections;
      }
    },
    enterToFolder(indexFolder) {
      this.folderTemporal = this.items[indexFolder];
      this.indexesByFolder.push(indexFolder);
      this.items = this.folderTemporal.children;
    },
    exitFromFolder() {
      this.indexesByFolder.pop();
      this.updateLocationOfEndpoint();
    }
  }
};
</script>

<style scoped>

</style>