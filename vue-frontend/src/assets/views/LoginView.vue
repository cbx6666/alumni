<template>
  <div class="login-page">

    <div class="login-container">
      <!-- 左侧欢迎区域 -->
      <div class="welcome-section">
        <h1 class="welcome-title">欢迎回来！</h1>
        <p class="welcome-text">同济大学计算机科学与技术学院校友会</p>
      </div>

      <!-- 右侧登录表单 -->
      <div class="form-section">
        <div class="form-container">
          <LoginForm />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import LoginForm from '../../components/auth/LoginForm.vue'
</script>


<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  background-color: #1d84f2; /* 备用背景色 */;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), 
              url('src/assets/images/CS.jpg') center/cover no-repeat;
  background-position: center;
}

.login-container {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  padding-top: 0px;
  min-height: 100vh; 
  padding: 0rem;
}

.welcome-section {
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 3rem;
}

.welcome-title {
  font-size: 3.5rem;
  margin-bottom: 1rem;
}

.welcome-text {
  font-size: 1.5rem;
  opacity: 0.9;
}

.form-section {
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(25, 118, 210, 0.9); /* 蓝色透明背景 */
  border-radius: 20px 0 0 20px;
  padding: 2rem;
}

.form-container {
  width: 100%;
  max-width: 420px;
}

</style>