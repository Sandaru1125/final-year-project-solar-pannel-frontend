import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Divider, Alert } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  SafetyOutlined,
  LoginOutlined,
  GithubOutlined,
  GoogleOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import './Login.css'; // We'll create this file for custom styles

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Check if admin login
      if (values.email === 'admin' || adminMode) {
        const res = await api.post('/auth/admin/login', {
          username: values.email,
          password: values.password
        });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userRole', 'admin');
        message.success({
          content: 'Welcome back, Admin!',
          icon: <SafetyOutlined />,
        });
        navigate('/admin-dashboard');
        return;
      }

      // Normal user / technician login
      const res = await api.post('/users/login', values);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('userRole', res.data.user.role);

      message.success({
        content: `Welcome back, ${res.data.user.name || 'User'}!`,
        duration: 3,
      });

      if (res.data.user.role === 'technician') {
        navigate('/technician-dashboard');
      } else {
        navigate('/user-dashboard');
      }
    } catch (error) {
      message.error({
        content: error.response?.data?.message || error.response?.data?.error || 'Login failed. Please check your credentials.',
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminMode = () => {
    setAdminMode(!adminMode);
    message.info(adminMode ? 'Switched to user login' : 'Admin login mode activated');
  };

  return (
    <div className="login-container">
      {/* Animated background elements */}
      <div className="background-shape shape-1"></div>
      <div className="background-shape shape-2"></div>
      <div className="background-shape shape-3"></div>

      <Card className="login-card" bordered={false}>
        {/* Logo/Brand Section */}
        <div className="brand-section">
          <div className="logo-wrapper">
            <SafetyOutlined className="brand-icon" />
          </div>
          <Title level={2} className="brand-title">
            Solar<span className="brand-highlight">Care</span>
          </Title>
          <Text type="secondary" className="brand-subtitle">
            Your Trusted Solar Management Platform
          </Text>
        </div>

        {/* Admin Mode Toggle */}
        <div className="admin-toggle">
          <Button
            type={adminMode ? "primary" : "default"}
            icon={<SafetyOutlined />}
            onClick={toggleAdminMode}
            size="small"
            ghost={!adminMode}
          >
            {adminMode ? 'Admin Mode' : 'Switch to Admin'}
          </Button>
        </div>

        {adminMode && (
          <Alert
            message="Admin Login"
            description="Use your admin credentials to access the dashboard."
            type="info"
            showIcon
            className="admin-alert"
          />
        )}

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          className="login-form"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your Email or Username!' },
              { min: 3, message: 'Must be at least 3 characters' }
            ]}
          >
            <Input
              prefix={<UserOutlined className="input-icon" />}
              placeholder={adminMode ? "Admin username" : "Email address or username"}
              className="custom-input"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your Password!' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="input-icon" />}
              placeholder="Password"
              className="custom-input"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item className="forgot-password">
            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="login-button"
              icon={<LoginOutlined />}
            >
              {loading ? 'Logging in...' : 'Log in'}
            </Button>
          </Form.Item>

          <Divider plain className="divider-text">
            <Text type="secondary">or</Text>
          </Divider>

          {/* Social Login Options */}
          <div className="social-login">
            <Button
              icon={<GoogleOutlined />}
              className="social-button google"
              size="large"
              onClick={() => message.info('Google login coming soon!')}
            >
              Continue with Google
            </Button>
            <Button
              icon={<GithubOutlined />}
              className="social-button github"
              size="large"
              onClick={() => message.info('GitHub login coming soon!')}
            >
              Continue with GitHub
            </Button>
          </div>

          <div className="register-section">
            <Text type="secondary">Don't have an account? </Text>
            <Link to="/register" className="register-link">
              Create one now
            </Link>
          </div>
        </Form>

        {/* Demo Credentials */}
        <div className="demo-credentials">
          <Divider plain>
            <Text type="secondary">Demo Credentials</Text>
          </Divider>
          <div className="credentials-grid">
            <div className="cred-item">
              <Text type="secondary">User:</Text>
              <Text code>user@example.com / password123</Text>
            </div>
            <div className="cred-item">
              <Text type="secondary">Technician:</Text>
              <Text code>tech@example.com / password123</Text>
            </div>
            <div className="cred-item">
              <Text type="secondary">Admin:</Text>
              <Text code>admin / admin123</Text>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;