import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Card, Table, Button, Typography, Modal, Form, Input, Space,
  Popconfirm, Upload, Switch
} from 'antd';
import { ArrowLeftOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ShopOutlined } from '@ant-design/icons';

const { Title } = Typography;

function ManageVenues() {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/venues/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVenues(res.data.data);
    } catch {
      toast.error('Không thể tải danh sách khu thể thao!');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingVenue(null);
    form.resetFields();
    setFileList([]);
    setIsModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingVenue(record);
    form.setFieldsValue({ name: record.name, address: record.address, description: record.description });
    setFileList(
      (record.images || []).map((img, i) => ({
        uid: i,
        name: `image-${i}`,
        status: 'done',
        url: img.startsWith('http') ? img : `http://localhost:5000${img}`
      }))
    );
    setIsModalOpen(true);
  };

  const handleSubmit = async (values) => {
    const imageUrls = fileList
      .filter(f => f.status === 'done')
      .map(f => {
        const path = f.response?.imageUrl || f.url || '';
        return path.replace('http://localhost:5000', '');
      })
      .filter(Boolean);

    if (imageUrls.length === 0) {
      toast.error('Vui lòng tải ít nhất 1 ảnh!');
      return;
    }

    setSubmitting(true);
    try {
      if (editingVenue) {
        await axios.put(`http://localhost:5000/api/venues/${editingVenue._id}`,
          { ...values, images: imageUrls },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Cập nhật khu thể thao thành công!');
      } else {
        await axios.post('http://localhost:5000/api/venues',
          { ...values, images: imageUrls },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Tạo khu thể thao thành công!');
      }
      setIsModalOpen(false);
      fetchVenues();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/venues/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Đã xóa khu thể thao!');
      fetchVenues();
    } catch {
      toast.error('Xóa thất bại!');
    }
  };

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'images',
      key: 'images',
      render: (images) => {
        const src = images?.[0]
          ? (images[0].startsWith('http') ? images[0] : `http://localhost:5000${images[0]}`)
          : 'https://via.placeholder.com/50';
        return <img src={src} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} onError={e => { e.target.src = 'https://via.placeholder.com/50'; }} />;
      }
    },
    { title: 'Tên khu', dataIndex: 'name', key: 'name' },
    { title: 'Địa chỉ', dataIndex: 'address', key: 'address' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm
            title="Xóa khu này sẽ bỏ liên kết các sân bên trong. Tiếp tục?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa" cancelText="Không" okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
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
          <ShopOutlined /> Quản lý khu thể thao
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
          Thêm khu mới
        </Button>
      </div>

      <Card style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Table columns={columns} dataSource={venues} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={editingVenue ? 'Chỉnh sửa khu thể thao' : 'Thêm khu thể thao mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingVenue ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
        confirmLoading={submitting}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Ảnh khu thể thao (tối đa 5)">
            <Upload
              action="http://localhost:5000/api/venues/upload"
              headers={{ Authorization: `Bearer ${token}` }}
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList: fl }) => setFileList(fl)}
              maxCount={5}
            >
              {fileList.length < 5 && <div><PlusOutlined /><div style={{ marginTop: 8 }}>Tải ảnh</div></div>}
            </Upload>
          </Form.Item>
          <Form.Item name="name" label="Tên khu thể thao" rules={[{ required: true, message: 'Nhập tên khu!' }]}>
            <Input placeholder="VD: Khu thể thao Phú Lâm" />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: 'Nhập địa chỉ!' }]}>
            <Input placeholder="VD: 123 Nguyễn Văn Linh, Q.7" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Giới thiệu về khu thể thao..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ManageVenues;
