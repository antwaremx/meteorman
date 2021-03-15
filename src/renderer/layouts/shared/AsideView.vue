<template>
  <div>
    <v-row>
      <v-col>
        <h3>Collections</h3>
      </v-col>
      <v-col class="d-flex justify-end">
        <add-collection v-bind:connection="connection"></add-collection>
      </v-col>
    </v-row>
    <v-row>
      <v-treeview v-model="tree" :items="connection.collections" activatable item-key="id" dense
                  return-object open-on-click @update:active="activeItem">
        <template v-slot:prepend="{ item, open }">
          <v-icon v-if="item.type==='folder'">
            {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
          </v-icon>
          <v-icon v-else-if="item.type==='endpoint'">
            {{ icons[item.endpointType] }}
          </v-icon>
          <v-icon v-else>
            mdi-folder-table
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

const { mapMutations } = createNamespacedHelpers('connections');

export default {
  name: 'AsideView',
  components: { CollectionOptions, AddCollection },
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
      console.log('activeItem: ', itemSelected);
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

</style>