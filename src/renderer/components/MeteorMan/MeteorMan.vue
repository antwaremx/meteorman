<template>
  <v-container>
    <server-connection ref="serverRef" @onUpdateConnection="updateConnection"></server-connection>
    <div>
      <v-row>
        <v-col cols="3">
          <v-select :items="dppTypes" v-model="typeSelected" dense outlined/>
        </v-col>
        <v-col cols="7">
          <v-text-field v-if="typeSelected==='Method'" placeholder="method name"
                        v-model="meteorMethod.name" dense outlined type="text">
            <template v-slot:append>
              <v-btn icon @click="meteorMethod.name = ''" tabindex="-1" class="pb-5">
                <v-icon v-if="meteorMethod.name">mdi-close</v-icon>
              </v-btn>
            </template>
          </v-text-field>
          <v-text-field v-else placeholder="publication name"
                        v-model="publication.name" dense outlined clearable type="text"/>
          <v-text-field v-if="typeSelected==='Subscription'" placeholder="collection name"
                        v-model="publication.collectionName" dense outlined clearable type="text"/>
        </v-col>
        <v-col cols="2">
          <v-btn v-on:click="ddp()" color="error" elevation="0">
            Enviar
            <v-icon right small>
              mdi-send
            </v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <arguments ref="argsRef"></arguments>
        </v-col>
      </v-row>
    </div>
    <method-response ref="methodResponseRef"></method-response>
  </v-container>
</template>

<script>
import ServerConnection from '../ServerConnection/ServerConnection';
import Arguments from './Arguments';
import MethodResponse from './MethodResponse';

export default {
  name: 'MeteorMan',
  components: { MethodResponse, Arguments, ServerConnection },
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
      subscriptionResponse: '',
      isSubscriptionInProgress: null,
      connected: false,
      methodResponseParsed: ''
    };
  },
  methods: {
    updateConnection(value) {
      this.connected = value;
    },
    async callMethod(args) {
      try {
        this.methodResponseParsed = await this.$refs.serverRef.Meteor.call(this.meteorMethod.name, ...args);
        this.$refs.methodResponseRef.loadResponse(this.methodResponseParsed);
        this.methodResponse = JSON.stringify(this.methodResponseParsed, undefined, 4);
      } catch (exception) {
        console.error('meteor method error:', exception);
        this.methodResponseParsed = exception;
        this.$refs.methodResponseRef.loadResponse(this.methodResponseParsed);
        this.methodResponse = JSON.stringify(exception, undefined, 4);
      }
    },
    async subscribeToPublication(args) {
      try {
        if (this.isSubscriptionInProgress) {
          await this.isSubscriptionInProgress.stop();
        }
        this.isSubscriptionInProgress = this.$refs.serverRef.Meteor.subscribe(this.publication.name, ...args);
        await this.isSubscriptionInProgress.ready();
        const firstResponse = this.$refs.serverRef.Meteor.collection(this.publication.collectionName).filter(e => e).fetch();
        this.subscriptionResponse = JSON.stringify(firstResponse, undefined, 4);
        this.$refs.methodResponseRef.loadResponse(firstResponse);
        this.$refs.serverRef.Meteor.collection(this.publication.collectionName).filter(e => e).onChange(({ prev, next }) => {
          this.subscriptionResponse = JSON.stringify(next, undefined, 4);
        });
      } catch (exception) {
        console.error('subscription error: ', exception);
        this.subscriptionResponse = JSON.stringify(exception, undefined, 4);
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
    }
  }
};
</script>

<style>
.tree-view-item-key {
  color: #9e3731;
  font-weight: normal;
}

.tree-view-item-value-string, .tree-view-item-value-boolean {
  color: #2251a0;
}
.tree-view-item-value-number {
  color: #3c845c;
}
</style>
