<template>
  <v-dialog id="modalAccept" max-width="500px" v-model="dialog" eager @click:outside="onAccept">
    <v-card>
      <v-card-title class="black text-h5 d-flex justify-space-between">
        <div class="text-h6 white--text">{{ title }}</div>
        <v-btn icon @click="dialog = false">
          <v-icon color="#808080">mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="pa-5">
        <slot>
          {{ message }}
        </slot>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" depressed v-on:click="onAccept">
          <slot name="confirmLabel">
            Accept
          </slot>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Vue from 'vue';

export default {
  name: 'ModalAccept',
  data: () => ({
    title: '',
    message: null,
    icon: null,
    dialog: false
  }),
  mounted() {
    Vue.prototype.$modalAccept = this;
  },
  methods: {
    showModal(title, message, icon = '') {
      this.title = title;
      this.message = message;
      this.icon = icon;
      this.dialog = true;
    },
    onAccept() {
      this.dialog = false;
      this.$emit('onAccept');
    }
  }
};
</script>

<style scoped>

</style>
