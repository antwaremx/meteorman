<template>
  <v-app-bar app dark dense color="#DE3F46">
    <v-spacer></v-spacer>
    <img class="logo-meteorman" :src="getImg" alt="meteorman">
    <v-spacer></v-spacer>
  </v-app-bar>
</template>

<script>
import img from '@/assets/logobn.png';

export default {
  name: 'HeaderView',
  data() {
    return {
      getImg: img
    };
  }
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