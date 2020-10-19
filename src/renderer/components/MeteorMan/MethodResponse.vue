<template>
  <v-container fluid class="response-wrapper" :style="{ height: height + 'px' }">
    <div class="header">
      <p class="text-caption grey--text">Response</p>
      <div class="drag-icon" draggable="true">
        <v-icon>mdi-drag-horizontal-variant</v-icon>
      </div>
    </div>
    <div class="content">
      <tree-view :data="response" :options="{maxDepth: 3, link: true}"></tree-view>
    </div>
  </v-container>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';

const { mapState } = createNamespacedHelpers('dragAndDrop');

export default {
  name: 'MethodResponse',
  data: () => ({
    height: 200,
    response: ''
  }),
  watch: {
    'responses.main'(newValue) {
      this.height = newValue + 12;
    }
  },
  computed: {
    ...mapState(['responses'])
  },
  methods: {
    loadResponse(response) {
      this.response = response;
    }
  }
};
</script>

<style scoped>
.response-wrapper {
  height: 500px;
  width: 100%;
  position: fixed;
  left: 0;
  bottom: 0;
  border: 1px solid #ccc;
  background-color: white;
}

.header {
  position: relative;
}

.drag-icon {
  position: absolute;
  top: -15px;
  left: 50%;
  cursor: ns-resize;
}
</style>
