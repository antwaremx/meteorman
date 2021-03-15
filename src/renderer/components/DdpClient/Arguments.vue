<template>
  <v-form>
    <div class="text-caption grey--text">Params</div>
    <v-simple-table dense>
      <template v-slot:default>
        <thead>
        <tr>
          <th class="text-left" width="200px">
            TYPE
          </th>
          <th class="text-left">
            VALUE
          </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(argument, index) in args" :key="index" class="param-row">
          <td>
            <v-select v-model="argument.type" :items="argumentTypes" return-object
                      @change="onChange(argument, index)"
                      item-text="description" item-value="name" dense>
            </v-select>
          </td>
          <td>
            <div v-if="argument.type.name==='string' || argument.type.name==='none'">
              <v-textarea @input="onChange(argument, index)" v-model="argument.value" dense rows="1"
                          @blur="saveArgOfEndpoint(index)"
                          :placeholder="argument.value === null ? 'Value': ''"></v-textarea>
            </div>
            <div v-else-if="argument.type.name==='number'">
              <v-text-field @input="onChange(argument, index)" v-model.number="argument.value"
                            @blur="saveArgOfEndpoint(index)"
                            :placeholder="argument.value === null ? 'Value': ''" type="number" dense></v-text-field>
            </div>
            <div v-else-if="argument.type.name==='boolean'" class="d-flex align-center">
              <v-checkbox @click="saveArgOfEndpoint(index)" @change="onChange(argument, index)" v-model="argument.value"
                          dense></v-checkbox>
              <span v-if="argument.value">true</span>
              <span v-else>false</span>
            </div>
            <div v-else-if="argument.type.name === 'array'">
              <vue-json-editor v-model="argument.array" :show-btns="false" mode="code" @input="autoSaveArg(index)"
                               :expandedOnStart="false"></vue-json-editor>
            </div>
            <div v-else-if="argument.type.name === 'object'">
              <vue-json-editor v-model="argument.json" :show-btns="false" mode="code" @input="autoSaveArg(index)"
                               :expandedOnStart="false"></vue-json-editor>
            </div>
            <v-btn tabindex="-1" v-if="argument.type.name !== 'none' || argument.value !== null" icon
                   class="remove-button" @click="removeGroup(index)">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </td>
        </tr>
        </tbody>
      </template>
    </v-simple-table>
  </v-form>
</template>

<script>
import { ValidationObserver, ValidationProvider } from 'vee-validate';
import timeout from '../../mixins/timeout';

import { createNamespacedHelpers } from 'vuex';

const { mapMutations } = createNamespacedHelpers('connections');

export default {
  name: 'Arguments',
  mixins: [timeout],
  props: ['connection', 'endpoint'],
  components: {
    ValidationProvider,
    ValidationObserver
  },
  data() {
    return {
      args: [
        {
          array: [],
          json: {},
          value: null,
          type: { name: 'none', description: 'Select one type' }
        }
      ],
      argumentTypes: [
        { name: 'none', description: 'Select one type' },
        { name: 'object', description: 'Object' },
        { name: 'string', description: 'String' },
        { name: 'number', description: 'Number' },
        { name: 'boolean', description: 'Boolean' },
        { name: 'array', description: 'Array' }
      ]
    };
  },
  beforeMount() {
    const endpointArgs = JSON.parse(JSON.stringify(this.endpoint.args));
    this.args.unshift(...endpointArgs);
  },
  watch: {
    args(newValue, oldValue) {
      if (oldValue.length < newValue.length) {
        const lastArg = newValue[newValue.length - 1];

      }
    }
  },
  methods: {
    ...mapMutations(['saveArgOfOpenEndpoint', 'removeArgOfOpenEndpoint']),
    onChange(item, index) {
      if (this.args.length - 1 === index) {
        this.args.push({
          value: null,
          type: { name: 'none', description: 'Select one type' }
        });
      }
    },
    removeGroup(index) {
      this.args.splice(index, 1);
      this.removeArgOfOpenEndpoint({
        connectionName: this.connection.title,
        openEndpointId: this.endpoint.id,
        argIndex: index
      });
    },
    autoSaveArg(index) {
      this.stopWriting(() => {
        const arg = JSON.parse(JSON.stringify(this.args[index]));
        this.saveArgOfOpenEndpoint({
          connectionName: this.connection.title,
          openEndpointId: this.endpoint.id,
          index,
          arg
        });
      });
    },
    saveArgOfEndpoint(index) {
      const arg = JSON.parse(JSON.stringify(this.args[index]));
      this.saveArgOfOpenEndpoint({
        connectionName: this.connection.title,
        openEndpointId: this.endpoint.id,
        index,
        arg
      });
    }
  }
};
</script>

<style scoped>
.param-row td:last-child {
  position: relative;
}

.remove-button {
  position: absolute;
  right: 20px;
  top: 0;
}

.param-row .remove-button {
  display: none;
}

.param-row:hover .remove-button {
  display: block;
  z-index: 2;
}
</style>

<style>
.jsoneditor-menu {
  display: none;
}

div.jsoneditor {
  border: none;
}

.ace-jsoneditor .ace_variable {
  color: #9e3731 !important;
  font-weight: 600;
}

.ace-jsoneditor .ace_string {
  color: #2251a0 !important;
  font-weight: 600;
}

.ace-jsoneditor .ace_constant.ace_language {
  color: #2251a0 !important;
  font-weight: 600;
}

.ace-jsoneditor .ace_constant.ace_numeric {
  color: #3c845c !important;
  font-weight: 600;
}

.ace-jsoneditor .ace_text-layer {
  color: black !important;
}
</style>
