import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';

Vue.use(Vuetify);

const opts = {
	theme: {
		options: {
			customProperties: true
		},
		themes: {
			light: {
				clear: '#644F76',
				primary: '#ff5252',
				secondary: '#2E1A3F',
				accent: '#DE0351',
				error: '#ff5252',
				info: '#5bc0de',
				success: '#5cb85c',
				warning: '#f0ad4e'
			}
		}
	},
	icons: {
		iconfont: 'md'
	}
};

export default new Vuetify(opts);
