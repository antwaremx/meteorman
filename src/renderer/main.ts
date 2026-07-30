import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { useConnectionsStore } from './stores/connections';
import { vuetify } from './vuetify';
import './styles.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(vuetify);
await useConnectionsStore(pinia).hydrate();
app.mount('#app');
