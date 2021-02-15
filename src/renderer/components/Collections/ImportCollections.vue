<template>
  <div>
    <v-btn text outlined @click="openImportCollectionsModal">Import</v-btn>
    <modal-accept ref="importCollectionRef" @onAccept="importCollections">
      <v-file-input
          v-model="files"
          color="primary"
          counter
          label="Collections of endpoints"
          placeholder="Select your collections"
          prepend-icon="mdi-text-box-multiple"
          multiple
          outlined
          accept="application/json"
          :show-size="1000">
        <template v-slot:selection="{ index, text }">
          <v-chip v-if="index < 2" color="primary" dark label small>
            {{ text }}
          </v-chip>

          <span v-else-if="index === 2" class="overline grey--text text--darken-3 mx-2">
        +{{ files.length - 2 }} File(s)
      </span>
        </template>
      </v-file-input>
    </modal-accept>
  </div>
</template>

<script>
import ModalAccept from '../Utilities/Modals/ModalAccept';
import fs from 'fs';

export default {
  name: 'ImportCollections',
  components: { ModalAccept },
  data() {
    return {
      files: []
    };
  },
  methods: {
    openImportCollectionsModal() {
      this.$refs.importCollectionRef.title = 'Import';
      this.$refs.importCollectionRef.dialog = true;
    },
    importCollections() {
      console.log('finished import: ', this.files);
      try {
        for (let file of this.files) {
          const data = fs.readFileSync(file.path, { encoding: 'utf8', flag: 'r' });
          const jsonCollection = JSON.parse('' + data);
          console.log('data: ', jsonCollection);
        }
      } catch (exception) {
        console.error('Ocurrió un error al importar las colecciones: ', exception);
      }
    }
  }
};
</script>

<style scoped>

</style>