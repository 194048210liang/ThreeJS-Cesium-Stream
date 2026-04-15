<template>
  <div class="table-block">
    <table>
      <thead>
        <tr>
          <th v-for="(h, i) in headers" :key="i">{{ h }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, ri) in rows" :key="ri">
          <td v-for="(cell, ci) in row" :key="ci">{{ cell }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ propValue: any }>()
const headers = computed(() => props.propValue?.headers || [])
const rows = computed(() => props.propValue?.rows || [])
</script>

<style scoped>
.table-block {
  width: 100%;
  height: 100%;
  overflow: auto;
  font-size: 13px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid rgba(0, 160, 255, 0.2);
  padding: 8px 12px;
  text-align: center;
  color: #c0d0e0;
}
th {
  background: rgba(0, 120, 215, 0.15);
  color: #67c8ff;
  font-weight: 600;
}
tbody tr:hover {
  background: rgba(0, 160, 255, 0.06);
}
</style>
