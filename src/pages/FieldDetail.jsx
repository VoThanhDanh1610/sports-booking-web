import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Row, Col, Typography, Tag, Button, Rate, Input, Card, Divider, Descriptions, Spin, Empty } from 'antd';
import { EnvironmentOutlined, DollarCircleOutlined, SendOutlined, ArrowLeftOutlined, CalendarOutlined } from '@ant-design/icons';
import { jwtDecode } from 'jwt-decode';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

function FieldDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [field, setField] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
  const fetchDetail = async () => {
    try {
      // Gọi API lấy chi tiết sân
      const response = await axios.get(`http://localhost:5000/api/fields/${id}`);
      
      // Backend trả về { message: "...", data: field } 
      // Nên ta lấy response.data.data là chính xác
      if (response.data && response.data.data) {
        setField(response.data.data);
      }
    } catch (error) {
      // Nếu nhảy vào đây nghĩa là API trả về lỗi (404, 500...)
      console.error("Lỗi API chi tiết:", error.response);
      toast.error('Không tìm thấy thông tin sân!');
    }
  };
  fetchDetail();
}, [id]);

  const handleSubmitReview = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.warning('Bạn cần đăng nhập để đánh giá nhé!');
      return;
    }
    if (!comment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá!');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        'http://localhost:5000/api/reviews',
        { field: id, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Cảm ơn bạn đã đóng góp ý kiến! ❤️');
      setComment('');
      setRating(5);
    } catch (error) {
      toast.error('Gửi đánh giá thất bại!');
    } finally {
      setSubmitting(false);
    }
  };

  if (!field) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" tip="Đang tải dữ liệu..." /></div>;

  return (
    <div style={{ padding: '40px 50px', backgroundColor: '#fcfcfd', minHeight: '100vh' }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} style={{ marginBottom: 20, borderRadius: 8 }}>Quay lại</Button>
      
      <Row gutter={[40, 40]}>
        {/* Bên trái: Ảnh sân */}
        <Col xs={24} lg={14}>
          <img 
            src={`http://localhost:5000${field.images[0]}`} 
            alt={field.name} 
            style={{ width: '100%', borderRadius: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', objectFit: 'cover', height: 450 }} 
          />
        </Col>

        {/* Bên phải: Thông tin chi tiết */}
        <Col xs={24} lg={10}>
          <Card bordered={false} style={{ borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Title level={2} style={{ color: '#008080', marginBottom: 10 }}>{field.name}</Title>
            <Tag color="cyan" style={{ fontSize: 14, padding: '2px 12px', borderRadius: 10, marginBottom: 20 }}>Cầu lông</Tag>
            
            <Descriptions column={1} style={{ marginTop: 20 }}>
              <Descriptions.Item label={<Text strong><EnvironmentOutlined /> Địa chỉ</Text>}>{field.location}</Descriptions.Item>
              <Descriptions.Item label={<Text strong><DollarCircleOutlined /> Giá thuê</Text>}>
                <Text type="danger" strong style={{ fontSize: 20 }}>{field.pricePerHour.toLocaleString()}đ</Text> / giờ
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Nút Đặt sân - chỉ hiện với Customer */}
            {(() => {
              const token = localStorage.getItem('token');
              let role = null;
              if (token) { try { role = jwtDecode(token).role; } catch {} }
              return role === 'Customer' ? (
                <Button
                  type="primary"
                  size="large"
                  icon={<CalendarOutlined />}
                  block
                  onClick={() => navigate(`/booking/${id}`)}
                  style={{ marginBottom: 16, height: 50, borderRadius: 12, fontWeight: 'bold' }}
                >
                  ĐẶT SÂN NGAY
                </Button>
              ) : null;
            })()}

            <Title level={4}>Mô tả</Title>
            <Paragraph style={{ color: '#666', lineHeight: 1.8 }}>
              {field.description || "Sân bóng tiêu chuẩn quốc tế, trang thiết bị hiện đại, thảm trải sàn chống trơn trượt, hệ thống chiếu sáng chuẩn thi đấu. Rất phù hợp cho các giải đấu phong trào và tập luyện nâng cao."}
            </Paragraph>
          </Card>
        </Col>
      </Row>

      <Divider style={{ margin: '50px 0' }} />

      {/* Phần Đánh giá */}
      <Row justify="center">
        <Col xs={24} md={16} lg={12}>
          <Card title={<Title level={4} style={{ margin: 0 }}>💬 Để lại cảm nhận của bạn</Title>} style={{ borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div style={{ marginBottom: 20, textAlign: 'center' }}>
              <Text style={{ display: 'block', marginBottom: 10 }}>Bạn chấm sân này mấy sao?</Text>
              <Rate value={rating} onChange={setRating} style={{ fontSize: 32 }} />
            </div>
            
            <TextArea 
              rows={4} 
              placeholder="Sân có tốt không? Phục vụ thế nào? Chia sẻ cho mọi người cùng biết nhé..." 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ borderRadius: 12, padding: 15 }}
            />
            
            <Button 
              type="primary" 
              icon={<SendOutlined />} 
              size="large" 
              block 
              loading={submitting}
              onClick={handleSubmitReview}
              style={{ marginTop: 20, height: 50, borderRadius: 12, fontWeight: 'bold' }}
            >
              GỬI ĐÁNH GIÁ NGAY
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default FieldDetail;