<template>
  <div>
    <v-btn color="primary" icon @click="openAddCollectionModal">
      <v-icon>mdi-plus</v-icon>
    </v-btn>
    <modal-question ref="addCollectionRef" @onAccept="addCollection" @onCancel="resetForm">
      <v-text-field v-model="collection.name" label="Collection name" outlined dense></v-text-field>
      <vue-simplemde v-model="collection.description" :configs="{placeholder:'Collection description (Optional)'}"
                     class="markdown-editor"/>
    </modal-question>
  </div>
</template>

<script>
import ModalQuestion from '../Utilities/Modals/ModalQuestion';

import { createNamespacedHelpers } from 'vuex';

const { mapMutations } = createNamespacedHelpers('connections');

export default {
  name: 'AddCollection',
  components: { ModalQuestion },
  props: ['connection'],
  data() {
    return {
      collection: {
        name: null,
        description: null,
        children: []
      }
    };
  },
  methods: {
    ...mapMutations(['addCollectionToConnection']),
    openAddCollectionModal() {
      this.$refs.addCollectionRef.title = 'Add collection';
      this.$refs.addCollectionRef.dialog = true;
    },
    validateNewCollection() {
      let isValid = true;
      if (this.connection.collections.find(collection => collection.name === this.collection.name)) {
        isValid = false;
        this.$alert.showAlertSimple('error', 'This collection name is already in use');
      }
      return isValid;
    },
    addCollection() {
      if (this.validateNewCollection()) {
        const collection = { ...this.collection };
        this.addCollectionToConnection({ connectionName: this.connection.title, collection });
        this.resetForm();
      }
    },
    resetForm() {
      this.collection = {
        name: null,
        description: null,
        children: []
      };
    }
  }
};
</script>

<style scoped>

</style>