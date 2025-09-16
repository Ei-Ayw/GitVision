const express = require('express');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// GitHub OAuth配置
const GITHUB_CLIENT_ID = process.env.VITE_GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.VITE_GITHUB_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production';

// 内存存储用户数据（生产环境请使用数据库）
const users = new Map();

// GitHub OAuth登录
app.post('/api/auth/github', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: '缺少授权码'
      });
    }

    // 1. 用code换取access_token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code: code
    }, {
      headers: {
        'Accept': 'application/json'
      }
    });

    const { access_token, error } = tokenResponse.data;
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'GitHub授权失败: ' + error
      });
    }

    // 2. 获取用户信息
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${access_token}`
      }
    });

    const user = userResponse.data;

    // 3. 获取用户邮箱
    let primaryEmail = user.email;
    try {
      const emailResponse = await axios.get('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `token ${access_token}`
        }
      });
      
      const primaryEmailObj = emailResponse.data.find(email => email.primary);
      if (primaryEmailObj) {
        primaryEmail = primaryEmailObj.email;
      }
    } catch (emailError) {
      console.log('获取邮箱失败，使用默认邮箱:', emailError.message);
    }

    // 4. 生成JWT token
    const payload = {
      userId: user.id,
      username: user.login,
      email: primaryEmail,
      avatarUrl: user.avatar_url
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

    // 5. 保存用户信息
    users.set(user.id, {
      ...payload,
      githubAccessToken: access_token,
      createdAt: new Date().toISOString()
    });

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.login,
          email: primaryEmail,
          avatarUrl: user.avatar_url
        },
        expiresIn: 7 * 24 * 60 * 60 // 7天，单位秒
      }
    });

  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误: ' + error.message
    });
  }
});

// 刷新Token
app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: '缺少刷新令牌'
      });
    }

    // 验证refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const user = users.get(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 生成新的access token
    const newAccessToken = jwt.sign({
      userId: user.userId,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl
    }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        expiresIn: 7 * 24 * 60 * 60
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Token刷新失败: ' + error.message
    });
  }
});

// GitHub OAuth回调处理 (GET请求)
app.get('/api/auth/github/callback', async (req, res) => {
  const { code, error } = req.query;
  
  if (error) {
    console.error('GitHub OAuth error:', error);
    return res.redirect(`http://localhost:5173/login?error=${encodeURIComponent(error)}`);
  }
  
  if (!code) {
    return res.redirect('http://localhost:5173/login?error=missing_code');
  }
  
  try {
    // 1. 用code换取access_token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code: code
    }, {
      headers: {
        'Accept': 'application/json'
      }
    });

    const { access_token, error: tokenError } = tokenResponse.data;
    
    if (tokenError) {
      console.error('Token exchange error:', tokenError);
      return res.redirect(`http://localhost:5173/login?error=${encodeURIComponent(tokenError)}`);
    }

    // 2. 获取用户信息
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${access_token}`
      }
    });

    const user = userResponse.data;

    // 3. 获取用户邮箱
    let primaryEmail = user.email;
    try {
      const emailResponse = await axios.get('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `token ${access_token}`
        }
      });
      
      const primaryEmailObj = emailResponse.data.find(email => email.primary);
      if (primaryEmailObj) {
        primaryEmail = primaryEmailObj.email;
      }
    } catch (emailError) {
      console.log('获取邮箱失败，使用默认邮箱:', emailError.message);
    }

    // 4. 生成JWT token
    const payload = {
      userId: user.id,
      username: user.login,
      email: primaryEmail,
      avatarUrl: user.avatar_url
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

    // 5. 保存用户信息
    users.set(user.id, {
      ...payload,
      githubAccessToken: access_token,
      createdAt: new Date().toISOString()
    });

    // 6. 重定向到前端，携带token
    const redirectUrl = `http://localhost:5173/login?token=${accessToken}&refresh=${refreshToken}&user=${encodeURIComponent(JSON.stringify(payload))}`;
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    res.redirect(`http://localhost:5173/login?error=${encodeURIComponent(error.message)}`);
  }
});

// 登出
app.post('/api/auth/logout', (req, res) => {
  // 这里可以添加token黑名单逻辑
  res.json({
    success: true,
    message: '登出成功'
  });
});

// 获取用户信息
app.get('/api/user/profile', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: '缺少认证令牌'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.get(decoded.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: {
        id: user.userId,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl
      }
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: '无效的认证令牌'
    });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '服务器运行正常',
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📋 GitHub Client ID: ${GITHUB_CLIENT_ID}`);
  console.log(`🔗 OAuth回调地址: http://localhost:${PORT}/api/auth/github/callback`);
});
