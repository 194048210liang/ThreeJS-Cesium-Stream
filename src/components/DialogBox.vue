<template>
    <el-dialog v-model.visible="dialogVisible" :title="title" :width="width" :before-close="handleClose" draggable
        :center="center" :close-on-click-modal="false" class="dark-dialog">
        <slot></slot>
        <template #footer>
            <div class="dialog-footer">
                <el-button class="tb-btn" @click="close">取消</el-button>
                <el-button class="tb-btn tb-btn-primary" @click="confirm" :loading="loading">确定</el-button>
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
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel', 'handleClose'])
const dialogVisible = ref(props.modelValue)
const close = () => {
    emit('cancel')
}
const confirm = () => {
    emit('confirm')
}
const handleClose = () => {
    emit('handleClose')
}
watch(() => props.modelValue, (newVal) => {
    dialogVisible.value = newVal
})
watch(dialogVisible, (newVal) => {
    emit('update:modelValue', newVal)
})
</script>

<style scoped>
.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}
</style>

<style>
.dark-dialog.el-dialog {
    background: linear-gradient(180deg, rgba(14, 28, 48, 0.97), rgba(10, 20, 36, 0.98));
    border: 1px solid rgba(0, 160, 255, 0.15);
    border-radius: 10px;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5), 0 0 60px rgba(0, 80, 160, 0.15);
}
.dark-dialog .el-dialog__header {
    padding: 16px 20px 12px;
    margin-right: 0;
    border-bottom: 1px solid rgba(0, 160, 255, 0.08);
}
.dark-dialog .el-dialog__title {
    color: #a0c8f0;
    font-size: 15px;
    font-weight: 600;
}
.dark-dialog .el-dialog__headerbtn .el-dialog__close {
    color: #5a7a9a;
}
.dark-dialog .el-dialog__headerbtn .el-dialog__close:hover {
    color: #00a0ff;
}
.dark-dialog .el-dialog__body {
    padding: 20px;
    color: #c0d0e0;
}
.dark-dialog .el-dialog__footer {
    padding: 12px 20px 16px;
    border-top: 1px solid rgba(0, 160, 255, 0.06);
}
.dark-dialog .tb-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 16px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    border: 1px solid rgba(0, 160, 255, 0.2);
    background: rgba(0, 60, 120, 0.08);
    color: #8aacc8;
    transition: all 0.2s;
}
.dark-dialog .tb-btn:hover {
    background: rgba(0, 100, 200, 0.18);
    color: #c0e0ff;
    border-color: rgba(0, 160, 255, 0.35);
}
.dark-dialog .tb-btn-primary {
    background: linear-gradient(135deg, rgba(0, 140, 255, 0.25), rgba(0, 100, 200, 0.2));
    border-color: rgba(0, 160, 255, 0.35);
    color: #80c8ff;
}
.dark-dialog .tb-btn-primary:hover {
    background: linear-gradient(135deg, rgba(0, 160, 255, 0.4), rgba(0, 120, 220, 0.3));
    border-color: rgba(0, 180, 255, 0.55);
    color: #b0e0ff;
    box-shadow: 0 0 12px rgba(0, 140, 255, 0.2);
}
</style>