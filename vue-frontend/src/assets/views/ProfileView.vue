<template>
  <div class="profile-container">
    <h1>个人中心</h1>

    <!-- 个人照片（只读） -->
    <section>
      <h2>个人照片</h2>
      <img :src="user.photoUrl" alt="个人照片" class="profile-photo" />
    </section>

    <!-- 可编辑个人信息 -->
    <section>
      <h2>基本信息</h2>
      <label>姓名：<input v-model="editableUser.name" /></label>
      <label>邮箱：<input v-model="editableUser.email" /></label>
      <label>个人网站：<input v-model="editableUser.website" /></label>
      <label>履历：<textarea v-model="editableUser.resume" /></label>
      <label>工作地点：<input v-model="editableUser.workplace" /></label>
      <label>兴趣：<textarea v-model="editableUser.interests" /></label>
      <button @click="saveProfile">保存修改</button>
    </section>

    <!-- 教育信息（按学号分组，只读） -->
    <section>
      <h2>教育信息（只读）</h2>
      <div v-for="(group, studentId) in groupedEducation" :key="studentId" class="edu-group">
        <h3>学号：{{ studentId }}</h3>
        <div v-for="(edu, index) in group" :key="index" class="edu-block">
          <p>学位：{{ edu.degree }}</p>
          <p>专业：{{ edu.major }}</p>
          <p>班级：{{ edu.className }}</p>
          <p>入学时间：{{ edu.startDate }}</p>
          <p>毕业时间：{{ edu.endDate }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const user = ref({
  name: '',
  email: '',
  website: '',
  photoUrl: '',
  resume: '',
  workplace: '',
  interests: ''
})

const editableUser = ref({ ...user.value })

const educationList = ref([])

const groupedEducation = computed(() => {
  const groups = {}
  educationList.value.forEach((edu) => {
    if (!groups[edu.studentId]) {
      groups[edu.studentId] = []
    }
    groups[edu.studentId].push(edu)
  })
  return groups
})

const fetchProfile = async () => {
  const res = await axios.get('/api/user/profile')
  user.value = res.data.user
  editableUser.value = { ...res.data.user }
  educationList.value = res.data.education || []
}

const saveProfile = async () => {
  const res = await axios.put('/api/user/profile', editableUser.value)
  if (res.data.success) {
    alert('修改已保存')
    user.value = { ...editableUser.value }
  } else {
    alert('保存失败')
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
