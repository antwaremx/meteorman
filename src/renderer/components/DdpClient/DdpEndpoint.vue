<template>
  <div class="connection-wrapper">
    <v-row>
      <v-col cols="12" md="12">
        <div v-if="!editingDescription">
          <a class="text-decoration-none text--accent-1" @click="editingDescription=true">
            {{ !endpoint.description ? 'Add' : 'Edit' }} description
          </a>
          <markdown-it-vue-light class="md-body markdown-viewer" :content="endpoint.description || ''"/>
        </div>
        <div v-else>
          <vue-simplemde class="markdown-editor" v-model="description.current"/>
          <div class="d-flex justify-end">
            <v-btn small outlined color="error" class="mr-2" @click="cancelDescription">Cancel</v-btn>
            <v-btn small outlined color="success" @click="saveDescription">Save</v-btn>
          </div>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="d-flex">
        <div class="small-field">
          <v-select :items="dppTypes" v-model="typeSelected" dense outlined class="start-addon"
                    item-text="name" item-value="key"
                    background-color="#ececec"/>
        </div>
        <v-text-field v-if="typeSelected==='method'" placeholder="Enter method name" class="end-addon"
                      background-color="#ececec" @blur="saveNameOfEndpoint(meteorMethod.name,'method')"
                      v-model="meteorMethod.name" dense outlined type="text">
          <template v-slot:append>
            <v-btn icon @click="meteorMethod.name = ''" tabindex="-1" class="pb-5">
              <v-icon v-if="meteorMethod.name">mdi-close</v-icon>
            </v-btn>
          </template>
        </v-text-field>
        <v-text-field v-else placeholder="Enter publication name" class="mid-addon"
                      background-color="#ececec" @blur="saveNameOfEndpoint(publication.name,'publication')"
                      v-model="publication.name" dense outlined clearable type="text"/>
        <v-text-field v-if="typeSelected==='publication'" placeholder="Enter collection name" class="end-addon"
                      background-color="#ececec" @blur="saveCollectionNameOfPublication"
                      v-model="publication.collectionName" dense outlined clearable type="text"/>
        <v-btn v-on:click="ddp()" class="ml-2" color="#387be5" dark elevation="0" height="40px">
          Send
          <v-icon right small>mdi-send</v-icon>
        </v-btn>
        <div>
          <v-btn class="ml-2" color="primary" outlined elevation="0" height="40px" @click="openSaveEndpoint">Save
          </v-btn>
          <modal-question ref="saveEndpointRef">
            <v-text-field v-if="typeSelected==='method'"
                          @blur="saveNameOfEndpoint(meteorMethod.name,'method')"
                          v-model="meteorMethod.name" label="* Endpoint name" outlined
                          dense></v-text-field>
            <v-text-field v-else v-model="publication.name"
                          @blur="saveNameOfEndpoint(publication.name,'publication')"
                          label="* Endpoint name" outlined dense></v-text-field>
            <vue-simplemde v-model="description.current" :configs="{placeholder:'Endpoint description (Optional)'}"
                           class="markdown-editor"/>
            <select-collection-or-folder ref="folderSelectedRef"
                                         v-bind:connection="ddpConnection"></select-collection-or-folder>
            <template v-slot:questionButtons>
              <v-btn color="error" outlined depressed v-on:click="$refs.saveEndpointRef.dialog=false">
                Cancel
              </v-btn>
              <v-btn color="primary" depressed v-on:click="saveEndpoint">
                Accept
              </v-btn>
            </template>
          </modal-question>
        </div>
      </v-col>
    </v-row>
    <Split style="height: calc(100vh - 250px);" direction="vertical">
      <SplitArea>
        <arguments ref="argsRef" v-bind:connection="ddpConnection" v-bind:endpoint="endpoint"></arguments>
      </SplitArea>
      <SplitArea>
        <method-response ref="methodResponseRef"></method-response>
      </SplitArea>
    </Split>
  </div>
</template>

<script>
import { performance } from 'perf_hooks';
import MethodResponse from './MethodResponse';
import Arguments from './Arguments';
import MarkdownItVueLight from 'markdown-it-vue/dist/markdown-it-vue-light.umd.min.js';
import 'markdown-it-vue/dist/markdown-it-vue-light.css';
import SaveEndpoint from '../Collections/SaveEndpoint';
import { createNamespacedHelpers } from 'vuex';
import ModalQuestion from '../Utilities/Modals/ModalQuestion';
import SelectCollectionOrFolder from '../Collections/SelectCollectionOrFolder';

const { mapMutations } = createNamespacedHelpers('connections');

