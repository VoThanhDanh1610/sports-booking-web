import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Card, Table, Tag, Button, Typography, Select, Space, Empty } from 'antd';
import { ArrowLeftOutlined, ScheduleOutlined } from '@ant-design/icons';
import { jwtDecode } from 'jwt-decode';

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

function ManageBookings() {
  const navigate = useNavigate();
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== 'Owner' && decoded.role !== 'Admin') {
        toast.error('Bạn không có quyền truy cập!');
        navigate('/');
        return;
      }
    } catch {
      navigate('/login');
      return;
    }
    fetchMyFields();
  }, []);

  const fetchMyFields = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/fields', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allFields = res.data.data || res.data;
      setFields(allFields);
      if (allFields.length > 0) {
        setSelectedField(allFields[0]._id);
        fetchBookingsByField(allFields[0]._id);
      }
    } catch {
      toast.error('Không thể tải danh sách sân!');
    }
  };

  const fetchBookingsByField = async (fieldId) => {
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/bookings/field/${fieldId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch {
      toast.error('Không thể tải danh sách đặt sân!');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldId) => {
    setSelectedField(fieldId);
    fetchBookingsByField(fieldId);
  };

  const handleUpdateStatus = async (bookingId, status) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `http://localhost:5000/api/bookings/${bookingId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Cập nhật trạng thái thành công!');
      fetchBookingsByField(selectedField);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại!');
    }
  };

  const columns = [
    {
      title: 'Khách hàng',
      dataIndex: ['customer', 'fullName'],
      key: 'customer',
      render: (name) => <Text strong>{name}</Text>
    },
    {
      title: 'SĐT',
      dataIndex: ['customer', 'phone'],
      key: 'phone'
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
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <Button
              size="small"
              type="primary"
              style={{ borderRadius: 6 }}
              onClick={() => handleUpdateStatus(record._id, 'confirmed')}
            >
              Xác nhận
            </Button>
          )}
          {record.status === 'confirmed' && (
            <Button
              size="small"
              style={{ borderRadius: 6, borderColor: '#008080', color: '#008080' }}
              onClick={() => handleUpdateStatus(record._id, 'completed')}
            >
              Hoàn thành
            </Button>
          )}
          {(record.status === 'pending' || record.status === 'confirmed') && (
            <Button
              size="small"
              danger
              style={{ borderRadius: 6 }}
              onClick={() => handleUpdateStatus(record._id, 'cancelled')}
            >
              Hủy
            </Button>
          )}
        </Space>
      )
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
        <ScheduleOutlined /> Quản lý đặt sân
      </Title>

      <Card style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: 20 }}>
          <Text strong>Chọn sân: </Text>
          <Select
            value={selectedField}
            onChange={handleFieldChange}
            style={{ width: 300, marginLeft: 8 }}
            options={fields.map(f => ({ value: f._id, label: f.name }))}
            placeholder="-- Chọn sân --"
          />
        </div>

        {!loading && bookings.length === 0 ? (
          <Empty description="Chưa có đặt sân nào cho sân này" />
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

export default ManageBookings;
