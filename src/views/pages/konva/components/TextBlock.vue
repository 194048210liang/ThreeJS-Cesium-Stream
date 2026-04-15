<template>
  <div
    ref="elRef"
    class="text-block"
    :style="textStyle"
    :contenteditable="editable"
    @input="onInput"
    @mousedown="onTextMouseDown"
  >{{ propValue?.content || '' }}</div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{ propValue: any; editable?: boolean }>()

const elRef = ref<HTMLElement>()

const textStyle = computed(() => ({
  fontSize: (props.propValue?.fontSize || 16) + 'px',
  color: props.propValue?.color || '#e0e6ed',
  fontWeight: props.propValue?.bold ? 'bold' : 'normal',
  textAlign: props.propValue?.align || 'left',
  lineHeight: '1.6',
}))

function onInput() {
  if (props.propValue && elRef.value) {
    props.propValue.content = elRef.value.innerText
  }
}

// 编辑模式下阻止 mousedown 冒泡，避免触发拖拽
function onTextMouseDown(e: MouseEvent) {
  if (props.editable) e.stopPropagation()
}

watch(() => props.editable, (v) => {
  if (v && elRef.value) elRef.value.focus()
})
</script>

<style scoped>
.text-block {
  width: 100%;
  height: 100%;
  overflow: hidden;
  word-break: break-all;
  padding: 8px;
  box-sizing: border-box;
  outline: none;
  cursor: text;
}
.text-block:focus {
  box-shadow: inset 0 0 0 1px rgba(0, 160, 255, 0.4);
}
</style>
