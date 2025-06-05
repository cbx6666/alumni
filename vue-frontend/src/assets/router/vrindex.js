import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth' // 引入认证状态存储

// 路由懒加载（优化首屏性能）
const HomeView = () => import('../views/HomeView.vue')  // 首页
const LoginView = () => import('../views/LoginView.vue') // 登录页
const ProfileView = () => import('../views/ProfileView.vue') // 个人中心
const AccountView = () => import('../views/AccountView.vue') // 账号管理
//const NotFoundView = () => import('../views/NotFoundView.vue') // 404 页面

// 定义路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: {
      title: '首页 - 同济大学计算机科学与技术学院校友会',
      requiresAuth: false // 不需要登录
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: {
      title: '登录 - 同济大学计算机科学与技术学院校友会',
      requiresAuth: false,
      hideHeader: true // 登录页隐藏页头
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView,
    meta: {
      title: '个人中心 - 同济大学计算机科学与技术学院校友会',
      requiresAuth: true // 需要登录
    }
  },
  {
    path: '/account',
    name: 'Account',
    component: AccountView,
    meta: {
      title: '账号管理',
      requiresAuth: true
    }
  },
  /*// 404 页面（必须放在最后）
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
    meta: {
      title: '页面未找到',
      requiresAuth: false
    }
  }*/
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // 自定义滚动行为
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return { 
        el: to.hash,
        behavior: 'smooth'
      }
    } else {
      return { top: 0 }
    }
  }
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 初始化认证状态
  authStore.initialize()
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  // 检查是否需要登录
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.isLoggedIn) {
      // 保存目标路由，登录后重定向
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
      return
    }
  }
  
  // 已登录用户禁止访问登录页
  if (to.name === 'Login' && authStore.isLoggedIn) {
    next({ name: 'Home' })
    return
  }
  
  next()
})

// 全局后置钩子
router.afterEach(() => {
  // 可在此处添加页面加载完成后的逻辑
})

export default router