<template>
    <el-dialog v-model.visible="dialogVisible" :title="title" :width="width" :before-close="handleClose" draggable
        :center="center">
        <slot></slot>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="close">取消</el-button>
                <el-button type="primary" @click="confirm" :loading="loading">
                    确定
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
const props = defineProps({
    title: {
        type: String,
        default: '提示'
    },
    modelValue: {
        type: Boolean,
        default: false
    },
    width: {
        type: String,
        default: '500px'
    },
    loading: {
        type: Boolean,
        default: false
    },
    center: {
        type: Boolean,
        default: false
    },
})
// 定义事件 
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel', 'handleClose'])
const dialogVisible = ref(props.modelValue)
//#region 弹窗事件
const close = () => {
    emit('cancel')
}
const confirm = () => {
    emit('confirm')
}
const handleClose = () => {
    emit('handleClose')
}
//#endregion
watch(() => props.modelValue, (newVal) => {
    dialogVisible.value = newVal
})
watch(dialogVisible, (newVal) => {
    emit('update:modelValue', newVal)
})
</script>
<style scoped>
.dialog-footer {
    text-align: right;
}
</style>