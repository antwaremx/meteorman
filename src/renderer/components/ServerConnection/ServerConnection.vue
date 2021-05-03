<template>
  <div>
    <v-row>
      <v-col class="d-flex auth-wrapper">
        <v-text-field v-model="serverConnection.host" label="Host" outlined dense
                      background-color="#fafafa"
                      class="start-addon" :disabled="Meteor.connected">
          <template v-slot:append>
            <v-btn icon @click="serverConnection.host = ''" tabindex="-1" class="pb-5">
              <v-icon v-if="serverConnection.host">mdi-close</v-icon>
            </v-btn>
          </template>
        </v-text-field>
        <div class="small-field">
          <v-text-field v-model="serverConnection.port" label="Port" outlined dense background-color="#fafafa"
                        class="mid-addon" :disabled="Meteor.connected">
            <template v-slot:append>
              <v-btn icon @click="serverConnection.port = ''" tabindex="-1" class="pb-5">
                <v-icon v-if="serverConnection.port">mdi-close</v-icon>
              </v-btn>
            </template>
          </v-text-field>
        </div>
        <div class="small-field">
          <v-select
              background-color="#fafafa"
              :class="authentication.type !== 'none' ? 'mid-addon': 'end-addon'"
              :items="authenticationTypes"
              v-model="authentication.type"
              item-text="description"
              item-value="name"
              dense
              outlined :disabled="Meteor.connected"/>
        </div>
        <v-text-field v-if="authentication.type !== 'none'" v-model="authentication.userOrEmail" label="User/Email"
                      dense outlined :disabled="Meteor.connected" class="mid-addon" background-color="#fafafa">
          <template v-slot:append>
            <v-btn icon @click="authentication.userOrEmail = ''" tabindex="-1" class="pb-5">
              <v-icon v-if="authentication.userOrEmail">mdi-close</v-icon>
            </v-btn>
          </template>
        </v-text-field>
        <v-text-field v-if="authentication.type !== 'none'" v-model="authentication.password" label="Password"
                      :type="show ? 'text' : 'password'"
                      :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                      @click:append="show = !show"
                      dense outlined :disabled="Meteor.connected" class="mid-addon" background-color="#fafafa">
        </v-text-field>
        <v-btn v-if="!Meteor.connected" @click="connect" height="40px" color="error" elevation="0" class="ml-2">
          Connect
          <v-icon right small>
            mdi-send
          </v-icon>
        </v-btn>
        <v-btn v-else @click="disconnectFromServer" height="40px" color="error" elevation="0" class="ml-2">
          Disconnect
          <v-icon right small>
            stop
          </v-icon>
        </v-btn>
        <v-btn height="40px" color="error" elevation="0" class="ml-2" @click="openAdvancedOptions">
          <v-icon>
            mdi-cogs
          </v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <modal-accept ref="advancedOptionsRef">
      <v-select
          :items="protocols"
          v-model="serverConnection.protocol"
          item-text="description"
          item-value="name"
          dense
          outlined :disabled="Meteor.connected"
      />
      <v-text-field v-model="serverConnection.path" label="Path" outlined dense :disabled="Meteor.connected">
        <template v-slot:append>
          <v-btn icon @click="serverConnection.path = ''" tabindex="-1" class="pb-5">
            <v-icon v-if="serverConnection.path">mdi-close</v-icon>
          </v-btn>
        </template>
      </v-text-field>
      <v-text-field v-model="serverConnection.reconnectInterval" label="Reconnect interval" outlined dense
                    :disabled="Meteor.connected">
        <template v-slot:append>
          <v-btn icon @click="serverConnection.reconnectInterval = ''" tabindex="-1" class="pb-5">
            <v-icon v-if="serverConnection.reconnectInterval">mdi-close</v-icon>
          </v-btn>
        </template>
      </v-text-field>
      <v-text-field v-model="serverConnection.maxTimeout" label="Max Timeout" outlined dense
                    :disabled="Meteor.connected">
        <template v-slot:append>
          <v-btn icon @click="serverConnection.maxTimeout = ''" tabindex="-1" class="pb-5">
            <v-icon v-if="serverConnection.maxTimeout">mdi-close</v-icon>
          </v-btn>
        </template>
      </v-text-field>
    </modal-accept>
  </div>
</template>

<script>
import SimpleDDP from 'simpleddp';
import { simpleDDPLogin } from 'simpleddp-plugin-login';
import ws from 'isomorphic-ws';
import ModalAccept from '../Utilities/Modals/ModalAccept';

export default {
  name: 'ServerConnection',
  components: { ModalAccept },
  data() {
    return {
      show: false,
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
        type: 'none',
        userOrEmail: null,
        password: null
      },
      authenticationTypes: [
        { name: 'none', description: 'No auth' },
        { name: 'username', description: 'User' },
        { name: 'email', description: 'Email' }
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
    openAdvancedOptions() {
      this.$refs.advancedOptionsRef.title = 'Advanced options';
      this.$refs.advancedOptionsRef.dialog = true;
    },
    initializeListeners() {
      this.Meteor.on('connected', async() => {
        console.info('Connected to the server');
        if (this.authentication.type !== 'none') {
          let user = {};
          if (this.authentication.type === 'username') {
            user = { username: this.authentication.userOrEmail };
          } else {
            user = { email: this.authentication.userOrEmail };
          }
          try {
            await this.Meteor.login({
              user,
              password: this.authentication.password
            });
          } catch (error) {
            console.error('error authentication: ', error);
            this.Meteor.disconnect();
            this.$alert.showAlertSimple('error', error.reason);
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
    validateConnection() {
      let isCorrect = true;
      if (!this.serverConnection.protocol || !this.serverConnection.host || !this.serverConnection.port || !this.serverConnection.path) {
        this.$alert.showAlertSimple('warning', 'Please fill all data connection (host, port, etc)');
        isCorrect = false;
      }
      if (this.authentication.type !== 'none' && (!this.authentication.userOrEmail || !this.authentication.password)) {
        this.$alert.showAlertSimple('warning', 'Please enter your credentials');
        isCorrect = false;
      }
      return isCorrect;
    },
    connect() {
      console.log('Meteor connection: ', this.serverConnection);
      if (this.validateConnection()) {
        const opts = {
          endpoint: `${ this.serverConnection.protocol }://${ this.serverConnection.host }:${ this.serverConnection.port }/${ this.serverConnection.path }`,
          SocketConstructor: ws,
          reconnectInterval: this.serverConnection.reconnectInterval,
          maxTimeout: this.serverConnection.maxTimeout,
          autoConnect: false,
          autoReconnect: true //TODO: Add to UI
        };
        this.Meteor = new SimpleDDP(opts, [simpleDDPLogin]);
        this.Meteor.connect();
        this.initializeListeners();
      }
    },
    disconnectFromServer() {
      this.Meteor.logout();
      this.Meteor.disconnect();

    }
  }
};
</script>

<style scoped>
.auth-wrapper /deep/ .v-input__control {
  height: 40px;
}

.tree-view-item-key {
  color: red;
}
</style>
