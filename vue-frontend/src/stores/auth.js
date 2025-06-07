import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  const isLoggedIn = ref(false)
  const user = ref({ id: null, studentId: null, nickname: '', email: '', avatar: '' })

  const displayName = computed(() => user.value.nickname || user.value.email)

  // 登录处理 - 【最终版本：导航逻辑已内置】
  const login = async (credentials) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, credentials);

      if (response.data && response.data.success) {
        // 1. 更新 State 和 LocalStorage
        const loggedInUser = response.data.user;
        isLoggedIn.value = true;
        user.value = loggedInUser;
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(loggedInUser));

        // 2. 【关键】直接在这里执行页面跳转
        if (loggedInUser && loggedInUser.studentId) {
          router.push(`/alumni/${loggedInUser.studentId}/details`);
        } else {
          console.error('登录成功但未在用户信息中找到 studentId，跳转到主页。');
          router.push('/');
        }

        // 3. 返回成功状态，用于更新表单UI（例如停止加载动画）
        return { success: true };
      } else {
        return { success: false, message: response.data.message || '登录失败' };
      }
    } catch (error) {
      console.error('登录时发生网络或服务器错误:', error);
      return {
        success: false,
        message: error.response?.data?.message || '服务器错误'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    isLoggedIn.value = false;
    user.value = { id: null, studentId: null, nickname: '', email: '', avatar: '' };
    router.push('/login');
  };

  const initialize = () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          user.value = JSON.parse(storedUser);
          isLoggedIn.value = true;
        } catch (e) {
          logout();
        }
      }
    }
  };

  initialize();

  return { isLoggedIn, user, displayName, login, logout, initialize };
});
