import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Card, Table, Tag, Button, Typography, Empty } from 'antd';
import { ArrowLeftOutlined, WalletOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function MyPayments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    const fetchPayments = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/payments/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPayments(res.data);
      } catch {
        toast.error('Không thể tải lịch sử thanh toán!');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const columns = [
    {
      title: 'Sân',
      key: 'field',
      render: (_, r) => <Text strong>{r.booking?.field?.name || '—'}</Text>
    },
    {
      title: 'Ngày đặt',
      key: 'date',
      render: (_, r) => r.booking?.date ? new Date(r.booking.date).toLocaleDateString('vi-VN') : '—'
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <Text strong style={{ color: '#008080' }}>{amount?.toLocaleString()}đ</Text>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const map = {
          completed:       { color: 'green',  label: 'Đã thanh toán' },
          pending_payment: { color: 'gold',   label: 'Chờ thanh toán' },
          cancelled:       { color: 'red',    label: 'Đã hủy' }
        };
        const { color, label } = map[status] || { color: 'default', label: status };
        return <Tag color={color} style={{ borderRadius: 6 }}>{label}</Tag>;
      }
    },
    {
      title: 'Ngày giao dịch',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString('vi-VN')
    }
  ];

  return (
    <div style={{ padding: '40px 50px', backgroundColor: '#fcfcfd', minHeight: '100vh' }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} style={{ marginBottom: 20, borderRadius: 8 }}>
        Quay lại
      </Button>
      <Title level={3} style={{ color: '#008080' }}>
        <WalletOutlined /> Lịch sử thanh toán
      </Title>
      <Card style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        {!loading && payments.length === 0 ? (
          <Empty description="Chưa có giao dịch nào" />
        ) : (
          <Table columns={columns} dataSource={payments} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />
        )}
      </Card>
    </div>
  );
}

export default MyPayments;
