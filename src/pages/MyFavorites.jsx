import { useState, useEffect } from 'react';
import { Row, Col, Typography, Card, Spin, Empty, Button } from 'antd';
import { HeartFilled, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;

function MyFavorites() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavs = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:5000/api/favorites/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setList(res.data);
      } catch { } finally { setLoading(false); }
    };
    fetchFavs();
  }, []);

  return (
    <div style={{ padding: '40px 50px', background: '#fcfcfd', minHeight: '100vh' }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} style={{ marginBottom: 20 }}>Quay lại</Button>
      <Title level={3} style={{ color: '#008080' }}><HeartFilled style={{ color: '#ff4d4f' }} /> Sân đã thích</Title>
      
      {loading ? <Spin size="large" /> : list.length === 0 ? <Empty description="Chưa có sân yêu thích nào" /> : (
        <Row gutter={[24, 24]}>
          {list.map(item => (
            <Col xs={24} sm={12} md={8} lg={6} key={item._id}>
              <Card 
                hoverable 
                cover={<img src={`http://localhost:5000${item.field.images[0]}`} style={{ height: 180, objectFit: 'cover' }} />}
                onClick={() => navigate(`/field/${item.field._id}`)}
              >
                <Card.Meta title={item.field.name} description={item.field.location} />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}

export default MyFavorites;