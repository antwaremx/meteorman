<template>
  <v-container fluid>
    <div>
      <p class="text-caption grey--text">Response</p>
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
.content {
  margin-top: 40px;
}

.drag-icon {
  position: absolute;
  top: -15px;
  left: 50%;
  cursor: ns-resize;
}
</style>
