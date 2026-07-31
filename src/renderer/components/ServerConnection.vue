<template>
  <v-card class="connection-panel" flat rounded="0" tag="section">
    <div class="connection-fields" :class="{ 'has-auth': auth.type !== 'none' }">
      <v-text-field
        v-model.trim="settings.host"
        :disabled="connected"
        aria-label="Host"
        label="Host"
        prepend-inner-icon="mdi-server-outline"
      />
      <v-text-field
        v-model.number="settings.port"
        :disabled="connected"
        aria-label="Port"
        class="port"
        label="Port"
        type="number"
      />
      <v-select
        v-model="auth.type"
        :disabled="connected"
        :items="authOptions"
        aria-label="Authentication"
        item-title="title"
        item-value="value"
        label="Authentication"
        prepend-inner-icon="mdi-shield-account-outline"
      />
      <v-text-field
        v-if="auth.type !== 'none'"
        v-model.trim="auth.userOrEmail"
        :disabled="connected"
        aria-label="User or email"
        label="User / email"
        prepend-inner-icon="mdi-account-outline"
      />
      <v-text-field
        v-if="auth.type !== 'none'"
        v-model="auth.password"
        :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
        :disabled="connected"
        :type="showPassword ? 'text' : 'password'"
        aria-label="Password"
        label="Password"
        prepend-inner-icon="mdi-lock-outline"
        @click:append-inner="showPassword = !showPassword"
      />
      <v-btn
        v-if="!connected"
        color="primary"
        :disabled="connecting"
        :loading="connecting"
        prepend-icon="mdi-lan-connect"
        @click="connect"
      >
        {{ connecting ? 'Connecting…' : 'Connect' }}
      </v-btn>
      <v-btn
        v-else
        color="error"
        prepend-icon="mdi-lan-disconnect"
        @click="disconnect"
      >
        Disconnect
      </v-btn>
      <v-btn
        color="secondary"
        prepend-icon="mdi-tune-variant"
        variant="tonal"
        @click="advancedOpen = true"
      >
        Advanced
      </v-btn>
    </div>

    <div class="connection-status">
      <v-chip
        :color="connected ? 'success' : undefined"
        :prepend-icon="connected ? 'mdi-check-network-outline' : 'mdi-access-point-off'"
        size="x-small"
        variant="tonal"
      >
        {{ connected ? 'Connected' : 'Disconnected' }}
      </v-chip>
    </div>

    <v-dialog v-model="advancedOpen" max-width="580">
      <v-card>
        <v-card-title class="dialog-title">
          <span>Advanced connection</span>
          <v-btn
            aria-label="Close advanced options"
            icon="mdi-close"
            size="small"
            variant="text"
            @click="advancedOpen = false"
          />
        </v-card-title>
        <v-divider />
        <v-card-text class="advanced-options">
          <v-alert
            color="info"
            density="compact"
            icon="mdi-information-outline"
            variant="tonal"
          >
            These settings control the underlying DDP WebSocket connection.
          </v-alert>
          <div class="advanced-fields">
            <v-select
              v-model="settings.protocol"
              :disabled="connected"
              :items="protocolOptions"
              label="Protocol"
            />
            <v-text-field
              v-model.trim="settings.path"
              :disabled="connected"
              label="WebSocket path"
            />
            <v-text-field
              v-model.number="settings.reconnectInterval"
              :disabled="connected"
              label="Reconnect interval"
              suffix="ms"
              type="number"
            />
            <v-text-field
              v-model.number="settings.maxTimeout"
              :disabled="connected"
              label="Maximum timeout"
              suffix="ms"
              type="number"
            />
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="advancedOpen = false">Done</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { inject, onBeforeUnmount, reactive, ref } from 'vue';
import SimpleDDP from 'simpleddp';
import { simpleDDPLogin } from 'simpleddp-plugin-login';
import WebSocket from 'isomorphic-ws';
import { noticeKey } from '../notices';

const notice = inject(noticeKey, () => undefined);
const client = ref<any>(null);
const connected = ref(false);
const connecting = ref(false);
const showPassword = ref(false);
const advancedOpen = ref(false);
const authOptions = [
  { title: 'No authentication', value: 'none' },
  { title: 'Username', value: 'username' },
  { title: 'Email', value: 'email' }
];
const protocolOptions = [
  { title: 'WebSocket (WS)', value: 'ws' },
  { title: 'Secure WebSocket (WSS)', value: 'wss' }
];

const settings = reactive({
  protocol: 'ws',
  host: 'localhost',
  port: 3000,
  path: 'websocket',
  reconnectInterval: 5000,
  maxTimeout: 7000
});
const auth = reactive({
  type: 'none' as 'none' | 'username' | 'email',
  userOrEmail: '',
  password: ''
});

function validate(): boolean {
  if (!settings.protocol || !settings.host || !settings.port || !settings.path) {
    notice('Please fill all connection fields.', 'warning');
    return false;
  }
  if (auth.type !== 'none' && (!auth.userOrEmail || !auth.password)) {
    notice('Please enter your credentials.', 'warning');
    return false;
  }
  return true;
}

async function connect(): Promise<void> {
  if (!validate()) return;
  connecting.value = true;

  const ddp = new SimpleDDP(
    {
      endpoint: `${settings.protocol}://${settings.host}:${settings.port}/${settings.path}`,
      SocketConstructor: WebSocket,
      reconnectInterval: settings.reconnectInterval,
      maxTimeout: settings.maxTimeout,
      autoConnect: false,
      autoReconnect: true
    },
    [simpleDDPLogin]
  );

  ddp.on('connected', async () => {
    try {
      if (auth.type !== 'none') {
        const user =
          auth.type === 'username'
            ? { username: auth.userOrEmail }
            : { email: auth.userOrEmail };
        await ddp.login({ user, password: auth.password });
      }
      connected.value = true;
      connecting.value = false;
      notice('Connected to the Meteor server.', 'success');
    } catch (error) {
      connected.value = false;
      connecting.value = false;
      ddp.disconnect();
      notice(error instanceof Error ? error.message : 'Authentication failed.', 'error');
    }
  });
  ddp.on('disconnected', () => {
    connected.value = false;
    connecting.value = false;
    ddp.stopChangeListeners?.();
  });
  ddp.on('error', (error: unknown) => {
    connecting.value = false;
    notice(error instanceof Error ? error.message : 'DDP connection error.', 'error');
  });

  client.value = ddp;
  try {
    await ddp.connect();
  } catch (error) {
    connecting.value = false;
    notice(error instanceof Error ? error.message : 'Unable to connect.', 'error');
  }
}

async function disconnect(): Promise<void> {
  if (!client.value) return;
  try {
    if (client.value.userId) await client.value.logout();
  } finally {
    client.value.disconnect();
    connected.value = false;
  }
}

onBeforeUnmount(() => {
  if (client.value) client.value.disconnect();
});

defineExpose({ client });
</script>
