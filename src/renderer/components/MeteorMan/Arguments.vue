<template>
  <v-form>
    <v-card>
      <v-card-title>
        <div class="subtitle-2">Arguments</div>
        <v-spacer></v-spacer>
        <v-tooltip bottom>
          <template v-slot:activator="{on}">
            <v-btn fab dark small color="success" v-on="on" @click="addGroup">
              <v-icon>add</v-icon>
            </v-btn>
          </template>
          <span>Add argument</span>
        </v-tooltip>
      </v-card-title>
      <v-card-text>
        <v-row v-for="(argument,index) in args" :key="index">
          {{ '#'+(index+1) }}
          <v-col cols="12" sm="6" md="4" class="select">
            <ValidationProvider v-slot="{ errors }" name="Type" rules="required">
              <v-select v-model="argument.type" :items="argumentTypes"
                        :error-messages="errors" return-object
                        item-text="description" item-value="name" label="Type" dense>
              </v-select>
            </ValidationProvider>
          </v-col>
          <v-col cols="12" sm="6" md="4" v-if="argument.type.name==='number'">
            <ValidationProvider v-slot="{ errors }" name="value" rules="required">
              <v-text-field v-model.number="argument.value" type="number" dense label="Number*"
                            :error-messages="errors">
              </v-text-field>
            </ValidationProvider>
          </v-col>
          <v-col cols="12" sm="6" md="6"
                 v-if="argument.type.name==='object' || argument.type.name==='array' || argument.type.name==='string'">
            <ValidationProvider v-slot="{errors}" name="value" rules="required">
              <v-textarea
                  v-model="argument.value"
                  :error-messages="errors"
                  outlined
                  label="Object, Array or String"
                  rows="3"
              ></v-textarea>
            </ValidationProvider>
          </v-col>
          <v-col cols="12" sm="6" md="4" v-if="argument.type.name==='boolean'">
              <v-checkbox v-model="argument.value" label="Boolean"></v-checkbox>
          </v-col>
          <v-tooltip bottom>
            <template v-slot:activator="{on}">
              <v-btn @click="removeGroup(index)" v-on="on" icon x-small color="error" class="mt-5">
                <v-icon>delete</v-icon>
              </v-btn>
            </template>
            <span>remove</span>
          </v-tooltip>
        </v-row>
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
      args: [],
      argumentTypes: [
        { name: 'object', description: 'Object' },
        { name: 'array', description: 'Array' },
        { name: 'string', description: 'String' },
        { name: 'number', description: 'Number' },
        { name: 'boolean', description: 'Boolean' },
        { name: 'fileAsBase64', description: 'File as Base 64' },//TODO: Comming soon...
        { name: 'fileBinary', description: 'File as Binary' }//TODO: Comming soon...
      ]
    };
  },
  methods: {
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

</style>