<template>
  <div class="connection-wrapper">
    <v-row>
      <v-col cols="12" md="12">
        <div v-if="!editingDescription">
          <a class="text-decoration-none text--accent-1" @click="editingDescription=true">
            {{ !description.saved ? 'Add' : 'Edit' }} description
          </a>
          <markdown-it-vue-light class="md-body markdown-viewer" :content="description.saved"/>
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
                    background-color="#ececec"/>
        </div>
        <v-text-field v-if="typeSelected==='Method'" placeholder="Enter method name" class="end-addon"
                      background-color="#ececec"
                      v-model="meteorMethod.name" dense outlined type="text">
          <template v-slot:append>
            <v-btn icon @click="meteorMethod.name = ''" tabindex="-1" class="pb-5">
              <v-icon v-if="meteorMethod.name">mdi-close</v-icon>
            </v-btn>
          </template>
        </v-text-field>
        <v-text-field v-else placeholder="Enter publication name" class="mid-addon"
                      background-color="#ececec"
                      v-model="publication.name" dense outlined clearable type="text"/>
        <v-text-field v-if="typeSelected==='Subscription'" placeholder="Enter collection name" class="end-addon"
                      background-color="#ececec"
                      v-model="publication.collectionName" dense outlined clearable type="text"/>
        <v-btn v-on:click="ddp()" class="ml-2" color="#387be5" dark elevation="0" height="40px">
          Send
          <v-icon right small>mdi-send</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <Split style="height: calc(100vh - 250px);" direction="vertical">
      <SplitArea>
        <arguments ref="argsRef"></arguments>
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

export default {
  name: 'DdpEndpoint',
  components: { MethodResponse, Arguments, MarkdownItVueLight },
  props: ['connection'],
  data() {
    return {
      dppTypes: [
        'Method',
        'Subscription'
      ],
      typeSelected: 'Method',
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
        saved: '',
        current: null
      }
    };
  },
  methods: {
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
      if (this.typeSelected === 'Method') {
        this.callMethod(args);
      } else {
        this.subscribeToPublication(args);
      }
    },
    cancelDescription() {
      this.description.current = this.description.saved;
      this.editingDescription = false;
    },
    saveDescription() {
      this.description.saved = this.description.current;
      this.editingDescription = false;
    }
  }
};
</script>
<style scoped>
.connection-wrapper /deep/ .v-input__control {
  height: 40px;
}

.markdown-editor /deep/ code {
  background-color: initial !important;
  color: initial !important;
  padding: initial !important;
  border-radius: initial !important;
  font-size: initial !important;
  font-weight: initial !important;
}

.markdown-viewer /deep/ code {
  color: initial !important;
  font-weight: initial !important;
}
</style>