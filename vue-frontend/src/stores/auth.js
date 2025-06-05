import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  
  // 使用 ref 创建响应式状态
  const isLoggedIn = ref(true)
  const user = ref({
    id: null,
    nickname: '',
    account: '',
    email: '',
    avatar: 'src/assets/images/cpp.jpg'
  })
  
  // 计算属性
  const isAdmin = computed(() => user.value.role === 'admin')
   const displayName = computed(() => user.value.nickname || user.value.username)
  
  // 初始化认证状态
  const initialize = () => {
    const token = localStorage.getItem('authToken')  // 从本地存储获取 token
    if (token) {
      isLoggedIn.value = true
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          user.value = JSON.parse(storedUser)
        } catch (e) {
          console.error('Failed to parse user data', e)
          logout()
        }
      } else {
        fetchUserInfo()
      }
    }
  }
    // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      const response = await axios.get('/api/user', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      })
      
      if (response.data.success) {
        user.value = response.data.user
        localStorage.setItem('user', JSON.stringify(response.data.user))
      } else {
        logout()
      }
    } catch (error) {
      console.error('Failed to fetch user info', error) 
      logout()
    }
  }
  
  // 登录处理
  const login = async (credentials) => {
    try {
      const response = await axios.post('/api/login', credentials)
      
      if (response.data.success) {
        localStorage.setItem('authToken', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        
        isLoggedIn.value = true
        user.value = response.data.user
        
        // 重定向到目标页面或首页
        const redirect = router.currentRoute.value.query.redirect || '/'
        router.push(redirect)
        
        return { success: true }
      } else {
        return { success: false, message: response.data.error || '登录失败' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        message: error.response?.data?.error || '服务器错误，请稍后再试' 
      }
    }
  }
  
  // 退出登录
  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    
    isLoggedIn.value = false
    user.value = {
      id: null,
      username: '',
      nickname: '',
      email: '',
      avatar: ''
    }
    router.push('/login')
  }
  
  return {
    isLoggedIn,
    user,
    isAdmin,
    displayName,
    initialize,
    login,
    logout,
    fetchUserInfo
  }
})