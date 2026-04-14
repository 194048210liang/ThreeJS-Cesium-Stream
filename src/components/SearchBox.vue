<template>
  <div class="search-box" :class="{ focused: isFocused }">
    <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
    <input
      ref="inputRef"
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      @input="onInput"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @keydown.enter="onSearch"
    />
    <button v-if="modelValue" class="clear-btn" @click="onClear">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
    <button class="search-btn" @click="onSearch">搜索</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
}>(), {
  modelValue: '',
  placeholder: '请输入关键词...',
})

const emit = defineEmits<{
  'update:modelValue': [val: string]
  search: [val: string]
}>()

const isFocused = ref(false)
const inputRef = ref<HTMLInputElement>()

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}

function onClear() {
  emit('update:modelValue', '')
  inputRef.value?.focus()
}

function onSearch() {
  emit('search', props.modelValue)
}
</script>

<style lang="scss" scoped>
.search-box {
  display: flex;
  align-items: center;
  width: 320px;
  height: 36px;
  padding: 0 4px 0 12px;
  background: rgba(8, 16, 40, 0.85);
  border: 1px solid rgba(0, 160, 255, 0.15);
  border-radius: 6px;
  transition: all 0.3s;

  &.focused {
    border-color: rgba(0, 200, 255, 0.4);
    box-shadow: 0 0 12px rgba(0, 180, 255, 0.15);
  }
}

.search-icon {
  width: 16px;
  height: 16px;
  color: #5a8abf;
  flex-shrink: 0;
  transition: color 0.3s;
}

.search-box.focused .search-icon {
  color: #00d4ff;
}

input {
  flex: 1;
  height: 100%;
  background: none;
  border: none;
  outline: none;
  color: #b0d0ff;
  font-size: 13px;
  padding: 0 8px;
  font-family: inherit;

  &::placeholder {
    color: #3a6a9a;
  }
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: none;
  border: none;
  cursor: pointer;
  color: #5a8abf;
  padding: 0;
  border-radius: 50%;
  transition: all 0.2s;

  svg {
    width: 12px;
    height: 12px;
  }

  &:hover {
    color: #ff4466;
    background: rgba(255, 68, 102, 0.1);
  }
}

.search-btn {
  height: 28px;
  padding: 0 14px;
  background: linear-gradient(135deg, rgba(0, 160, 255, 0.2), rgba(0, 100, 200, 0.3));
  border: 1px solid rgba(0, 200, 255, 0.25);
  border-radius: 4px;
  color: #00d4ff;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s;

  &:hover {
    background: linear-gradient(135deg, rgba(0, 180, 255, 0.35), rgba(0, 120, 220, 0.45));
    box-shadow: 0 0 10px rgba(0, 180, 255, 0.2);
  }
}
</style>
