<template>
  <div>
    <v-app-bar
        color="#DE3F46"
        flat
        dense
        dark
    >
      <v-btn small>
        <v-icon small left>
          mdi-plus
        </v-icon>
        Nuevo
      </v-btn>

      <v-spacer></v-spacer>

      <img
          class="meteorman"
          src="../../assets/logobn.png"
          alt="meteorman"
          v-on:click=""
      >

      <v-spacer></v-spacer>
      <v-btn small>
        Actualizar
        <v-icon small right>
          mdi-star
        </v-icon>
      </v-btn>
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
