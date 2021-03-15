<template>
  <div>
    <v-menu offset-y rounded="b-xl">
      <template v-slot:activator="{on,attrs}">
        <v-btn icon v-bind="attrs" v-on="on">
          <v-icon>mdi-dots-horizontal-circle-outline</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item link dense>
          <v-list-item-title @click="editCollection">Edit</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="element.children" link dense>
          <v-list-item-title @click="openAddFolderModal">Add folder</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="element.children" link dense>
          <v-list-item-title @click="openAddEndpointModal">Add endpoint</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="$parent.level===0" link dense>
          <v-list-item-title @click="exportCollection">Export</v-list-item-title>
        </v-list-item>
        <v-list-item link dense>
          <v-list-item-title @click="removeCollection">Remove</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <!--    Add folder -->
    <modal-question ref="addFolderRef" @onAccept="addFolder">
      <v-text-field v-model="folder.name" label="Folder name" outlined dense></v-text-field>
    </modal-question>
    <!--  Add endpoint  -->
    <modal-question ref="addEndpointRef" @onAccept="addEndpoint">
      <v-text-field v-model="endpoint.name" label="Endpoint name" outlined dense></v-text-field>
      <v-select :items="dppTypes" v-model="endpoint.endpointType" dense outlined class="start-addon"
                item-text="title" item-value="key"
                background-color="#ececec"/>
      <vue-simplemde v-model="endpoint.description" :configs="{placeholder:'Endpoint description (Optional)'}"
                     class="markdown-editor"/>
    </modal-question>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
import ModalQuestion from '../Utilities/Modals/ModalQuestion';

const { mapMutations } = createNamespacedHelpers('connections');

export default {
  name: 'CollectionOptions',
  components: { ModalQuestion },
  props: ['connection', 'element'],
  data() {
    return {
      dppTypes: [
        { key: 'method', title: 'Method' },
        { key: 'publication', title: 'Publication' }
      ],
      folder: {
        name: null,
        type: 'folder',
        children: []
      },
      endpoint: {
        args: [],
        type: 'endpoint',
        name: null,
        description: null,
        endpointType: 'method'
      }
    };
  },
  methods: {
    ...mapMutations(['removeCollectionOfConnection', 'addElementToCollection', 'addElementToFolder',
      'removeElementFromCollection']),
    editCollection() {
      console.log('Edit collection');
    },
    getFolderNames() {
      let itemInCollection = this.$parent;
      let folderNames = [itemInCollection.text];
      while (itemInCollection.level !== 0) {
        itemInCollection = itemInCollection.$parent;
        folderNames.unshift(itemInCollection.text);
      }
      return folderNames;
    },
    validateElementName(name, type) {
      const elementExists = this.element.children.find(el => el.name === name && el.type === type);
      if (!!elementExists) {
        this.$alert.showAlertSimple('error', 'Name already exists');
      }
      return !elementExists;
    },
    addElement(element) {
      if (this.$parent.level === 0) {
        this.addElementToCollection({
          connectionName: this.connection.title,
          collectionName: this.element.name,
          element
        });
      } else {
        const folderNames = this.getFolderNames();
        const collectionName = folderNames.shift();
        this.addElementToFolder({
          connectionName: this.connection.title,
          collectionName,
          folderNames,
          element
        });
      }
    },
    openAddFolderModal() {
      this.$refs.addFolderRef.title = `Add folder to ${ this.element.name } collection`;
      this.$refs.addFolderRef.dialog = true;
    },
    addFolder() {
      const folder = { ...this.folder };
      if (this.validateElementName(folder.name, folder.type)) {
        this.addElement(folder);
      }
      this.folder = {
        name: null,
        type: 'folder',
        children: []
      };
    },
    openAddEndpointModal() {
      this.$refs.addEndpointRef.title = `Add endpoint to ${ this.element.name } collection`;
      this.$refs.addEndpointRef.dialog = true;
    },
    addEndpoint() {
      const endpoint = { ...this.endpoint };
      if (this.validateElementName(endpoint.name, endpoint.type)) {
        this.addElement(endpoint);
      }
      this.endpoint = {
        args: [],
        type: 'endpoint',
        name: null,
        description: null,
        endpointType: 'method'
      };
    },
    exportCollection() {
      console.log('Export collection');
    },
    removeCollection() {
      if (this.$parent.level === 0) {
        const collectionIndex = this.connection.collections.findIndex(collection => collection.name === this.element.name);
        this.removeCollectionOfConnection({ connectionName: this.connection.title, collectionIndex });
      } else {
        const itemNames = this.getFolderNames();
        itemNames.pop();
        const collectionName = itemNames.shift();
        const element = { ...this.element };
        this.removeElementFromCollection({
          connectionName: this.connection.title,
          collectionName,
          itemNames,
          element
        });
      }
    }
  }
};
</script>

<style scoped>

</style>