<template>
    <v-form>
      <v-card>
        <v-card-title>
          <div class="text-caption grey--text">Params</div>
          <v-spacer></v-spacer>
        </v-card-title>
        <v-card-text>
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
                  <div v-if="argument.type.name==='object' || argument.type.name==='array' || argument.type.name==='string' || argument.type.name==='none'">
                    <v-textarea @input="onChange(argument, index)" v-model="argument.value" dense rows="1"
                                :placeholder="argument.value === null ? 'Value': ''"></v-textarea>
                  </div>
                  <div v-else-if="argument.type.name==='number'">
                    <v-text-field @input="onChange(argument, index)" v-model.number="argument.value"
                                  :placeholder="argument.value === null ? 'Value': ''" type="number" dense></v-text-field>
                  </div>
                  <div v-else-if="argument.type.name==='boolean'" class="d-flex align-center">
                    <v-checkbox @change="onChange(argument, index)" v-model="argument.value" dense></v-checkbox>
                    <span v-if="argument.value">true</span>
                    <span v-else>false</span>
                  </div>
                  <v-btn v-if="argument.type.name !== 'none' || argument.value !== null" icon class="remove-button" @click="removeGroup(index)">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </td>
              </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card-text>
      </v-card>
    </v-form>
</template>

<script>
import { ValidationObserver, ValidationProvider } from 'vee-validate';

export default {
  name: 'Arguments',
  components: {
    ValidationProvider,
    ValidationObserver
  },
  data() {
    return {
      args: [
        {
          value: null,
          type: { name: 'none', description: 'Select one type' }
        }
      ],
      argumentTypes: [
        { name: 'none', description: 'Select one type' },
        { name: 'string', description: 'String' },
        { name: 'number', description: 'Number' },
        { name: 'boolean', description: 'Boolean' },
        { name: 'object', description: 'Object' },
        { name: 'array', description: 'Array' }
      ]
    };
  },
  watch: {
    args(newValue, oldValue) {
      if (oldValue.length < newValue.length) {
        const lastArg = newValue[newValue.length - 1];

      }
    }
  },
  methods: {
    onChange(item, index) {
      if (this.args.length - 1 === index) {
        this.args.push({
          value: null,
          type: { name: 'none', description: 'Select one type' }
        });
      }
    },
    addGroup() {
      this.args.push({
        value: null,
        type: { name: 'object', description: 'Object' }
      });
    },
    removeGroup(index) {
      this.args.splice(index, 1);
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
}
</style>
