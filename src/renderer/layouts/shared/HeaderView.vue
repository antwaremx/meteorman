<template>
  <v-app-bar app dark dense color="#DE3F46">
    <v-spacer></v-spacer>
    <img class="logo-meteorman" src="../../assets/logobn.png" alt="meteorman">
    <v-spacer></v-spacer>
  </v-app-bar>
</template>

<script>

export default {
  name: 'HeaderView'
};
</script>

<style scoped>
.logo-meteorman {
  height: 100%;
  width: auto;
  display: block;
  margin: 0 auto;
}
</style>