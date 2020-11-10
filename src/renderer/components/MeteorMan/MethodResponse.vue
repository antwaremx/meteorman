<template>
  <v-container fluid style="height: 100%;">
    <div>
      <p class="text-caption grey--text">Response</p>
    </div>
    <div class="content" v-show="response">
      <vue-json-editor ref="vueJsonEditorRef" v-model="response" :show-btns="false" mode="code" :expanded-on-start="true"></vue-json-editor>
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
      if (response.constructor  === Boolean) {
        this.response = response + '';
        setTimeout(() => {
          document.querySelectorAll("span.ace_string")[0].innerHTML = response;
        }, 10);
      } else {
        this.response = response;
      }
      this.$refs.vueJsonEditorRef.editor.aceEditor.setOptions({
        maxLines: 10000
      });
    }
  }
};
</script>

<style scoped>

.drag-icon {
  position: absolute;
  top: -15px;
  left: 50%;
  cursor: ns-resize;
}
</style>
