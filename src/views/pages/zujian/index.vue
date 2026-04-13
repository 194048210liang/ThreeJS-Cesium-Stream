<template>
    <div class="container">
        <h1>组件专区</h1>
        <div class="btnbox">- 使用中文界面 ：按钮文本改为"确定"和"取消"
            - </div>
        <el-button type="primary" @click="openDialog">打开弹窗</el-button>
        <DialogBox v-model="dialogVisible" :loading="loading" :center="true" title="测试弹窗" @confirm="handleConfirm"
            @cancel="handleCancel" @handleClose="handleClose">
            <div class="dialog-content">
                <p>这是一个基础弹窗组件</p>
            </div>
        </DialogBox>
    </div>
</template>

<script setup lang="ts">
import DialogBox from '@/components/DialogBox.vue'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const dialogVisible = ref(false)
const loading = ref(false)

const openDialog = () => {
    dialogVisible.value = true
}
const Close = () => {
    loading.value = true
    setTimeout(() => {
        loading.value = false
        dialogVisible.value = false
        ElMessage.success('弹窗已关闭')
    }, 2000);
}
const handleConfirm = () => {
    Close()
}

const handleClose = () => {
    Close()
}

const handleCancel = () => {
    Close()
}
</script>

<style scoped>
.container {
    padding: 20px;
}

h1 {
    margin-bottom: 20px;
    color: #333;
}

.dialog-content {
    padding: 10px 0;
}

.dialog-content p {
    margin: 10px 0;
}

.btnbox {
    font-size: clamp(12px, 1vw, 34px);
}
</style>