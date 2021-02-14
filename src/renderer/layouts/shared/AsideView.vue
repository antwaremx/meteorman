<template>
  <div>
    <h3>Collections</h3>
    <v-treeview v-model="tree" :open="initiallyOpen" :items="items"
        activatable item-key="name" open-on-click>
      <template v-slot:prepend="{ item, open }">
        <v-icon v-if="!item.file">
          {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
        </v-icon>
        <v-icon v-else>
          {{ files[item.file] }}
        </v-icon>
      </template>
    </v-treeview>
  </div>
</template>

<script>
export default {
  name: 'AsideView',
  data: () => ({
    initiallyOpen: ['public'],
    files: {
      method: 'mdi-alpha-m-circle-outline',
      publication: 'mdi-alpha-p-circle-outline'
    },
    tree: [],
    items: [
      {
        name: 'public',
        children: [
          {
            name: 'player.signup',
            file: 'method',
          },
          {
            name: 'verificationCode.generate',
            file: 'publication',
          },
        ],
      }
    ],
  }),
};
</script>

<style scoped>

</style>