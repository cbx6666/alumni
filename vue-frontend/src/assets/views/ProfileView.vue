<template>
  <div class="profile-container" v-if="!loading">
    <h1>个人中心</h1>

    <!-- 基本信息 -->
    <section>
      <h2>基本信息 <button @click="toggleEdit('basic')">{{ editing.basic ? '取消' : '修改' }}</button></h2>
      <div v-if="!editing.basic">
        <p>姓名：{{ profile.name }}</p>
        <p>邮箱：{{ profile.email }}</p>
        <p>学号：{{ profile.student_id }}</p>
        <p>入学年份：{{ profile.enrollment_year }}</p>
        <p>毕业年份：{{ profile.graduation_year }}</p>
        <p>学位：{{ profile.degree }}</p>
        <p>个人网站：<a :href="profile.url" target="_blank">{{ profile.url }}</a></p>
      </div>
      <div v-else>
        <input v-model="profile.name" placeholder="姓名" />
        <input v-model="profile.email" placeholder="邮箱" />
      </div>
    </section>

    <!-- 班级信息 -->
    <!-- 【修复】将 v-if="profile.class" 改为 v-if="profile.classInfo" -->
    <section v-if="profile.classInfo">
      <h2>班级信息</h2>
      <p>班级名称：{{ profile.classInfo.name }}</p>
      <p>毕业年份：{{ profile.classInfo.graduation_year }}</p>
      <p>班主任：{{ profile.classInfo.teacher_name }}</p>
    </section>

    <!-- 兴趣爱好 -->
    <section>
      <h2>兴趣爱好 <button @click="toggleEdit('interests')">{{ editing.interests ? '取消' : '修改' }}</button></h2>
      <ul v-if="!editing.interests">
        <li v-for="i in profile.interests" :key="i.interest_id">{{ i.name }}</li>
      </ul>
      <div v-else>
        <input placeholder="示例：编程、摄影" />
      </div>
    </section>

    <!-- 经历 -->
    <section>
      <h2>经历 <button @click="toggleEdit('experiences')">{{ editing.experiences ? '取消' : '修改' }}</button></h2>
      <ul v-if="!editing.experiences">
        <li v-for="exp in profile.experiences" :key="exp.experience_id">
          <strong>{{ exp.title }}</strong> - {{ exp.location }} ({{ exp.start_date }} ~ {{ exp.end_date }})
          <p>{{ exp.description }}</p>
        </li>
      </ul>
      <div v-else>
        <p>经历编辑待实现</p>
      </div>
    </section>

    <!-- 图片展示 -->
    <section>
      <h2>图片</h2>
      <div class="images">
        <img v-for="img in profile.images" :key="img.image_id" :src="img.path" class="photo" />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const studentId = route.params.studentId

const loading = ref(true)

// 【新增】一个响应式对象，用来追踪哪些部分正在被编辑
const editing = reactive({
  basic: false,
  interests: false,
  experiences: false
})

// 【新增】一个方法，用来切换指定部分的编辑状态
const toggleEdit = (section) => {
  editing[section] = !editing[section]
}

const profile = reactive({
  student_id: '',
  name: '',
  email: '',
  enrollment_year: '',
  graduation_year: '',
  degree: '',
  url: '',
  classInfo: null, // 我们将班级信息存在这里
  interests: [],
  experiences: [],
  images: []
})

const fetchProfile = async () => {
  // ... fetchProfile 函数保持不变，这里省略以保持简洁 ...
  // ... 你无需修改这个函数 ...
  if (!studentId) {
    console.error('无法从URL中获取 studentId，已停止请求。')
    alert('无效的个人主页地址。')
    return
  }

  loading.value = true
  try {
    const response = await axios.get(`/api/alumni/${studentId}/details`)
    const backendData = response.data

    profile.student_id = backendData.STUDENT_ID
    profile.name = backendData.NAME || backendData.nickname
    profile.email = backendData.EMAIL
    profile.enrollment_year = backendData.ENROLLMENT_YEAR
    profile.graduation_year = backendData.GRADUATION_YEAR
    profile.degree = backendData.DEGREE
    profile.url = backendData.URL
    profile.classInfo = backendData.class
    profile.interests = backendData.interests || []
    profile.experiences = backendData.experiences || []
    profile.images = backendData.images || []

  } catch (err) {
    console.error(`获取学号为 ${studentId} 的信息失败，后端错误详情:`, err.response || err);
    alert('加载个人信息失败，请检查网络连接或联系管理员。');

  } finally {
    loading.value = false
  }
}

onMounted(fetchProfile)
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: auto;
}

.profile-photo {
  max-width: 200px;
  border-radius: 8px;
  margin-bottom: 1rem;
}

label {
  display: block;
  margin: 10px 0;
}

textarea {
  width: 100%;
  height: 80px;
}

.edu-group {
  margin-bottom: 20px;
  border-bottom: 1px dashed #ccc;
  padding-bottom: 10px;
}

.edu-block {
  margin-top: 10px;
  padding: 10px;
  background: #f9f9f9;
  border-left: 4px solid #007bff;
  border-radius: 4px;
}
</style>
