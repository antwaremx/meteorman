<template>
  <v-container>
    <server-connection ref="serverRef" @onUpdateConnection="updateConnection"></server-connection>
    <div v-if="connected">
      <v-row>
        <v-col cols="2">
          <v-select :items="dppTypes" v-model="typeSelected" dense outlined/>
        </v-col>
        <v-col cols="8">
          <v-text-field placeholder="method name" v-model="meteorMethod.name" dense outlined clearable type="text"/>
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
      <v-row>
        <v-col cols="12">
          <v-textarea
              v-model="responseMethod"
              outlined
              label="Reponse"
              rows="10"
          ></v-textarea>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
import ServerConnection from '../ServerConnection/ServerConnection';
import Arguments from './Arguments';

export default {
  name: 'MeteorMan',
  components: { Arguments, ServerConnection },
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
      responseMethod: '',
      connected: false
    };
  },
  methods: {
    updateConnection(value) {
      this.connected = value;
    },
    async callMethod(args) {
      try {
        const res = await this.$refs.serverRef.Meteor.call(this.meteorMethod.name,...args);
        this.responseMethod = JSON.stringify(res, undefined, 4);
      } catch (exception) {
        console.error('meteor method error:', exception);
        this.responseMethod = JSON.stringify(exception, undefined, 4);
      }
    },
    subscribeToPublication(args) {
      console.log('subscribeToPublication pressed');
    },
    loadArguments(args) {
      let finalArgs = [];
      for (let arg of args) {
        switch (arg.type.name) {
          case 'object':
          case 'array':
            finalArgs.push(JSON.parse(arg.value));
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

<style scoped>

</style>
