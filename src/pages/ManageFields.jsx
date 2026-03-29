import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Typography, Popconfirm, Select, Upload } from 'antd'; 
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { toast } from 'react-toastify';

const { Title } = Typography;
const { Option } = Select;

function ManageFields() {
  const [fields, setFields] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [fileList, setFileList] = useState([]);
  
  const [form] = Form.useForm();
  const token = localStorage.getItem('token');

  // Lấy danh sách sân
  const fetchFields = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/fields');
      setFields(res.data.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách sân:", error);
    }
  };

  // Lấy danh sách loại sân
  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/categories');
      setCategories(res.data.data || []);
    } catch (error) {
      console.error("Lỗi lấy loại sân:", error);
    }
  };

  useEffect(() => { 
    fetchFields(); 
    fetchCategories(); 
  }, []);

  const handleChangeImage = ({ fileList: newFileList }) => setFileList(newFileList);

  const handleAddEdit = async (values) => {
  try {
    // CHỈ LẤY những ảnh đã upload thành công (status === 'done')
    const imageUrls = fileList
      .filter(file => file.status === 'done')
      .map(file => {
        // Lấy đường dẫn từ phản hồi của server (Backend trả về imageUrl)
        const path = file.response?.imageUrl || file.url || "";
        return path.replace('http://localhost:5000', ''); // Chỉ lưu phần /uploads/...
      })
      .filter(p => p !== ""); // Loại bỏ chuỗi rỗng

    // Kiểm tra nếu không có ảnh thì báo lỗi, không cho lưu rỗng vào DB
    if (imageUrls.length === 0) {
      return toast.error("Danh ơi, đợi ảnh tải xong (hiện hình nhỏ) rồi mới bấm Xác nhận nhé!");
    }

    const finalData = { 
      ...values, 
      images: imageUrls,
      category: typeof values.category === 'object' ? values.category._id : values.category
    };

    if (editingField) {
      await axios.put(`http://localhost:5000/api/fields/${editingField._id}`, finalData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Cập nhật sân thành công! 🎉');
    } else {
      await axios.post('http://localhost:5000/api/fields', finalData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Thêm sân mới thành công! 🚀');
    }
    
    setIsModalOpen(false);
    fetchFields();
  } catch (error) {
    toast.error(error.response?.data?.message || 'Thao tác thất bại!');
  }
};

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/fields/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Đã xóa sân!');
      fetchFields();
    } catch (error) {
      toast.error('Không thể xóa sân này!');
    }
  };

  const columns = [
    { 
      title: 'Hình ảnh', 
      dataIndex: 'images', 
      key: 'images',
      render: (images) => {
        const firstImage = (images && images[0] && images[0] !== "null") ? images[0] : null;
        
        // Logic hiển thị an toàn: Xử lý cả link tuyệt đối và tương đối
        const src = firstImage 
          ? (firstImage.startsWith('http') ? firstImage : `http://localhost:5000${firstImage.startsWith('/') ? '' : '/'}${firstImage}`)
          : 'https://via.placeholder.com/50';

        return (
          <img 
            src={src} 
            alt="sân" 
            style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} 
            onError={(e) => { e.target.src = 'https://via.placeholder.com/50'; }}
          />
        );
      }
    },
    { title: 'Tên sân', dataIndex: 'name', key: 'name' },
    { title: 'Địa chỉ', dataIndex: 'location', key: 'location' },
    { 
      title: 'Giá/Giờ', 
      dataIndex: 'pricePerHour', 
      render: (val) => `${val?.toLocaleString() || 0}đ` 
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => { 
            setEditingField(record); 
            form.setFieldsValue({
              ...record,
              category: record.category?._id || record.category 
            }); 
            
            if (record.images) {
              const oldImages = record.images.map((img, index) => {
                const path = img.startsWith('/') ? img : `/${img}`;
                return {
                  uid: index,
                  name: `image-${index}`,
                  status: 'done',
                  url: img.startsWith('http') ? img : `http://localhost:5000${path}`,
                };
              });
              setFileList(oldImages);
            } else {
              setFileList([]);
            }
            setIsModalOpen(true); 
          }} />
          <Popconfirm title="Xóa sân này?" onConfirm={() => handleDelete(record._id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Title level={2}>Quản lý sân của tôi</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large" 
          onClick={() => { 
            setEditingField(null); 
            form.resetFields(); 
            setFileList([]); 
            setIsModalOpen(true); 
          }}
        >
          Thêm sân mới
        </Button>
      </div>

      <Table columns={columns} dataSource={fields} rowKey="_id" />

      <Modal 
        title={editingField ? "Chỉnh sửa sân" : "Thêm sân mới"} 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Xác nhận"
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleAddEdit}>
          <Form.Item label="Hình ảnh sân (Tối đa 5 ảnh)">
            <Upload
              action="http://localhost:5000/api/fields/upload"
              listType="picture-card"
              fileList={fileList}
              onChange={handleChangeImage}
              maxCount={5}
            >
              {fileList.length < 5 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Tải ảnh</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item name="name" label="Tên sân" rules={[{ required: true, message: 'Vui lòng nhập tên sân!' }]}><Input /></Form.Item>
          
          <Form.Item name="category" label="Loại sân" rules={[{ required: true, message: 'Vui lòng chọn loại sân!' }]}>
            <Select placeholder="Chọn loại thể thao">
              {categories.map(cat => (
                <Option key={cat._id} value={cat._id}>{cat.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="location" label="Địa chỉ" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}><Input /></Form.Item>
          <Form.Item name="pricePerHour" label="Giá mỗi giờ (VNĐ)" rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}><InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ManageFields;