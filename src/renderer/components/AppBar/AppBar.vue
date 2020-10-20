<template>
  <div>
    <v-app-bar
        color="#DE3F46"
        flat
        dense
        dark>
      <v-spacer></v-spacer>
      <img
          class="meteorman"
          src="../../assets/logobn.png"
          alt="meteorman"
          v-on:click="">
      <v-spacer></v-spacer>
    </v-app-bar>
  </div>
</template>

<script>
export default {
  name: 'AppBar',
  data() {
    return {

    };
  },
  methods: {
    open(link) {

    }
  }
};
</script>

<style scoped>
.meteorman {
  height: 100%;
  width: auto;
  display: block;
  margin: 0 auto;
}
</style>
