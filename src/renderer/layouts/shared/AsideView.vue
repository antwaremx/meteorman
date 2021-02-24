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
      <v-treeview v-model="tree" :open="initiallyOpen" :items="connection.collections"
                  activatable item-key="name" dense open-on-click>
        <template v-slot:prepend="{ item, open }">
          <v-icon v-if="!item.icon">
            mdi-folder-table
          </v-icon>
          <v-icon v-else>
            {{ icons[item.icon] }}
          </v-icon>
        </template>
        <template v-slot:append="{item}">
          <v-icon small @click="removeCollection(item.name)" right>mdi-close</v-icon>
        </template>
      </v-treeview>
    </v-row>
  </div>
</template>

<script>
import AddCollection from '../../components/Collections/AddCollection';
import { createNamespacedHelpers } from 'vuex';

const { mapMutations } = createNamespacedHelpers('connections');

export default {
  name: 'AsideView',
  components: { AddCollection },
  props: ['connection'],
  data: () => ({
    initiallyOpen: ['public'],
    icons: {
      method: 'mdi-alpha-m-circle-outline',
      publication: 'mdi-alpha-p-circle-outline',
      collection: 'mdi-folder-table'
    },
    tree: [],
    collections: [
      {
        name: 'public',
        children: [
          {
            name: 'player.signup',
            icon: 'method'
          },
          {
            name: 'verificationCode.generate',
            icon: 'publication'
          }
        ]
      },
      {
        name: 'Users',
        icon: 'collection'
      }
    ]
  }),
  methods: {
    ...mapMutations(['removeCollectionOfConnection']),
    removeCollection(collectionName) {
      const collectionIndex = this.connection.collections.findIndex(collection => collection.name === collectionName);
      this.removeCollectionOfConnection({ connectionName: this.connection.title, collectionIndex });
    }
  }
};
</script>

<style scoped>

</style>