import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Row, Col, Typography, Tag, Button, Rate, Input, Card, Divider, Descriptions, Spin, Empty, Avatar, List, Image } from 'antd';
import { 
  EnvironmentOutlined, DollarCircleOutlined, SendOutlined, 
  ArrowLeftOutlined, CalendarOutlined, UserOutlined,
  HeartOutlined, HeartFilled 
} from '@ant-design/icons';
import { jwtDecode } from 'jwt-decode';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

function FieldDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [field, setField] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/fields/${id}`);
        if (response.data && response.data.data) setField(response.data.data);
      } catch (error) {
        toast.error('Không tìm thấy thông tin sân!');
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/reviews/field/${id}`);
        setReviews(res.data);
      } catch {}
    };

    const checkFavoriteStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/favorites/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const found = res.data.some(fav => (fav.field?._id || fav.field) === id);
        setIsFavorite(found);
      } catch {}
    };

    fetchDetail();
    fetchReviews();
    checkFavoriteStatus();
  }, [id]);

  const handleToggleFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) return toast.warning('Đăng nhập để lưu sân yêu thích nhé!');
    try {
      const res = await axios.post(
        'http://localhost:5000/api/favorites/toggle',
        { fieldId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsFavorite(res.data.isFavorite);
      toast.success(res.data.message);
    } catch {
      toast.error('Có lỗi xảy ra khi lưu yêu thích!');
    }
  };

  const handleSubmitReview = async () => {
    const token = localStorage.getItem('token');
    if (!token) return toast.warning('Bạn cần đăng nhập để đánh giá nhé!');
    if (!comment.trim()) return toast.error('Vui lòng nhập nội dung đánh giá!');

    setSubmitting(true);
    try {
      await axios.post(
        'http://localhost:5000/api/reviews',
        { field: id, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Cảm ơn bạn đã đóng góp ý kiến!');
      setComment('');
      setRating(5);
      const res = await axios.get(`http://localhost:5000/api/reviews/field/${id}`);
      setReviews(res.data);
    } catch (error) {
      toast.error('Gửi đánh giá thất bại!');
    } finally {
      setSubmitting(false);
    }
  };

  if (!field) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;

  return (
    <div style={{ padding: '40px 50px', backgroundColor: '#fcfcfd', minHeight: '100vh' }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} style={{ marginBottom: 20, borderRadius: 8 }}>Quay lại</Button>
      
      <Row gutter={[40, 40]}>
        <Col xs={24} lg={14}>
          <Image.PreviewGroup items={field.images.map(img => ({ src: `http://localhost:5000${img}` }))}>
            <Image
              src={`http://localhost:5000${field.images[activeImg] || field.images[0]}`}
              alt={field.name}
              style={{ width: '100%', borderRadius: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', objectFit: 'cover', height: 420 }}
            />
          </Image.PreviewGroup>
          {field.images.length > 1 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              {field.images.map((img, idx) => (
                <img
                  key={idx} src={`http://localhost:5000${img}`} alt=""
                  onClick={() => setActiveImg(idx)}
                  style={{
                    width: 80, height: 60, objectFit: 'cover', borderRadius: 10, cursor: 'pointer',
                    border: activeImg === idx ? '3px solid #008080' : '3px solid transparent',
                    opacity: activeImg === idx ? 1 : 0.7, transition: 'all 0.2s'
                  }}
                />
              ))}
            </div>
          )}
        </Col>

        <Col xs={24} lg={10}>
          <Card bordered={false} style={{ borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Title level={2} style={{ color: '#008080', marginBottom: 10 }}>{field.name}</Title>
              <Button 
                type="text"
                icon={isFavorite ? <HeartFilled style={{ color: '#ff4d4f', fontSize: '24px' }} /> : <HeartOutlined style={{ fontSize: '24px' }} />} 
                onClick={handleToggleFavorite}
              />
            </div>
            <Tag color="cyan" style={{ fontSize: 14, padding: '2px 12px', borderRadius: 10, marginBottom: 20 }}>Cầu lông</Tag>
            <Descriptions column={1} style={{ marginTop: 20 }}>
              <Descriptions.Item label={<Text strong><EnvironmentOutlined /> Địa chỉ</Text>}>{field.location}</Descriptions.Item>
              <Descriptions.Item label={<Text strong><DollarCircleOutlined /> Giá thuê</Text>}>
                <Text type="danger" strong style={{ fontSize: 20 }}>{field.pricePerHour.toLocaleString()}đ</Text> / giờ
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            {(() => {
              const token = localStorage.getItem('token');
              let role = null;
              if (token) { try { role = jwtDecode(token).role; } catch {} }
              return role === 'Customer' ? (
                <Button type="primary" size="large" icon={<CalendarOutlined />} block onClick={() => navigate(`/booking/${id}`)} style={{ height: 50, borderRadius: 12, fontWeight: 'bold' }}>
                  ĐẶT SÂN NGAY
                </Button>
              ) : null;
            })()}
            <Title level={4}>Mô tả</Title>
            <Paragraph style={{ color: '#666', lineHeight: 1.8 }}>{field.description || "Thông tin mô tả đang cập nhật."}</Paragraph>
          </Card>
        </Col>
      </Row>

      <Divider style={{ margin: '50px 0' }} />

      <Row justify="center" gutter={[32, 32]}>
        <Col xs={24} lg={12}>
          <Card title="Đánh giá từ khách hàng" style={{ borderRadius: 20 }}>
            {reviews.length === 0 ? <Empty /> : (
              <List
                dataSource={reviews}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={<span>{item.user?.fullName} - <Rate disabled defaultValue={item.rating} style={{ fontSize: 12 }} /></span>}
                      description={item.comment}
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Để lại cảm nhận của bạn" style={{ borderRadius: 20 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}><Rate value={rating} onChange={setRating} /></div>
            <TextArea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Nhập nhận xét..." />
            <Button type="primary" block loading={submitting} onClick={handleSubmitReview} style={{ marginTop: 20, height: 45, borderRadius: 10 }}>GỬI ĐÁNH GIÁ</Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default FieldDetail;