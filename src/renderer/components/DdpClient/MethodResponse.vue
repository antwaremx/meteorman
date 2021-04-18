<template>
  <v-container fluid style="height: 100%;">
    <div class="d-flex justify-space-between">
      <p class="text-caption grey--text">Response</p>
      <p v-if="elapsedTime" class="text-caption grey--text">Time: <span class="green--text">{{ elapsedTime }}</span></p>
    </div>
    <div class="content" v-show="response">
      <vue-json-editor id="editorResponse" ref="vueJsonEditorRef" v-model="response" :show-btns="false" mode="code"
                       :expanded-on-start="true"></vue-json-editor>
    </div>
    <div class="empty-response" v-show="!response">
      <img width="100" :src="logo" alt="Meteorman" class="logo">
      <label>Hit send to get a response</label>
    </div>
  </v-container>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
import img from '@/assets/MeteormanFinal.png';

const { mapState } = createNamespacedHelpers('dragAndDrop');

export default {
  name: 'MethodResponse',
  data: () => ({
    height: 200,
    response: '',
    elapsedTime: null,
    logo: img
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
    formattedElapsedTime(elapsedTime) {
      if (elapsedTime < 1000) {
        return `${ elapsedTime.toFixed(2) } ms`;
      } else if (elapsedTime < 60000) {
        return `${ (elapsedTime / 1000).toFixed(2) } s`;
      } else {
        return `${ (elapsedTime / (1000 * 60000)).toFixed(2) } m`;
      }
    },
    loadResponse(response, elapsedTime) {
      this.elapsedTime = this.formattedElapsedTime(elapsedTime);
      if (response === undefined) {
        this.response = ' ';
        setTimeout(() => {
          document.querySelectorAll('#editorResponse span.ace_string')[0].innerHTML = '';
        }, 100);
      } else if (response.constructor === Boolean) {
        this.response = response + '';
        setTimeout(() => {
          document.querySelectorAll('#editorResponse span.ace_string')[0].innerHTML = response;
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
.empty-response {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

label {
  color: #ccc;
  text-align: center;
}
.logo {
  filter: grayscale(1);
  opacity: 0.3;
}
</style>
