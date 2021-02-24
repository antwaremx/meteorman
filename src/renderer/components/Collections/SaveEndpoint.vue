<template>
  <div>
    <v-btn class="ml-2" color="primary" outlined elevation="0" height="40px" @click="openSaveEndpoint">Save</v-btn>
    <modal-question ref="saveEndpointRef" @onAccept="saveEndpoint">
      <v-text-field v-model="endpoint.name" label="Endpoint name" outlined dense></v-text-field>
      <vue-simplemde v-model="endpoint.description" :configs="{placeholder:'Endpoint description (Optional)'}"
                     class="markdown-editor"/>
    </modal-question>
  </div>
</template>

<script>
import ModalQuestion from '../Utilities/Modals/ModalQuestion';

export default {
  name: 'SaveEndpoint',
  components: { ModalQuestion },
  data() {
    return {
      endpoint: {
        name: null,
        description: null
      }
    };
  },
  methods: {
    openSaveEndpoint() {
      this.$refs.saveEndpointRef.title = 'Save endpoint request';
      this.$refs.saveEndpointRef.dialog = true;
    },
    saveEndpoint() {

    }
  }
};
</script>

<style>

</style>