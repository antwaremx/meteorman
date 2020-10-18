<template>
  <div class="wrapper" @dragover="onDragOver($event)">
    <app-bar/>
    <v-card>
      <v-tabs
          v-model="tab"
          center-active
          next-icon="mdi-arrow-right-bold-box-outline"
          prev-icon="mdi-arrow-left-bold-box-outline"
          show-arrows
      >
        <v-tab
            v-for="n in length"
            :key="n"
        >
          DDP {{ n }}
        </v-tab>
        <v-menu bottom left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
                icon
                class="align-self-center mr-4"
                v-bind="attrs"
                v-on="on"
                @click="length++"
            >
              <v-icon>
                mdi-plus
              </v-icon>
            </v-btn>
          </template>
        </v-menu>
      </v-tabs>

      <v-tabs-items v-model="tab">
        <v-tab-item v-for="n in length" :key="n">
          <meteor-man/>
        </v-tab-item>
      </v-tabs-items>

    </v-card>
  </div>
</template>

<script>
import AppBar from '../components/AppBar/AppBar';
import MeteorMan from '../components/MeteorMan/MeteorMan';
import { createNamespacedHelpers } from 'vuex';
const { mapActions, mapState } = createNamespacedHelpers('dragAndDrop');

export default {
  name: 'home',
  components: { MeteorMan, AppBar },
  data() {
    return {
      length: 1,
      tab: 0
    };
  },
  watch: {
    length(val) {
      this.tab = val - 1;
    }
  },
  computed: {
    ...mapState(['responses'])
  },
  methods: {
    ...mapActions(['setResponseHeight']),
    onDragOver(event) {
      const height = window.innerHeight - event.y;
      if (this.responses['main'] !== height) {
        this.setResponseHeight({
          key: 'main', // TODO: Replace this by active tab
          height
        })
      }
    }
  }
};
</script>

<style>

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

::-webkit-scrollbar {
  display: none;
}

.wrapper {
  background-color: aliceblue;
  height: 100vh;
  width: 100vw;
}

</style>
