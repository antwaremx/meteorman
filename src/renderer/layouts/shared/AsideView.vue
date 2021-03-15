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
      <v-treeview v-model="tree" ref="treeViewRef" :items="connection.collections" activatable item-key="name" dense
                  open-on-click @update:active="activeItems">
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
  mounted() {
    console.log('activeCache: ',this.$refs.treeViewRef.activeCache);
    console.log('activeCache size: ',this.$refs.treeViewRef.activeCache.size);
    console.log('type activeCache: ',typeof this.$refs.treeViewRef.activeCache);
  },
  methods:{
    activeItems(items){
      console.log('activeItems: ', items);
    }
  }
};
</script>

<style scoped>

</style>