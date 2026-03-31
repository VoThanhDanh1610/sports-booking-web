import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Typography, Popconfirm, Select, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

import axios from 'axios';
import { toast } from 'react-toastify';
import { useProvinces, fetchDistricts } from '../hooks/useProvinces';

const { Title } = Typography;

function ManageFields() {
  const [fields, setFields] = useState([]);
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  const { provinces, loadingProvinces } = useProvinces();
  const [form] = Form.useForm();
  const token = localStorage.getItem('token');

  // Lấy danh sách sân của chính owner đang đăng nhập
  const fetchFields = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/fields/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFields(res.data.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách sân:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/categories');
      setCategories(res.data.data || []);
    } catch (error) {
      console.error("Lỗi lấy loại sân:", error);
    }
  };

  const fetchVenues = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/venues/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVenues(res.data.data || []);
    } catch {}
  };

  useEffect(() => {
    fetchFields();
    fetchCategories();
    fetchVenues();
  }, []);

  const handleChangeImage = ({ fileList: newFileList }) => setFileList(newFileList);

  const handleProvinceChange = async (provinceName) => {
    form.setFieldValue('district', undefined);
    setDistricts([]);
    if (!provinceName) return;
    const province = provinces.find(p => p.name === provinceName);
    if (!province) return;
    setLoadingDistricts(true);
    try {
      const list = await fetchDistricts(province.code);
      setDistricts(list);
    } catch {}
    finally { setLoadingDistricts(false); }
  };

  // Load quận huyện khi mở modal edit (province đã có sẵn)
  const loadDistrictsForEdit = async (provinceName) => {
    if (!provinceName || provinces.length === 0) return;
    const province = provinces.find(p => p.name === provinceName);
    if (!province) return;
    setLoadingDistricts(true);
    try {
      const list = await fetchDistricts(province.code);
      setDistricts(list);
    } catch {}
    finally { setLoadingDistricts(false); }
  };

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
      category: typeof values.category === 'object' ? values.category._id : values.category,
      venue: values.venue || null
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
            setDistricts([]);
            form.setFieldsValue({
              ...record,
              category: record.category?._id || record.category,
              venue: record.venue?._id || record.venue || undefined,
              city: record.city || undefined,
              district: record.district || undefined
            });
            if (record.city) loadDistrictsForEdit(record.city);
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
            setDistricts([]);
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
              headers={{ Authorization: `Bearer ${token}` }}
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
            <Select
              placeholder="Chọn loại thể thao"
              options={categories.map(cat => ({ value: cat._id, label: cat.name }))}
            />
          </Form.Item>

          <Form.Item name="venue" label="Thuộc khu thể thao">
            <Select
              placeholder="Chọn khu (không bắt buộc)"
              allowClear
              options={venues.map(v => ({ value: v._id, label: `${v.name} — ${v.address}` }))}
            />
          </Form.Item>
          <Form.Item name="city" label="Tỉnh / Thành phố" rules={[{ required: true, message: 'Vui lòng chọn tỉnh thành!' }]}>
            <Select
              showSearch
              placeholder="Chọn tỉnh / thành phố"
              loading={loadingProvinces}
              onChange={handleProvinceChange}
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              options={provinces.map(p => ({ value: p.name, label: p.name }))}
            />
          </Form.Item>
          <Form.Item name="district" label="Quận / Huyện" rules={[{ required: true, message: 'Vui lòng chọn quận huyện!' }]}>
            <Select
              showSearch
              placeholder={districts.length === 0 ? 'Chọn tỉnh thành trước' : 'Chọn quận / huyện'}
              loading={loadingDistricts}
              disabled={districts.length === 0}
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              options={districts.map(d => ({ value: d.name, label: d.name }))}
            />
          </Form.Item>
          <Form.Item name="location" label="Địa chỉ chi tiết" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}>
            <Input placeholder="VD: 123 Nguyễn Văn Linh" />
          </Form.Item>
          <Form.Item name="pricePerHour" label="Giá mỗi giờ (VNĐ)" rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}><InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ManageFields;