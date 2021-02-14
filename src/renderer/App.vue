<template>
  <v-app id="allPageView">
    <transition :name="$router.currentRoute.name">
      <router-view name="allPageView"></router-view>
    </transition>
    <alert-message></alert-message>
    <loader></loader>
  </v-app>
</template>

<script>
  import AlertMessage from './components/Utilities/Alerts/AlertMessage';
  import Loader from './components/Utilities/Loaders/Loader';
  export default {
    name: 'App',
    components: { Loader, AlertMessage }
  }
</script>

<style src="./../styles/base.css"></style>
