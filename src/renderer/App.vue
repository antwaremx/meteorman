<template>
  <v-app id="app">
    <transition :name="$router.currentRoute.name">
      <router-view></router-view>
    </transition>
  </v-app>
</template>

<script>
  export default {
    name: 'meteorman'
  }
</script>

<style>
  /* CSS */
</style>
