<template>
  <v-dialog id="modalQuestion" max-width="500px" v-model="dialog" eager>
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
        <slot name="questionButtons">
          <v-btn color="error" outlined depressed v-on:click="onCancel">
            Cancel
          </v-btn>
          <v-btn color="primary" depressed v-on:click="onAccept">
            Accept
          </v-btn>
        </slot>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Vue from 'vue';

export default {
  name: 'ModalQuestion',
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
    },
    onCancel() {
      this.dialog = false;
      this.$emit('onCancel');
    }
  }
};
</script>

<style scoped>

</style>
