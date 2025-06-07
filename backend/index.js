const express = require('express');
const bodyParser = require('body-parser');
const oracledb = require('oracledb');

try {
  oracledb.initOracleClient({ libDir: 'D:\\oracle_client\\instantclient_21_18' });
  console.log('✅ Oracle Client 初始化成功 - 主服务');
  console.log('Oracle 客户端版本:', oracledb.oracleClientVersion); 
  console.log('Oracle 客户端版本字符串:', oracledb.oracleClientVersionString);
} catch (err) {
  console.error('❌ Oracle Client 初始化失败:', err);
}

const bcrypt = require('bcryptjs');
// 用于在服务器端存储用户 session，实现登录状态保持
const session = require('express-session');
const cors = require('cors');
// 加载 .env 文件中的环境变量
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(session({
  secret: 'super-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.post('/login', async (req, res) => {
  const email = req.body.email || req.body.account || req.body.username;
  const { password } = req.body;

  console.log('登录请求体:', req.body)//====================

  if (!email || !password) {
    return res.status(400).json({ error: '邮箱和密码不能为空' });
  }

  let connection;
  try {
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_DSN
    });

    const result = await connection.execute(
      `SELECT * FROM accounts WHERE login_email = :email AND is_active = 1`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const account = result.rows[0];
    if (!account) {
      return res.status(404).json({ error: '账号不存在或未激活' });
    }

    const passwordMatch = (password === account.PASSWORD);
    if (!passwordMatch) {
      return res.status(401).json({ error: '密码错误' });
    }

    res.json({
      success: true,
      token: 'mocked-token-123', // 实际开发应生成 JWT
      user: {
        id: account.ID,
        nickname: account.NICKNAME || '',
        username: account.LOGIN_EMAIL,
        email: account.LOGIN_EMAIL,
        avatar: '/default/avatar.jpg'
      }
    });

  } catch (err) {
    console.error('登录失败:', err.stack || err.message || err);
    res.status(500).json({ error: '服务器错误' });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});


function requireLogin(req, res, next) {
  if (req.session && req.session.loggedIn) return next();
  return res.status(401).json({ message: '未登录，拒绝访问' });
}

app.get('/alumni', requireLogin, async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_DSN
    });

    const result = await connection.execute(
      `SELECT student_id, name, email, enrollment_year, graduation_year
       FROM alumni`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json(result.rows);
  } catch (err) {
    console.error('获取校友信息失败:', err);
    res.status(500).json({ message: '服务器错误' });
  } finally {
    if (connection) await connection.close();
  }
});

app.get('/alumni/:student_id/details', requireLogin, async (req, res) => {
  const studentId = req.params.student_id;
  let connection;

  try {
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_DSN
    });

    // 查询基本信息 + 班级信息
    const [alumniResult, classResult, interestResult, experienceResult, imageResult] = await Promise.all([
      connection.execute(
        `SELECT student_id, name, email, enrollment_year, graduation_year, degree, url, class_id
         FROM alumni
         WHERE student_id = :id`,
        [studentId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      ),

      connection.execute(
        `SELECT class_id, name, graduation_year, teacher_name
         FROM classes
         WHERE class_id = (
           SELECT class_id FROM alumni WHERE student_id = :id
         )`,
        [studentId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      ),

      connection.execute(
        `SELECT i.interest_id, i.name
         FROM interests i
         JOIN alumni_interests ai ON ai.interest_id = i.interest_id
         WHERE ai.student_id = :id`,
        [studentId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      ),

      connection.execute(
        `SELECT experience_id, title, description, start_date, end_date, location
         FROM experiences
         WHERE student_id = :id
         ORDER BY start_date DESC`,
        [studentId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      ),

      connection.execute(
        `SELECT image_id, path, upload_time, is_avatar
         FROM images
         WHERE student_id = :id
         ORDER BY upload_time DESC`,
        [studentId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      )
    ]);

    // 校友不存在
    if (alumniResult.rows.length === 0) {
      return res.status(404).json({ message: '未找到该校友' });
    }

    // 构造完整数据
    const alumni = alumniResult.rows[0];

    res.json({
      ...alumni,
      class: classResult.rows[0] || null,
      interests: interestResult.rows,
      experiences: experienceResult.rows,
      images: imageResult.rows
    });

  } catch (err) {
    console.error('获取校友详情失败:', err);
    res.status(500).json({ message: '服务器错误' });
  } finally {
    if (connection) await connection.close();
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`登录服务启动：http://localhost:${PORT}`);
});
