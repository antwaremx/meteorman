import Vue from 'vue';
import Router from 'vue-router';
import Home from '../views/Home';
import LayoutSPA from '../layouts/LayoutSPA';

Vue.use(Router);

export default new Router({
	routes: [
		{
			path: '*',
			redirect: '/'
		},
		{
			path: '/',
			components: {
				allPageView: LayoutSPA
			},
			children: [
				{
					path: '',
					name: 'home',
					components: {
						sectionView: Home
					}
				}
			]
		}
	]
});
