<template>
  <v-container>
    <server-connection ref="serverRef" @onUpdateConnection="updateConnection"></server-connection>
    <div v-if="connected">
      <v-row>
        <v-col cols="2">
          <v-select :items="dppTypes" v-model="typeSelected" dense outlined/>
        </v-col>
        <v-col cols="8">
          <v-text-field placeholder="method name" v-model="methodMeteor.name" dense outlined clearable type="text"/>
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

export default {
  name: 'MeteorMan',
  components: { ServerConnection },
  data() {
    return {
      dppTypes: [
        'Method',
        'Subscription'
      ],
      typeSelected: 'Method',
      methodMeteor: {
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
    async callMethod() {
      console.log('Meteor: ', this.$refs.serverRef.Meteor);
      try {
        const res = await this.$refs.serverRef.Meteor.call(this.methodMeteor.name);
        this.responseMethod = JSON.stringify(res, undefined, 4);
      } catch (exception) {
        console.error('meteor method error:', exception);
        this.responseMethod = JSON.stringify(exception, undefined, 4);
      }
    },
    subscribeToPublication() {
      console.log('subscribeToPublication pressed');
    },
    ddp() {
      if (this.typeSelected === 'Method') {
        this.callMethod();
      } else {
        this.subscribeToPublication();
      }
    }
  }
};
</script>

<style scoped>

</style>
