

<template>
    <header class="header">
        <!--左侧logo-->
        <router-link :href="Logos.TJlogo.href">
            <img :src="Logos.TJlogo.src" :alt="Logos.TJlogo.alt" :class="Logos.TJlogo.class">
        </router-link>
        <router-link :href="Logos.Namelogo.href">
            <img :src="Logos.Namelogo.src" :alt="Logos.Namelogo.alt" :class="Logos.Namelogo.class">
        </router-link>

        <!-- 中间导航 -->
        <nav class="nav-links">
            <router-link to="/" class="nav-item">主页</router-link>
            <router-link to="/profile" class="nav-item">个人中心</router-link>
            <router-link to="/" class="nav-item">待定</router-link>
        </nav>
        
        <!-- 右侧用户区域 -->
        <div class="user-area" @mouseenter="isDropdownOpen = true" @mouseleave="isDropdownOpen = false">
            <!-- 未登录状态 -->
            <button v-if="!auth.isLoggedIn" class="login-btn" @click="handleLogin">登录</button>

            <!-- 已登录状态 -->
            <div v-else class="user-info">
                <img :src="auth.user.avatar" alt="用户头像" class="user-avatar" />
        
            <!-- 下拉菜单 -->
                <transition name="dropdown">
                    <div v-show="isDropdownOpen" class="dropdown-menu">
                        <div class="dropdown-item username">{{ auth.user.nickname }}</div>
                        <div class="dropdown-item account">账号: {{ auth.user.account }}</div>
                        <router-link to="/profile" class="dropdown-item" @click="isDropdownOpen = false">个人中心</router-link>
                        <router-link to="/account" class="dropdown-item" @click="isDropdownOpen = false">账号管理</router-link>
                        <button class="dropdown-item LogoutBtn" @click="handleLogout">退出登录</button>
                    </div>
                </transition>
             </div>
        </div>
    </header>
    

</template>

<script setup>
import { ref,watch } from 'vue';
import { useAuthStore } from '../stores/auth.js';
import { useRouter, useRoute } from 'vue-router';

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const isDropdownOpen = ref(false)

// 监听路由变化时关闭下拉菜单
watch(() => route.path, () => {
  isDropdownOpen.value = false
})

const handleLogin = () => {
  router.push({ name: 'Login' })
}

const handleLogout = () => {
  auth.logout()
  isDropdownOpen.value = false
}

</script>


<!--export default-->
<script>

export default {
    name: 'Header',
    data() {
        return {
            title: '同济大学软件学院校友会',
            Logos: {
                TJlogo: {
                    src: 'https://www.tongji.edu.cn/images/badge.png',
                    alt: 'Tongji University Logo',
                    class: 'TJlogo',
                    href: 'https://www.tongji.edu.cn/'
                },
                Namelogo:{
                    src: 'https://www.tongji.edu.cn/images/name.png',
                    alt: 'Namelogo',
                    class: 'Namelogo',
                    href: 'https://www.tongji.edu.cn/'
                }
            }

        };
    }
};

</script>

<style scoped>

.header {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background:rgb(53, 53, 196);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  padding: 0 2rem;
  z-index: 1000;
}

.logo-link {
  margin-right: auto;
}

.TJlogo {
  height: 50px;
  cursor: pointer;
  transition: opacity 0.3s;
  margin-right: 10px;
}

.Namelogo {
  height: 50px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.logo:hover {
  opacity: 0.8;
}

.nav-links {
  display: flex;
  gap: 2rem;
  margin: 0 auto;
}

.nav-item {
  color: rgb(255, 255, 255);
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s;
}

.nav-item:hover {
  background: #b0b0b0;
}

.nav-item.router-link-exact-active {
  color: white;
  font-weight: 500;
}

.user-area {
  margin-left: auto;
  position: relative;
}

.login-btn {
  background: violet;
  color: white;
  width: 40px;
  height: 40px;
  border: None;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s;
}

.login-btn:hover {
  background: #bbbbbb;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  border: 1px solid white;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 50px;
  background: white;
  min-width: 180px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  overflow: hidden;
}

.dropdown-item {
  padding: 12px 16px;
  color: #333;
  text-decoration: none;
  display: block;
  transition: all 0.3s;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #f8f8f8;
}

.username {
  font-weight: 500;
  border-bottom: 1px solid #eee;
}

.account {
  font-size: 0.9em;
  color: #666;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}


</style>
