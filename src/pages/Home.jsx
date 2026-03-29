import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Typography, Tag, Spin, Input } from 'antd';
import { EnvironmentOutlined, DollarCircleOutlined, SearchOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

function Home() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  // PHẢI CÓ ĐOẠN RUỘT NÀY THÌ NÓ MỚI CHẠY NÈ DANH:
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/fields');
        setFields(response.data.data);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
      } finally {
        setLoading(false); // Lấy xong (hoặc lỗi) thì dừng quay
      }
    };
    fetchFields();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', paddingTop: 100 }}><Spin size="large" /></div>;

  return (
    <div style={{ backgroundColor: '#fcfcfd', minHeight: '100vh' }}>
      
      {/* 🌟 HERO SECTION - ĐẲNG CẤP LÀ Ở ĐÂY */}
      <div style={{
        background: 'linear-gradient(135deg, #008080 0%, #00c2c2 100%)',
        padding: '100px 40px',
        color: 'white',
        textAlign: 'center',
        marginBottom: 50
      }}>
        <Title level={1} style={{ color: 'white', fontSize: '48px', fontWeight: 700, marginBottom: 15 }}>
          Đừng Chỉ Chơi, Hãy Trải Nghiệm
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: '18px', maxWidth: '600px', margin: '0 auto 40px', fontWeight: 300 }}>
          Hệ thống đặt sân thể thao số 1 Việt Nam. Sân đẹp, giá tốt, đặt ngay trong 30 giây.
        </Paragraph>
        <Input 
          size="large" 
          placeholder="Tìm sân ngay (VD: Sân Bình Thạnh...)" 
          prefix={<SearchOutlined style={{color: '#999'}} />} 
          style={{ maxWidth: 500, height: 55, borderRadius: 27.5, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
        />
      </div>

      <div style={{ padding: '0 50px 50px' }}>
        <Title level={3} style={{ marginBottom: 35, fontWeight: 600 }}>Sân Mới Nhất Trên Hệ Thống</Title>

        <Row gutter={[30, 30]}>
          {fields.map((field) => (
            <Col xs={24} sm={12} md={8} lg={6} key={field._id}>
              <Card
                hoverable
                style={{ borderRadius: 16, overflow: 'hidden', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                cover={
                  <div style={{ overflow: 'hidden' }}>
                    <img 
                      alt={field.name} 
                      src={`http://localhost:5000${field.images[0]}`} 
                      className="card-image-hover"
                      style={{ height: 220, objectFit: 'cover', transition: 'transform 0.3s' }}
                    />
                  </div>
                }
              >
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Card.Meta 
                    title={<Text strong style={{fontSize: '17px'}}>{field.name}</Text>} 
                    description={
                      <div style={{ marginTop: 12, marginBottom: 20 }}>
                        <p style={{ color: '#666' }}><EnvironmentOutlined /> {field.location}</p>
                        <Tag color="#008080" style={{borderRadius: 15, padding: '2px 10px', fontWeight: 500, fontSize: '14px', border: 'none'}}>
                          <DollarCircleOutlined /> {field.pricePerHour.toLocaleString()}đ/giờ
                        </Tag>
                      </div>
                    }
                  />
                  <Link 
                    to={`/field/${field._id}`} 
                    style={{ 
                      marginTop: 'auto', display: 'block', textAlign: 'center', padding: '12px',
                      backgroundColor: '#f0fcfc', color: '#008080', fontWeight: 'bold', borderRadius: 8,
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#e0f7f7'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#f0fcfc'}
                  >
                    XEM CHI TIẾT
                  </Link>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
      
      <style>{`
        .card-image-hover:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}

export default Home;