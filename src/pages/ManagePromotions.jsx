import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Card, Table, Tag, Button, Typography, Modal, Form, Input, InputNumber, Select, Switch, Space, DatePicker, Popconfirm } from 'antd';
import { ArrowLeftOutlined, TagOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { jwtDecode } from 'jwt-decode';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

function ManagePromotions() {
  const navigate = useNavigate();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    try {
      const { role } = jwtDecode(token);
      if (role !== 'Admin') { navigate('/'); return; }
    } catch { navigate('/login'); return; }
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/promotions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPromos(res.data);
    } catch {
      toast.error('Không thể tải danh sách mã giảm giá!');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values) => {
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/promotions', {
        ...values,
        expiresAt: values.expiresAt.toISOString()
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Tạo mã giảm giá thành công!');
      setIsModalOpen(false);
      form.resetFields();
      fetchPromos();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Tạo mã thất bại!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/promotions/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Cập nhật trạng thái thành công!');
      fetchPromos();
    } catch {
      toast.error('Cập nhật thất bại!');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/promotions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Đã xóa mã giảm giá!');
      fetchPromos();
    } catch {
      toast.error('Xóa thất bại!');
    }
  };

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      render: (code) => <Text strong style={{ color: '#008080', fontSize: 15 }}>{code}</Text>
    },
    {
      title: 'Loại giảm',
      dataIndex: 'discountType',
      key: 'discountType',
      render: (type) => <Tag color={type === 'percent' ? 'blue' : 'purple'}>{type === 'percent' ? 'Phần trăm' : 'Cố định'}</Tag>
    },
    {
      title: 'Giá trị',
      key: 'value',
      render: (_, r) => r.discountType === 'percent' ? `${r.discountValue}%` : `${r.discountValue?.toLocaleString()}đ`
    },
    {
      title: 'Đơn tối thiểu',
      dataIndex: 'minOrderValue',
      key: 'minOrderValue',
      render: (v) => `${v?.toLocaleString()}đ`
    },
    {
      title: 'Đã dùng / Tối đa',
      key: 'usage',
      render: (_, r) => `${r.usedCount} / ${r.maxUsage}`
    },
    {
      title: 'Hết hạn',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Kích hoạt',
      key: 'isActive',
      render: (_, r) => (
        <Switch checked={r.isActive} onChange={() => handleToggle(r._id)} />
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, r) => (
        <Popconfirm title="Xóa mã này?" onConfirm={() => handleDelete(r._id)} okText="Xóa" cancelText="Không" okButtonProps={{ danger: true }}>
          <Button danger size="small" icon={<DeleteOutlined />} style={{ borderRadius: 6 }} />
        </Popconfirm>
      )
    }
  ];

  return (
    <div style={{ padding: '40px 50px', backgroundColor: '#fcfcfd', minHeight: '100vh' }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} style={{ marginBottom: 20, borderRadius: 8 }}>
        Quay lại
      </Button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={3} style={{ color: '#008080', margin: 0 }}>
          <TagOutlined /> Quản lý mã giảm giá
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          Tạo mã mới
        </Button>
      </div>

      <Card style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Table columns={columns} dataSource={promos} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title="Tạo mã giảm giá mới"
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Tạo mã"
        cancelText="Hủy"
        confirmLoading={submitting}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="code" label="Mã giảm giá" rules={[{ required: true, message: 'Nhập mã!' }]}>
            <Input placeholder="VD: SUMMER20" style={{ textTransform: 'uppercase' }} />
          </Form.Item>
          <Form.Item name="discountType" label="Loại giảm" rules={[{ required: true }]}>
            <Select placeholder="Chọn loại">
              <Select.Option value="percent">Phần trăm (%)</Select.Option>
              <Select.Option value="fixed">Số tiền cố định (đ)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="discountValue" label="Giá trị giảm" rules={[{ required: true, message: 'Nhập giá trị!' }]}>
            <InputNumber style={{ width: '100%' }} min={1} placeholder="VD: 20 hoặc 50000" />
          </Form.Item>
          <Form.Item name="minOrderValue" label="Đơn hàng tối thiểu (đ)">
            <InputNumber style={{ width: '100%' }} min={0} defaultValue={0} />
          </Form.Item>
          <Form.Item name="maxUsage" label="Số lượt dùng tối đa" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="expiresAt" label="Ngày hết hạn" rules={[{ required: true, message: 'Chọn ngày hết hạn!' }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabledDate={(d) => d && d < dayjs().startOf('day')} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ManagePromotions;