export default {
  name: 'DdpEndpoint',
  components: { SelectCollectionOrFolder, ModalQuestion, SaveEndpoint, MethodResponse, Arguments, MarkdownItVueLight },
  props: ['connection', 'ddpConnection', 'endpoint'],
  data() {
    return {
      dppTypes: [
        { name: 'Method', key: 'method' },
        { name: 'Subscription', key: 'publication' }
      ],
      typeSelected: 'method',
      meteorMethod: {
        name: null,
        args: null
      },
      publication: {
        name: null,
        collectionName: null
      },
      methodResponse: '',
      isSubscriptionInProgress: null,
      connected: false,
      methodResponseParsed: '',
      defaultHeight: window.innerHeight - 288,
      editingDescription: false,
      description: {
        current: null
      }
    };
  },
  beforeMount() {
    this.description.current = this.endpoint.description;
    this.typeSelected = this.endpoint.endpointType || 'method';
    if (this.endpoint.endpointType === 'method') {
      this.meteorMethod.name = this.endpoint.name;
    } else {
      this.publication.name = this.endpoint.name;
      this.publication.collectionName = this.endpoint.collection;
    }
  },
  methods: {
    ...mapMutations(['saveDescriptionOfOpenEndpoint', 'saveNameOfOpenEndpoint', 'saveCollectionNameOfOpenEndpoint',
      'saveOpenEndpointInCollection']),
    updateConnection(value) {
      this.connected = value;
    },
    async callMethod(args) {
      const initialTime = performance.now();
      try {
        this.methodResponseParsed = await this.connection.Meteor.call(this.meteorMethod.name, ...args);
        this.$refs.methodResponseRef.loadResponse(this.methodResponseParsed, performance.now() - initialTime);
        this.methodResponse = JSON.stringify(this.methodResponseParsed, undefined, 4);
      } catch (exception) {
        console.error('meteor method error:', exception);
        this.methodResponseParsed = exception;
        this.$refs.methodResponseRef.loadResponse(this.methodResponseParsed, performance.now() - initialTime);
        this.methodResponse = JSON.stringify(exception, undefined, 4);
      }
    },
    async subscribeToPublication(args) {
      try {
        if (this.isSubscriptionInProgress) {
          if (await this.isSubscriptionInProgress.isOn()) {
            await this.isSubscriptionInProgress.stop();
            this.connection.Meteor.stopChangeListeners();
          }
        }
        this.isSubscriptionInProgress = this.connection.Meteor.subscribe(this.publication.name, ...args);
        const initialTime = performance.now();
        await this.isSubscriptionInProgress.start();
        await this.isSubscriptionInProgress.ready();
        const elapsedTime = performance.now() - initialTime;
        const firstResponse = this.connection.Meteor.collection(this.publication.collectionName).filter(e => e).fetch();
        this.$refs.methodResponseRef.loadResponse(firstResponse, elapsedTime);
        this.connection.Meteor.collection(this.publication.collectionName).filter(e => e)
            .onChange(({ prev, next }) => {
              this.$refs.methodResponseRef.loadResponse(next);
            });
      } catch (exception) {
        console.error('subscription error: ', exception);
        this.$refs.methodResponseRef.loadResponse(exception);
      }
    },
    loadArguments(args) {
      let finalArgs = [];
      for (let arg of args) {
        switch (arg.type.name) {
          case 'object':
            finalArgs.push(arg.json);
            break;
          case 'array':
            finalArgs.push(arg.array);
            break;
          case 'string':
            finalArgs.push(arg.value);
            break;
          case 'boolean':
            finalArgs.push(!!arg.value);
            break;
          case 'number':
            finalArgs.push(arg.value);
            break;
        }
      }
      return finalArgs;
    },
    ddp() {
      const args = this.loadArguments(this.$refs.argsRef.args);
      if (this.typeSelected === 'method') {
        this.callMethod(args);
      } else {
        this.subscribeToPublication(args);
      }
    },
    cancelDescription() {
      this.description.current = this.endpoint.description;
      this.editingDescription = false;
    },
    saveDescription() {
      this.saveDescriptionOfOpenEndpoint({
        connectionName: this.ddpConnection.title,
        openEndpointId: this.endpoint.id,
        description: this.description.current
      });
      this.editingDescription = false;
    },
    saveNameOfEndpoint(name, endpointType) {
      this.saveNameOfOpenEndpoint({
        connectionName: this.ddpConnection.title,
        openEndpointId: this.endpoint.id,
        name,
        endpointType
      });
    },
    saveCollectionNameOfPublication() {
      this.saveCollectionNameOfOpenEndpoint({
        connectionName: this.ddpConnection.title,
        openEndpointId: this.endpoint.id,
        collectionName: this.publication.collectionName
      });
    },
    openSaveEndpoint() {
      this.$refs.saveEndpointRef.title = 'Save endpoint';
      this.$refs.folderSelectedRef.initializeCurrentLocation(this.endpoint.id);
      this.$refs.saveEndpointRef.dialog = true;
    },
    validateEndpointToBeSaved() {
      let isValid = true;
      if (!this.$refs.folderSelectedRef.indexesByFolder.length && !this.endpoint.name) {
        this.$alert.showAlertSimple('error', 'Please fill all required fields');
        isValid = false;
      } else if (!!this.$refs.folderSelectedRef.folderTemporal.children
          .find(endpoint => endpoint.name === this.endpoint.name && endpoint.id !== this.endpoint.id)) {
        this.$alert.showAlertSimple('error', 'Endpoint name already exists');
        isValid = false;
      }
      return isValid;
    },
    saveEndpoint() {
      if (this.validateEndpointToBeSaved()) {//TODO: Implement vee-validate
        this.saveOpenEndpointInCollection({
          connectionName: this.ddpConnection.title,
          openEndpoint: this.endpoint,
          indexesByFolder: this.$refs.folderSelectedRef.indexesByFolder
        });
        this.$refs.saveEndpointRef.dialog = false;
      }
    }
  }
};
</script>
<style scoped>
.connection-wrapper /deep/ .v-input__control {
  height: 40px;
}

.markdown-viewer /deep/ code {
  color: initial !important;
  font-weight: initial !important;
  background-color: initial !important;
}
</style>