import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // 1. Lấy token từ trình duyệt
  const token = localStorage.getItem('token');
  
  // 2. Tạo gói cấu hình chứa Token để "mở cửa" Backend
  const authConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // Kẹp authConfig vào gọi API
      const res = await axios.get('http://localhost:5000/api/categories', authConfig);
      setCategories(res.data.data || res.data);
    } catch (error) {
      message.error('Lỗi tải dữ liệu danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (record = null) => {
    setEditingId(record ? record._id : null);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingId) {
        // Kẹp authConfig vào gọi API
        await axios.put(`http://localhost:5000/api/categories/${editingId}`, values, authConfig);
        message.success('Cập nhật thành công');
      } else {
        // Kẹp authConfig vào gọi API
        await axios.post('http://localhost:5000/api/categories', values, authConfig);
        message.success('Thêm danh mục thành công');
      }
      setIsModalVisible(false);
      fetchCategories();
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu: Không có quyền hoặc token hết hạn');
    }
  };

  const handleDelete = async (id) => {
    try {
      // Kẹp authConfig vào gọi API
      await axios.delete(`http://localhost:5000/api/categories/${id}`, authConfig);
      message.success('Xóa danh mục thành công');
      fetchCategories();
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa');
    }
  };

  const columns = [
    { 
      title: 'Tên loại sân', 
      dataIndex: 'name', 
      key: 'name',
      render: (text) => <strong>{text}</strong>
    },
    { 
      title: 'Mô tả', 
      dataIndex: 'description', 
      key: 'description' 
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="primary" ghost icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Popconfirm title="Bạn có chắc chắn muốn xóa loại sân này?" onConfirm={() => handleDelete(record._id)}>
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '40px 50px', background: '#f4f7f6', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h2 style={{ margin: 0, color: '#008080' }}>Quản lý Loại Sân</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()} style={{ background: 'linear-gradient(135deg, #00c2c2 0%, #008080 100%)', border: 'none' }}>
          Thêm danh mục
        </Button>
      </div>

      <Table 
        dataSource={categories} 
        columns={columns} 
        rowKey="_id" 
        loading={loading}
        style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
      />

      <Modal 
        title={editingId ? 'Sửa loại sân' : 'Thêm loại sân mới'} 
        open={isModalVisible} 
        onCancel={() => setIsModalVisible(false)} 
        onOk={() => form.submit()}
        okText="Lưu lại"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 20 }}>
          <Form.Item name="name" label="Tên loại sân (VD: Sân bóng đá, Sân Tennis)" rules={[{ required: true, message: 'Vui lòng nhập tên loại sân!' }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ManageCategories;