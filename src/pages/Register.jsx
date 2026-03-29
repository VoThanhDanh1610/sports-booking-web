import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Form, Input, Button, Typography, Select, Space, Divider } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, ArrowLeftOutlined, RocketOutlined, PhoneOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

function Register() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/register', values);
      toast.success('Đăng ký thành công! Đăng nhập ngay thôi 🚀');
      navigate('/login');
    } catch (error) {
      // Hiển thị lỗi chi tiết từ Backend trả về
      const errorMsg = error.response?.data?.message || 'Đăng ký thất bại!';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5', padding: '20px' }}>
      <Card style={{ maxWidth: 480, width: '100%', borderRadius: 20, boxShadow: '0 15px 35px rgba(0,0,0,0.05)', border: 'none' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ background: '#e6fffb', width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
            <RocketOutlined style={{ fontSize: 30, color: '#008080' }} />
          </div>
          <Title level={2} style={{ color: '#008080', margin: 0 }}>Tham Gia Ngay</Title>
          <Text type="secondary">Khám phá và đặt sân thể thao trong tích tắc</Text>
        </div>

        <Form name="register_form" layout="vertical" onFinish={onFinish}>
          <Form.Item name="fullName" rules={[{ required: true, message: 'Tên bạn là gì nhỉ?' }]}>
            <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="Họ và tên" size="large" />
          </Form.Item>

          <Form.Item name="email" rules={[{ required: true, message: 'Nhập email để liên lạc nhé!' }, { type: 'email', message: 'Email không hợp lệ!' }]}>
            <Input prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} placeholder="Email" size="large" />
          </Form.Item>

          {/* 📞 BỔ SUNG Ô SỐ ĐIỆN THOẠI Ở ĐÂY */}
          <Form.Item name="phone" rules={[{ required: true, message: 'Backend yêu cầu số điện thoại nè!' }]}>
            <Input prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />} placeholder="Số điện thoại" size="large" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: 'Mật khẩu là bắt buộc!' }, { min: 6, message: 'Ít nhất 6 ký tự!' }]}>
            <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="Mật khẩu" size="large" />
          </Form.Item>

          {/* 1. Sửa initialValue thành "Customer" cho đúng "hộ khẩu" */}
<Form.Item name="role" label={<Text strong>Bạn tham gia với vai trò?</Text>} initialValue="Customer">
  <Select size="large">
    {/* 2. Sửa value thành "Customer" */}
    <Option value="Customer">Người đi thuê sân</Option>
    
    {/* 3. Sửa value thành "Owner" (Chữ O viết hoa) */}
    <Option value="Owner">Chủ sân thể thao</Option>
  </Select>
</Form.Item>

          <Button type="primary" htmlType="submit" block size="large" loading={loading} style={{ height: 50, borderRadius: 10, fontWeight: 600, fontSize: 16, marginTop: 10 }}>
            TẠO TÀI KHOẢN
          </Button>
        </Form>

        <Divider plain><Text type="secondary" style={{ fontSize: 12 }}>ĐÃ CÓ TÀI KHOẢN?</Text></Divider>

        <div style={{ textAlign: 'center' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Link to="/login" style={{ color: '#008080', fontWeight: 600 }}>Đăng nhập tại đây</Link>
            <Link to="/" style={{ color: '#8c8c8c', fontSize: 13 }}><ArrowLeftOutlined /> Quay lại trang chủ</Link>
          </Space>
        </div>
      </Card>
    </div>
  );
}

export default Register;