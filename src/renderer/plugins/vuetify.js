import Vue from "vue";
import Vuetify from "vuetify";
import 'vuetify/dist/vuetify.min.css';
import es from "vuetify/es5/locale/es";

Vue.use(Vuetify);

const opts = {
	theme: {
		options: {
			customProperties: true,
		},
		themes: {
			light: {
				clear: '#644F76',
				primary: '#3D2354',
				secondary: '#2E1A3F',
				accent: '#DE0351',
				error: '#ff5252',
				info: '#5bc0de',
				success: '#5cb85c',
				warning: '#f0ad4e',
			},
		},
	},
	icons: {
		iconfont: 'md',
	},
	lang: {
		locales: {
			es
		},
		current: 'es'
	}
};

export default new Vuetify(opts);
