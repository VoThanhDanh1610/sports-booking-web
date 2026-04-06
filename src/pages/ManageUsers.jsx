import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Card, Table, Tag, Button, Typography, Tabs, Popconfirm, Space } from 'antd';
import { ArrowLeftOutlined, TeamOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { jwtDecode } from 'jwt-decode';

const { Title, Text } = Typography;

function ManageUsers() {
  const navigate = useNavigate();
  const [owners, setOwners] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    try {
      const { role } = jwtDecode(token);
      if (role !== 'Admin') { navigate('/'); return; }
    } catch { navigate('/login'); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ownersRes, customersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/users/owners', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/users/customers', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setOwners(ownersRes.data.data);
      setCustomers(customersRes.data.data);
    } catch {
      toast.error('Không thể tải danh sách người dùng!');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (userId, currentActive) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${userId}/toggle-active`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(currentActive ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại!');
    }
  };

  const makeColumns = () => [
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name) => <Text strong>{name}</Text>
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'SĐT', dataIndex: 'phone', key: 'phone' },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active) => (
        <Tag color={active ? 'green' : 'red'} style={{ borderRadius: 8 }}>
          {active ? 'Hoạt động' : 'Đã khóa'}
        </Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title={record.isActive ? 'Khóa tài khoản này?' : 'Mở khóa tài khoản này?'}
          description={record.isActive ? 'Người dùng sẽ không thể đăng nhập' : 'Người dùng sẽ đăng nhập lại được'}
          onConfirm={() => handleToggle(record._id, record.isActive)}
          okText={record.isActive ? 'Khóa' : 'Mở khóa'}
          cancelText="Hủy"
          okButtonProps={{ danger: record.isActive }}
        >
          <Button
            type={record.isActive ? 'default' : 'primary'}
            danger={record.isActive}
            icon={record.isActive ? <LockOutlined /> : <UnlockOutlined />}
          >
            {record.isActive ? 'Khóa' : 'Mở khóa'}
          </Button>
        </Popconfirm>
      )
    }
  ];

  const tabs = [
    {
      key: 'owners',
      label: `Chủ sân (${owners.length})`,
      children: (
        <Table columns={makeColumns()} dataSource={owners} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />
      )
    },
    {
      key: 'customers',
      label: `Khách hàng (${customers.length})`,
      children: (
        <Table columns={makeColumns()} dataSource={customers} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />
      )
    }
  ];

  return (
    <div style={{ padding: '40px 50px', backgroundColor: '#fcfcfd', minHeight: '100vh' }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} style={{ marginBottom: 20, borderRadius: 8 }}>
        Quay lại
      </Button>
      <Title level={3} style={{ color: '#008080', marginBottom: 24 }}>
        <TeamOutlined /> Quản lý người dùng
      </Title>
      <Card style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Tabs items={tabs} defaultActiveKey="owners" />
      </Card>
    </div>
  );
}

export default ManageUsers;
