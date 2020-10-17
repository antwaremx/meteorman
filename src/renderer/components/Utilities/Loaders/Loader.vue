<template>
    <v-dialog v-model="loader"
              hide-overlay
              persistent
              width="300">
        <v-card color="primary" dark>
            <v-card-text>
                {{progressLabel}}
                <v-progress-linear indeterminate color="white" class="mb-0">
                </v-progress-linear>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
    import Vue from 'vue';

    export default{
        name:"Loader",
        data(){
            return{
                loader:false,
                progressLabel:''
            }
        },
        mounted() {
          Vue.prototype.$loader = this;
        },
        methods:{
            activate(progressLabel = 'Cargando...') {
                this.loader = true;
                this.progressLabel = progressLabel;
            },
            deactivate(){
                this.loader=false;
            }
        }
    }
</script>

<style scoped>

</style>
