<template>
  <div class="account-container">
    <h1>账号管理</h1>

    <!-- 可更改头像 -->
    <section>
      <h2>修改头像</h2>
      <img :src="user.avatarUrl" alt="头像" class="avatar" />
      <input type="file" @change="uploadAvatar" />
    </section>

    <!-- 更换邮箱验证 -->
    <section>
      <h2>更换邮箱</h2>
      <label>新邮箱：<input v-model="newEmail" /></label>
      <button @click="verifyEmail">发送验证邮件</button>
    </section>

    <!-- 修改密码 -->
    <section>
      <h2>修改密码</h2>
      <label>当前密码：<input type="password" v-model="currentPassword" /></label>
      <label>新密码：<input type="password" v-model="newPassword" /></label>
      <label>确认新密码：<input type="password" v-model="confirmPassword" /></label>
      <button @click="changePassword">提交修改</button>
    </section>

    <!-- 教育信息导入 -->
    <section>
      <h2>导入教育信息</h2>
      <input type="file" @change="importEducation" accept=".csv,.xlsx" />
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const user = ref({ avatarUrl: '' })
const newEmail = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const fetchAccountData = async () => {
  const res = await axios.get('/api/user/account')
  user.value = res.data.user
}

const uploadAvatar = async (e) => {
  const file = e.target.files[0]
  const formData = new FormData()
  formData.append('avatar', file)
  const res = await axios.post('/api/user/avatar', formData)
  if (res.data.success) {
    user.value.avatarUrl = res.data.avatarUrl
  }
}

const verifyEmail = async () => {
  const res = await axios.post('/api/user/change-email', { email: newEmail.value })
  alert(res.data.message)
}

const changePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    alert('两次密码不一致')
    return
  }
  const res = await axios.post('/api/user/change-password', {
    currentPassword: currentPassword.value,
    newPassword: newPassword.value
  })
  alert(res.data.message)
}

const importEducation = async (e) => {
  const file = e.target.files[0]
  const formData = new FormData()
  formData.append('file', file)
  const res = await axios.post('/api/user/import-education', formData)
  alert(res.data.message)
}

onMounted(fetchAccountData)
</script>

<style scoped>
.account-container {
  max-width: 700px;
  margin: auto;
}
.avatar {
  width: 120px;
  border-radius: 50%;
  margin-bottom: 1rem;
}
label {
  display: block;
  margin: 10px 0;
}
input[type="file"] {
  margin-top: 10px;
}
</style>
