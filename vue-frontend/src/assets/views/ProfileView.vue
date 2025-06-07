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
        <!-- 可绑定输入框实现编辑 -->
        <input v-model="profile.name" placeholder="姓名" />
        <input v-model="profile.email" placeholder="邮箱" />
        <!-- 保存按钮可绑定保存函数 -->
      </div>
    </section>

    <!-- 班级信息 -->
    <section v-if="profile.class">
      <h2>班级信息</h2>
      <p>班级名称：{{ profile.class.name }}</p>
      <p>毕业年份：{{ profile.class.graduation_year }}</p>
      <p>班主任：{{ profile.class.teacher_name }}</p>
    </section>

    <!-- 兴趣爱好 -->
    <section>
      <h2>兴趣爱好 <button @click="toggleEdit('interests')">{{ editing.interests ? '取消' : '修改' }}</button></h2>
      <ul v-if="!editing.interests">
        <li v-for="i in profile.interests" :key="i.interest_id">{{ i.name }}</li>
      </ul>
      <div v-else>
        <input placeholder="示例：编程、摄影" />
        <!-- 添加兴趣的输入和保存逻辑 -->
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
        <!-- 这里可以放一个添加或修改经历的表单 -->
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
import axios from 'axios'

const studentId = localStorage.getItem('student_id')  // 假设登录后已存储
const loading = ref(true)
const editing = reactive({
  basic: false,
  interests: false,
  experiences: false
})

const profile = reactive({
  student_id: '',
  name: '',
  email: '',
  enrollment_year: '',
  graduation_year: '',
  degree: '',
  url: '',
  class: {},
  interests: [],
  experiences: [],
  images: []
})

const fetchProfile = async () => {
  try {
    const res = await axios.get(`/api/alumni/${studentId}/details`)
    Object.assign(profile, res.data)
  } catch (err) {
    console.error('获取信息失败', err)
    alert('加载信息失败')
  } finally {
    loading.value = false
  }
}

const toggleEdit = (section) => {
  editing[section] = !editing[section]
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
