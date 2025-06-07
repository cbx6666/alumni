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
app.use(cors({
  origin: 'http://localhost:5173', // 明确指定你的前端源
  credentials: true // 允许前端请求携带 Cookie
}));

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
  const { email, password } = req.body;
  console.log('登录请求体:', req.body);

  if (!email || !password) {
    return res.status(400).json({ message: '邮箱和密码不能为空' });
  }

  let connection;
  try {
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_DSN
    });

    const result = await connection.execute(
      `SELECT ACCOUNT_ID, LOGIN_EMAIL, PASSWORD, NICKNAME, STUDENT_ID FROM accounts WHERE login_email = :email AND is_active = 1`,
      { email },
      { outFormat: oracledb.OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '账号不存在或未激活' });
    }

    const account = result.rows[0];
    console.log('[登录接口调试] 从数据库查到的原始 account 对象:', account);

    const passwordMatch = (password === account.PASSWORD);
    if (!passwordMatch) {
      return res.status(401).json({ message: '密码错误' });
    }

    req.session.loggedIn = true;
    req.session.user = {
      id: account.ACCOUNT_ID,
      studentId: account.STUDENT_ID,
      nickname: account.NICKNAME || '',
      email: account.LOGIN_EMAIL
    };

    const userPayload = {
      id: account.ACCOUNT_ID,
      studentId: account.STUDENT_ID,
      nickname: account.NICKNAME || '',
      username: account.LOGIN_EMAIL,
      email: account.LOGIN_EMAIL,
      avatar: '/default/avatar.jpg'
    };

    // 决定性日志：打印出我们最终发给前端的数据
    console.log('[决定性日志] 准备发送给前端的 user 对象:', userPayload);

    res.json({
      success: true,
      token: 'mocked-token-123',
      user: userPayload
    });

  } catch (err) {
    console.error('登录失败:', err);
    res.status(500).json({ message: '服务器错误' });
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

// 查看所有校友的基本信息
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

// 查看一个校友的全部信息
app.get('/alumni/:student_id/details', requireLogin, async (req, res) => {
  const studentId = req.params.student_id;
  console.log(`[调试信息] 收到请求，正在尝试获取学号为: "${studentId}" 的详细信息...`);
  let connection;

  try {
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_DSN
    });

    const [alumniResult, classResult, interestResult, experienceResult, imageResult, accountResult] = await Promise.all([
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
      ),

      connection.execute(
        `SELECT nickname
         FROM accounts
         WHERE student_id = :id`,
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
      nickname: accountResult.rows[0] ? accountResult.rows[0].NICKNAME : null,
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

// 修改账号密码
app.post('/alumni/:student_id/update-password', requireLogin, async (req, res) => {
  const studentId = req.params.student_id;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.trim() === '') {
    return res.status(400).json({ message: '新密码不能为空' });
  }

  // 新增：密码长度校验
  if (newPassword.length < 6) {
    return res.status(400).json({ message: '密码长度不能少于6位' });
  }

  let connection;
  try {
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_DSN
    });

    const result = await connection.execute(
      `UPDATE accounts SET password = :pwd WHERE student_id = :id`,
      { pwd: newPassword, id: studentId },
      { autoCommit: true } // 对于 DML 操作 (UPDATE, INSERT, DELETE)，必须设置 autoCommit
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: '未找到该学号对应的账号' });
    }

    res.json({ success: true, message: '密码修改成功' });

  } catch (err) {
    console.error(`为学号 ${studentId} 修改密码失败:`, err);
    res.status(500).json({ message: '服务器错误，修改密码失败' });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

// 修改昵称
app.post('/alumni/:student_id/update-nickname', requireLogin, async (req, res) => {
  const studentId = req.params.student_id;
  const { newNickname } = req.body;

  // 校验昵称是否为空或仅有空白字符
  if (typeof newNickname !== 'string' || newNickname.trim() === '') {
    return res.status(400).json({ message: '昵称不能为空' });
  }

  let connection;
  try {
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_DSN
    });

    const result = await connection.execute(
      `UPDATE accounts SET nickname = :nickname WHERE student_id = :id`,
      { nickname: newNickname.trim(), id: studentId },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: '未找到该学号对应的账号' });
    }

    res.json({ success: true, message: '昵称修改成功' });

  } catch (err) {
    console.error(`为学号 ${studentId} 修改昵称失败:`, err);
    res.status(500).json({ message: '服务器错误，修改昵称失败' });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`登录服务启动：http://localhost:${PORT}`);
});
