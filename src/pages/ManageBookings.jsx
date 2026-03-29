import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Card, Table, Tag, Button, Typography, Select, Space, Empty, Radio } from 'antd';
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
  const [allBookings, setAllBookings] = useState([]);
  const [selectedField, setSelectedField] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== 'Owner' && decoded.role !== 'Admin') {
        navigate('/'); return;
      }
    } catch { navigate('/login'); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/fields', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fieldList = res.data.data || res.data;
      setFields(fieldList);
      if (fieldList.length === 0) { setLoading(false); return; }

      const results = await Promise.all(
        fieldList.map(f =>
          axios.get(`http://localhost:5000/api/bookings/field/${f._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }).then(r => r.data.map(b => ({ ...b, fieldName: f.name })))
            .catch(() => [])
        )
      );
      const combined = results.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAllBookings(combined);
    } catch {
      toast.error('Không thể tải dữ liệu!');
    } finally {
      setLoading(false);
    }
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
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại!');
    }
  };

  const displayedBookings = allBookings
    .filter(b => selectedField === 'all' || String(b.field?._id || b.field) === selectedField)
    .filter(b => selectedStatus === 'all' || b.status === selectedStatus);

  const columns = [
    {
      title: 'Sân',
      key: 'fieldName',
      render: (_, r) => <Text strong style={{ color: '#008080' }}>{r.fieldName || r.field?.name}</Text>
    },
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
      render: (_, r) => `${r.startTime} - ${r.endTime}`
    },
    {
      title: 'Tổng tiền',
      key: 'price',
      render: (_, r) => (
        <Text strong style={{ color: '#008080' }}>
          {(r.finalPrice ?? r.totalPrice).toLocaleString()}đ
        </Text>
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
            <Button size="small" type="primary" style={{ borderRadius: 6 }}
              onClick={() => handleUpdateStatus(record._id, 'confirmed')}>
              Xác nhận
            </Button>
          )}
          {record.status === 'confirmed' && (
            <Button size="small" style={{ borderRadius: 6, borderColor: '#008080', color: '#008080' }}
              onClick={() => handleUpdateStatus(record._id, 'completed')}>
              Hoàn thành
            </Button>
          )}
          {(record.status === 'pending' || record.status === 'confirmed') && (
            <Button size="small" danger style={{ borderRadius: 6 }}
              onClick={() => handleUpdateStatus(record._id, 'cancelled')}>
              Hủy
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '40px 50px', backgroundColor: '#fcfcfd', minHeight: '100vh' }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} style={{ marginBottom: 20, borderRadius: 8 }}>
        Quay lại
      </Button>

      <Title level={3} style={{ color: '#008080' }}>
        <ScheduleOutlined /> Quản lý đặt sân
      </Title>

      <Card style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Text strong>Sân:</Text>
          <Select
            value={selectedField}
            onChange={setSelectedField}
            style={{ width: 240 }}
            options={[
              { value: 'all', label: 'Tất cả sân' },
              ...fields.map(f => ({ value: f._id, label: f.name }))
            ]}
          />
          <Text strong style={{ marginLeft: 8 }}>Trạng thái:</Text>
          <Radio.Group
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="all">Tất cả</Radio.Button>
            <Radio.Button value="pending">
              <Tag color="gold" style={{ margin: 0, borderRadius: 4 }}>Chờ xác nhận</Tag>
            </Radio.Button>
            <Radio.Button value="confirmed">
              <Tag color="cyan" style={{ margin: 0, borderRadius: 4 }}>Đã xác nhận</Tag>
            </Radio.Button>
            <Radio.Button value="completed">
              <Tag color="green" style={{ margin: 0, borderRadius: 4 }}>Hoàn thành</Tag>
            </Radio.Button>
            <Radio.Button value="cancelled">
              <Tag color="red" style={{ margin: 0, borderRadius: 4 }}>Đã hủy</Tag>
            </Radio.Button>
          </Radio.Group>
          <Text type="secondary">({displayedBookings.length} đơn)</Text>
        </div>

        {!loading && displayedBookings.length === 0 ? (
          <Empty description="Chưa có đơn đặt sân nào" />
        ) : (
          <Table
            columns={columns}
            dataSource={displayedBookings}
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
