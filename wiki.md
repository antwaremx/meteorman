### Vue dependencies

If you want to add dependencies that are built as vue components, you must add it to webpack.renderer.config.js file as follow:

_in line 22_
```
let whiteListedModules = ['vue', 'vuetify', 'vue-json-editor','vue-simplemde']
```
