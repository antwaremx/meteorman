<template>
  <div ref="container" class="monaco-host" :class="{ invalid: error }"></div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as monaco from 'monaco-editor';
import '../monaco';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    language?: 'json' | 'markdown';
    readOnly?: boolean;
    compact?: boolean;
  }>(),
  {
    language: 'json',
    readOnly: false,
    compact: false
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const container = ref<HTMLElement>();
const error = ref(false);
let editor: monaco.editor.IStandaloneCodeEditor | undefined;
let changingInternally = false;

onMounted(() => {
  if (!container.value) return;
  editor = monaco.editor.create(container.value, {
    value: props.modelValue,
    language: props.language,
    readOnly: props.readOnly,
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: props.compact ? 12 : 13,
    lineNumbers: props.compact ? 'off' : 'on',
    folding: !props.compact,
    glyphMargin: false,
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    tabSize: 2,
    padding: { top: 8, bottom: 8 },
    overviewRulerLanes: 0,
    renderLineHighlight: props.readOnly ? 'none' : 'line'
  });

  editor.onDidChangeModelContent(() => {
    if (!editor || changingInternally) return;
    const value = editor.getValue();
    if (props.language === 'json') {
      try {
        JSON.parse(value);
        error.value = false;
      } catch {
        error.value = true;
      }
    }
    emit('update:modelValue', value);
  });
});

watch(
  () => props.modelValue,
  (value) => {
    if (!editor || editor.getValue() === value) return;
    changingInternally = true;
    editor.setValue(value);
    changingInternally = false;
  }
);

onBeforeUnmount(() => editor?.dispose());
</script>
