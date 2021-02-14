/**
 * The file enables `@/store/index.js` to import all vuex modules
 * in a one-shot manner. There should not be any reason to edit this file.
 */

import dragAndDrop from './DragAndDrop';

const modules = {};

modules.dragAndDrop = dragAndDrop;
export default modules;
