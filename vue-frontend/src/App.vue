<template>
<Header v-if="!route.meta.hideHeader" />
  <main :class="{ 'with-header': !route.meta.hideHeader }">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </main>
  
  <notifications position="top right" class="notifications" />
</template>

<script setup>

import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth';
import Header from './components/Header.vue';

const route = useRoute()
const auth = useAuthStore()

onMounted(() => {
  // 添加检查确保 Pinia 已激活
  if (typeof auth.initialize === 'function') {
    auth.initialize()
  } else {
    console.error('auth.initialize 不是一个函数')
  }
})

</script>


<style>
/* 全局基础样式 */
body {
  margin: 0;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

/* 主内容区域 */
main {
  min-height: calc(100vh - 80px);
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 特殊页面处理（如登录页） */
.login-page main {
  padding-top: 0;
  min-height: 100vh;
}

</style>
