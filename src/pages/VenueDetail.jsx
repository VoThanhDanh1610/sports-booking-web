import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Row, Col, Typography, Tag, Button, Card, Spin, Empty, Divider } from 'antd';
import { ArrowLeftOutlined, EnvironmentOutlined, DollarCircleOutlined, CalendarOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const STATUS_COLOR = { Active: 'green', Maintenance: 'orange', Inactive: 'red' };
const STATUS_LABEL = { Active: 'Đang hoạt động', Maintenance: 'Bảo trì', Inactive: 'Đóng cửa' };

function VenueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const [venueRes, fieldsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/venues/${id}`),
          axios.get(`http://localhost:5000/api/venues/${id}/fields`)
        ]);
        setVenue(venueRes.data.data);
        setFields(fieldsRes.data.data);
      } catch {
        toast.error('Không tìm thấy khu thể thao!');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchVenue();
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;

  return (
    <div style={{ backgroundColor: '#fcfcfd', minHeight: '100vh' }}>
      {/* Banner */}
      <div style={{ position: 'relative', height: 340, overflow: 'hidden' }}>
        <img
          src={venue.images?.[0] ? `http://localhost:5000${venue.images[0]}` : 'https://via.placeholder.com/1200x340'}
          alt={venue.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.src = 'https://via.placeholder.com/1200x340'; }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: '30px 50px'
        }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/')}
            style={{ position: 'absolute', top: 20, left: 50, borderRadius: 8 }}
          >
            Quay lại
          </Button>
          <Title level={2} style={{ color: '#fff', margin: 0 }}>{venue.name}</Title>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15 }}>
            <EnvironmentOutlined /> {venue.address}
          </Text>
        </div>
      </div>

      <div style={{ padding: '40px 50px' }}>
        {venue.description && (
          <>
            <Paragraph style={{ color: '#555', fontSize: 15, maxWidth: 700 }}>{venue.description}</Paragraph>
            <Divider />
          </>
        )}

        <Title level={4} style={{ color: '#008080', marginBottom: 24 }}>
          <CalendarOutlined /> Chọn sân để đặt ({fields.length} sân)
        </Title>

        {fields.length === 0 ? (
          <Empty description="Chưa có sân nào trong khu này" />
        ) : (
          <Row gutter={[24, 24]}>
            {fields.map(field => (
              <Col xs={24} sm={12} md={8} lg={6} key={field._id}>
                <Card
                  hoverable={field.status === 'Active'}
                  style={{
                    borderRadius: 16,
                    overflow: 'hidden',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.07)',
                    opacity: field.status !== 'Active' ? 0.65 : 1
                  }}
                  cover={
                    <div style={{ overflow: 'hidden', height: 180 }}>
                      <img
                        alt={field.name}
                        src={field.images?.[0] ? `http://localhost:5000${field.images[0]}` : 'https://via.placeholder.com/300x180'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                        className="card-image-hover"
                        onError={e => { e.target.src = 'https://via.placeholder.com/300x180'; }}
                      />
                    </div>
                  }
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 6 }}>{field.name}</Text>
                    <div style={{ marginBottom: 8 }}>
                      {field.category && (
                        <Tag color="blue" style={{ borderRadius: 10, marginBottom: 4 }}>{field.category.name}</Tag>
                      )}
                      <Tag color={STATUS_COLOR[field.status]} style={{ borderRadius: 10 }}>
                        {STATUS_LABEL[field.status]}
                      </Tag>
                    </div>
                    <Tag color="#008080" style={{ borderRadius: 12, padding: '3px 10px', border: 'none', marginBottom: 12, width: 'fit-content' }}>
                      <DollarCircleOutlined /> {field.pricePerHour?.toLocaleString()}đ/giờ
                    </Tag>
                    {field.status === 'Active' ? (
                      <Link
                        to={`/field/${field._id}`}
                        style={{
                          textAlign: 'center', padding: '10px',
                          backgroundColor: '#f0fcfc', color: '#008080',
                          fontWeight: 'bold', borderRadius: 8, display: 'block'
                        }}
                      >
                        XEM & ĐẶT SÂN
                      </Link>
                    ) : (
                      <div style={{
                        textAlign: 'center', padding: '10px',
                        backgroundColor: '#f5f5f5', color: '#999',
                        borderRadius: 8, cursor: 'not-allowed'
                      }}>
                        Không khả dụng
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      <style>{`.card-image-hover:hover { transform: scale(1.05); }`}</style>
    </div>
  );
}

export default VenueDetail;
