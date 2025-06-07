<template>
  <div class="login-form">
    <h2 class="form-title">用户登录</h2>
    
    <form @submit.prevent="handleSubmit">
      <!-- 账号输入 -->
      <div class="form-group">
        <label>账号</label>
        <input
          type="text"
          v-model="formData.account"
          placeholder="请输入学号"
          @input="clearError('account')"
        >
        <div v-if="errors.account" class="error-msg">{{ errors.account }}</div>
      </div>

      <!-- 密码输入 -->
      <div class="form-group">
        <label>密码</label>
        <input
          type="password"
          v-model="formData.password"
          placeholder="请输入密码"
          @input="clearError('password')"
        >
        <div v-if="errors.password" class="error-msg">{{ errors.password }}</div>
      </div>

      <!-- 登录按钮 -->
      <button :disabled="isSubmitting" class="submit-btn">
        {{ isSubmitting ? '登录中...' : '立即登录' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const emit = defineEmits(['login-success'])

// 表单数据
const formData = reactive({
  account: '',
  password: ''
})

// 错误信息
const errors = reactive({
  account: '',
  password: ''
})

const isSubmitting = ref(false)
const submitError = ref('')

// 清除错误信息
const clearError = (field) => {
  errors[field] = ''
  submitError.value = ''
}

// 表单验证
const validateForm = () => {
  let isValid = true

  if (!formData.account.trim()) {
    errors.account = '账号不能为空'
    isValid = false
  }

  if (formData.password.length < 1) {
    errors.password = '密码至少需要1位'
    isValid = false
  }

  return isValid
}

// 提交处理
const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  submitError.value = ''

  try {
    // 【关键修改】只调用登录，不再需要关心它的返回值用于导航
    const result = await auth.login({
      email: formData.account,
      password: formData.password
    })
    
    // 如果登录失败，显示错误信息
    if (!result.success) {
      submitError.value = result.message || '登录失败，请重试'
    }
    // 登录成功时的跳转，已经由 auth.js 内部处理，这里什么都不用做

  } catch (error) {
    // 这个 catch 实际上可能不会被触发了，因为 auth.js 内部处理了
    submitError.value = '客户端发生错误，请稍后再试'
    console.error('Login form submission error:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.login-form {
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.form-title {
  text-align: center;
  margin-bottom: 2rem;
  color: #1976d2;
}

.form-group {
  max-width: 400px;
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  transition: border-color 0.3s;
}

input:focus {
  border-color: #1976d2;
  outline: none;
}

.error-msg {
  color: #ff4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  height: 1.2rem;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
}
</style>