<template>
  <v-app-bar app dark dense color="#DE3F46">
    <import-collections></import-collections>
    <v-spacer></v-spacer>
    <img class="logo-meteorman" src="../../assets/logobn.png" alt="meteorman">
    <v-spacer></v-spacer>
  </v-app-bar>
</template>

<script>

import ImportCollections from '../../components/Collections/ImportCollections';
export default {
  name: 'HeaderView',
  components: { ImportCollections }
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