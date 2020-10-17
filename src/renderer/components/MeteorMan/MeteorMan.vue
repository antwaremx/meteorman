<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-text-field
            v-model="serverName"
            label="servername"
            outlined
            clearable
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="2">
        <v-select
            :items="dppTypes"
            v-model="typeSelected"
            dense
            outlined
        />
      </v-col>
      <v-col cols="8">
        <v-text-field
            placeholder="method name"
            v-model="methodName"
            dense
            outlined
            clearable
            type="text"
        />
      </v-col>
      <v-col cols="2">
        <v-btn
            v-on:click="ddp()"
            color="error"
            elevation="0"
        >
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
  </v-container>
</template>

<script>
import simpleDDP from 'simpleddp';
import ws from 'isomorphic-ws';

export default {
  name: 'MeteorMan',
  data() {
    return {
      dppTypes: [
        'Method',
        'Subscription'
      ],
      typeSelected: 'Method',
      serverName: 'admin.movin.mx',
      methodName: 'binnacle.makeBackup',
      responseMethod: ''
    };
  },
  methods: {
    async ddp() {
      if (this.serverName === '') {
        return;
      }
      if (this.typeSelected === 'Method') {
        if (this.methodName === '') {
          return;
        }
        const server = new simpleDDP({
          endpoint: 'ws://' + this.serverName + '/websocket',
          SocketConstructor: ws,
          reconnectInterval: 5000
        });
        const res = await server.call(this.methodName);
        var str = JSON.stringify(res, undefined, 4);
        this.responseMethod = str;
      }
    }
  }
};
</script>

<style scoped>

</style>
