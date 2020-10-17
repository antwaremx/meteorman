import Vue from 'vue';
import axios from 'axios';

import App from './App';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import './plugins/vee-validate';

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
	router,
	store,
	vuetify,
    render: h => h(App)
}).$mount('#app');
