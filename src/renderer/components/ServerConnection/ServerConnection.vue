<template>
  <v-container>
    <v-row>
      <v-col cols="12" xs="12" sm="10" md="10" lg="10" xl="10">
        <v-text-field v-model="serverConnection.host" label="Host" outlined clearable :disabled="Meteor.connected"/>
      </v-col>
      <v-col cols="12" xs="12" sm="2" md="2" lg="2" xl="2">
        <v-text-field v-model="serverConnection.port" label="Port" outlined clearable :disabled="Meteor.connected"/>
      </v-col>
    </v-row>
    <v-row>
      <v-expansion-panels inset>
        <v-expansion-panel>
          <v-expansion-panel-header>Advanced options</v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-row justify="space-around"
                   no-gutters>
              <v-col cols="12" xs="12" sm="2" md="2" lg="2" xl="2">
                <v-select
                    :items="protocols"
                    v-model="serverConnection.protocol"
                    item-text="description"
                    item-value="name"
                    dense
                    outlined :disabled="Meteor.connected"
                />
              </v-col>
              <v-col cols="12" xs="12" sm="4" md="4" lg="4" xl="4">
                <v-text-field v-model="serverConnection.path" label="Path" outlined clearable :disabled="Meteor.connected"/>
              </v-col>
              <v-col cols="12" xs="12" sm="3" md="3" lg="3" xl="3">
                <v-text-field v-model="serverConnection.reconnectInterval" label="Reconnect interval" outlined
                              clearable :disabled="Meteor.connected"/>
              </v-col>
              <v-col cols="12" xs="12" sm="3" md="3" lg="3" xl="3">
                <v-text-field v-model="serverConnection.maxTimeout" label="Max Timeout" outlined clearable :disabled="Meteor.connected"/>
              </v-col>
            </v-row>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-row>
    <v-row>
      <v-col cols="12" xs="12" sm="2" md="2" lg="2" xl="2">
        <v-select
            :items="authenticationTypes"
            v-model="authentication.type"
            item-text="description"
            item-value="name"
            dense
            outlined :disabled="Meteor.connected"
        />
      </v-col>
      <v-col cols="12" xs="12" sm="4" md="4" lg="4" xl="4">
        <v-text-field v-model="authentication.userOrEmail" label="User/Email" outlined :disabled="Meteor.connected">
          <template v-slot:append>
            <v-btn icon @click="authentication.userOrEmail = ''" tabindex="-1" class="pb-5">
              <v-icon v-if="authentication.userOrEmail">mdi-close</v-icon>
            </v-btn>
          </template>
        </v-text-field>
      </v-col>
      <v-col cols="12" xs="12" sm="3" md="3" lg="3" xl="3">
        <v-text-field v-model="authentication.password" label="Password" outlined :disabled="Meteor.connected">
          <template v-slot:append>
            <v-btn icon @click="authentication.password = ''" tabindex="-1" class="pb-5">
              <v-icon v-if="authentication.password">mdi-close</v-icon>
            </v-btn>
          </template>
        </v-text-field>
      </v-col>
      <v-col cols="12" xs="12" sm="3" md="3" lg="3" xl="3">
        <v-btn v-if="!Meteor.connected" @click="connect" color="error" elevation="0">
          Connect
          <v-icon right small>
            mdi-send
          </v-icon>
        </v-btn>
        <v-btn v-else @click="disconnectFromServer" color="error" elevation="0">
          Disconnect
          <v-icon right small>
            stop
          </v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" class="text-center">
        Connection status: {{ Meteor.connected ? 'Connected' : 'Disconnected' }} {{ statusAuthentication }}
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import SimpleDDP from 'simpleddp';
import { simpleDDPLogin } from 'simpleddp-plugin-login';
import ws from 'isomorphic-ws';

export default {
  name: 'ServerConnection',
  data() {
    return {
      serverConnection: {
        protocol: 'ws',
        host: 'localhost',
        port: 3000,
        path: 'websocket',
        reconnectInterval: 5000,
        maxTimeout: 7000
      },
      Meteor: {
        connected: false
      },
      authentication: {
        type: 'username',
        userOrEmail: null,
        password: null
      },
      authenticationTypes: [
        { name: 'username', description: 'As Username' },
        { name: 'email', description: 'As Email' }
      ],
      protocols: [
        { name: 'ws', description: 'WS Protocol' },
        { name: 'wss', description: 'WSS Protocol' }
      ]
    };
  },
  watch: {
    'Meteor.connected'(newValue) {
      this.$emit('onUpdateConnection', newValue);
    }
  },
  computed: {
    statusAuthentication() {
      if (this.Meteor.connected) {
        return this.Meteor.userId ? 'with authentication' : 'without authentication';
      }
      return '';
    }
  },
  methods: {
    initializeListeners() {
      this.Meteor.on('connected', async () => {
        console.info('Connected to the server');
        if (this.authentication.userOrEmail && this.authentication.password) {
          let user = {};
          if (this.authentication.type === 'username') {
            user = { username: this.authentication.userOrEmail };
          } else {
            user = { email: this.authentication.userOrEmail };
          }
          try{
            await this.Meteor.login({
              user,
              password: this.authentication.password
            });
          }catch(error){
            console.error('error authentication: ',error);
            this.Meteor.disconnect();
            this.$alert.showAlertSimple('error',error.reason);
          }
        } else {
          console.warn('Connected without Authentication');
        }
      });

      this.Meteor.on('disconnected', () => {
        console.log('Disconnected from the server');
        this.Meteor.stopChangeListeners();
      });

      this.Meteor.on('error', (e) => {
        // global errors from server
        console.error('Has occurred an error: ', e);
      });

      this.Meteor.on('login', (m) => {
        console.log('User logged in as: ', m);
      });

      this.Meteor.on('logout', () => {
        console.log('User logged out');
      });

      this.Meteor.on('loginSessionLost', (id) => {
        console.log(`User {id} lost connection to server, will auto resume by default with token`);
      });

      this.Meteor.on('loginResume', (m) => {
        console.log('User resumed (logged in by token)', m);
      });

      this.Meteor.on('loginResumeFailed', (m) => {
        console.log('Failed to resume authorization with token after reconnection ', m);
      });

    },
    connect() {
      //TODO:Validate fields
      console.log('Meteor connection: ', this.serverConnection);
      const opts = {
        endpoint: `${ this.serverConnection.protocol }://${ this.serverConnection.host }:${ this.serverConnection.port }/${ this.serverConnection.path }`,
        SocketConstructor: ws,
        reconnectInterval: this.serverConnection.reconnectInterval,
        maxTimeout: this.serverConnection.maxTimeout,
        autoConnect: false,
        autoReconnect: true //TODO: Agregar al UI (va ligado con el de reconnectInterval)
      };
      this.Meteor = new SimpleDDP(opts, [simpleDDPLogin]);
      this.Meteor.connect();
      this.initializeListeners();
    },
    disconnectFromServer() {
      this.Meteor.logout();
      this.Meteor.disconnect();

    }
  }
};
</script>

<style scoped>
.tree-view-item-key {
  color: red;
}
</style>
