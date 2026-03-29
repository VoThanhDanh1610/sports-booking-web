import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Form, Input, Button, Typography, Space } from 'antd';
import { MailOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: values.email,
        password: values.password
      });

      localStorage.setItem('token', response.data.data.token);
      toast.success('Chào mừng bạn quay trở lại! 🎉');

      navigate('/');
      window.location.reload();
    } catch (error) {
      toast.error('Email hoặc mật khẩu không đúng, thử lại nhé!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: '#f4f7f6', // Màu nền xám nhạt sang trọng
      padding: '20px'
    }}>
      <Card 
        style={{ 
          maxWidth: 450, 
          width: '100%', 
          borderRadius: 16, 
          boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
          border: 'none'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <Title level={2} style={{ color: '#008080', marginBottom: 8 }}>Đăng Nhập</Title>
          <Text type="secondary">Vui lòng nhập thông tin để tiếp tục</Text>
        </div>

        <Form
          name="login_form"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Vui lòng nhập Email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}
          >
            <Input 
              prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} 
              placeholder="Email của bạn" 
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Mật khẩu"
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              size="large" 
              loading={loading}
              style={{ 
                height: 48, 
                borderRadius: 8, 
                fontSize: 16, 
                fontWeight: 600,
                marginTop: 10
              }}
            >
              ĐĂNG NHẬP NGAY
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Space direction="vertical" size={12}>
            <Text type="secondary">
              Chưa có tài khoản? <Link to="/register" style={{ color: '#008080', fontWeight: 600 }}>Đăng ký ngay</Link>
            </Text>
            <Link to="/" style={{ color: '#8c8c8c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeftOutlined style={{ marginRight: 5 }} /> Quay lại trang chủ
            </Link>
          </Space>
        </div>
      </Card>
    </div>
  );
}

export default Login;