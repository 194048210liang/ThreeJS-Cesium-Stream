<template>
  <component :is="border" v-if="border" :color="color" :background-color="bgColor">
    <slot />
  </component>
  <slot v-else />
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import {
  BorderBox1, BorderBox2, BorderBox3, BorderBox4, BorderBox5,
  BorderBox6, BorderBox7, BorderBox8, BorderBox9, BorderBox10,
  BorderBox11, BorderBox12, BorderBox13,
} from '@kjgl77/datav-vue3'

const borderMap: Record<string, any> = {
  border1: BorderBox1, border2: BorderBox2, border3: BorderBox3,
  border4: BorderBox4, border5: BorderBox5, border6: BorderBox6,
  border7: BorderBox7, border8: BorderBox8, border9: BorderBox9,
  border10: BorderBox10, border11: BorderBox11, border12: BorderBox12, border13: BorderBox13,
}

export default defineComponent({
  name: 'DataVBorder',
  props: {
    borderType: { type: String, default: '' },
    color: { type: Array as PropType<string[]>, default: () => ['rgba(0,160,255,0.6)', 'rgba(0,160,255,0.15)'] },
    bgColor: { type: String, default: 'transparent' },
  },
  computed: {
    border(): any {
      return borderMap[this.borderType] || null
    },
  },
})
</script>
