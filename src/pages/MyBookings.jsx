import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Card, Table, Tag, Button, Typography, Empty, Popconfirm } from 'antd';
import { ArrowLeftOutlined, CalendarOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const STATUS_COLOR = {
  pending: 'gold',
  confirmed: 'cyan',
  cancelled: 'red',
  completed: 'green'
};

const STATUS_LABEL = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã hủy',
  completed: 'Hoàn thành'
};

function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.warning('Vui lòng đăng nhập!');
      navigate('/login');
      return;
    }
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/bookings/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch {
      toast.error('Không thể tải lịch sử đặt sân!');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `http://localhost:5000/api/bookings/${bookingId}/status`,
        { status: 'cancelled' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Đã hủy đặt sân!');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Hủy thất bại!');
    }
  };

  const columns = [
    {
      title: 'Sân',
      dataIndex: ['field', 'name'],
      key: 'field',
      render: (name) => <Text strong>{name}</Text>
    },
    {
      title: 'Địa chỉ',
      dataIndex: ['field', 'location'],
      key: 'location'
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Giờ',
      key: 'time',
      render: (_, record) => `${record.startTime} - ${record.endTime}`
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => (
        <Text strong style={{ color: '#008080' }}>{price.toLocaleString()}đ</Text>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={STATUS_COLOR[status]} style={{ borderRadius: 6 }}>
          {STATUS_LABEL[status]}
        </Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) =>
        record.status === 'pending' || record.status === 'confirmed' ? (
          <Popconfirm
            title="Xác nhận hủy đặt sân?"
            onConfirm={() => handleCancel(record._id)}
            okText="Hủy đặt"
            cancelText="Không"
            okButtonProps={{ danger: true }}
          >
            <Button danger size="small" style={{ borderRadius: 6 }}>Hủy</Button>
          </Popconfirm>
        ) : null
    }
  ];

  return (
    <div style={{ padding: '40px 50px', backgroundColor: '#fcfcfd', minHeight: '100vh' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/')}
        style={{ marginBottom: 20, borderRadius: 8 }}
      >
        Quay lại
      </Button>

      <Title level={3} style={{ color: '#008080' }}>
        <CalendarOutlined /> Lịch sử đặt sân của tôi
      </Title>

      <Card style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        {!loading && bookings.length === 0 ? (
          <Empty description="Bạn chưa có đặt sân nào" />
        ) : (
          <Table
            columns={columns}
            dataSource={bookings}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>
    </div>
  );
}

export default MyBookings;
