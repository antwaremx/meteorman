<template>
  <div>
    <v-row>
      <v-col class="d-flex justify-space-between">
        <div>
          <h3>Collections</h3>
        </div>
        <div class="d-flex flex-row-reverse">
          <add-collection v-bind:connection="connection"></add-collection>
          <import-collections v-bind:connection="connection"></import-collections>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-treeview v-model="tree" :items="connection.collections" activatable item-key="id" dense
                  return-object open-on-click @update:active="activeItem" class="tree-view pb-5">
        <template v-slot:prepend="{ item, open }">
          <v-icon v-if="item.type==='folder'" class="mr-2">
            {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
          </v-icon>
          <v-icon v-else-if="item.type==='endpoint'" class="mr-2">
            {{ icons[item.endpointType] }}
          </v-icon>
        </template>
        <template v-slot:append="{item}">
          <collection-options :connection="connection" :element="item"></collection-options>
        </template>
      </v-treeview>
    </v-row>
  </div>
</template>

<script>
import AddCollection from '../../components/Collections/AddCollection';
import CollectionOptions from '../../components/Collections/CollectionOptions';
import { createNamespacedHelpers } from 'vuex';
import ImportCollections from '../../components/Collections/ImportCollections';

const { mapMutations } = createNamespacedHelpers('connections');

export default {
  name: 'AsideView',
  components: { ImportCollections, CollectionOptions, AddCollection },
  props: ['connection'],
  data: () => ({
    icons: {
      method: 'mdi-alpha-m-circle-outline',
      publication: 'mdi-alpha-p-circle-outline',
      collection: 'mdi-folder-table',
      folder: 'mdi-folder'
    },
    tree: []
  }),
  methods: {
    ...mapMutations(['openEndpointFromCollection']),
    activeItem(item) {
      const itemSelected = item[0];
      if (itemSelected && itemSelected.type === 'endpoint') {
        this.openEndpointFromCollection({
          connectionName: this.connection.title,
          endpoint: itemSelected
        });
        this.$root.$emit('updateSelectedTab', { ...itemSelected });
      }
    }
  }
};
</script>

<style scoped>
.tree-view {
  width: 100%;
}
</style>

<style>
.v-treeview-node__prepend {
  min-width: auto;
}
.v-application--is-ltr .v-treeview-node__prepend {
  margin-right: 0;
}
</style>