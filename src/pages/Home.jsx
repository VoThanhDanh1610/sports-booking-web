import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { Card, Row, Col, Typography, Tag, Spin, Input, Select, Empty, Tabs } from 'antd';
import { EnvironmentOutlined, DollarCircleOutlined, SearchOutlined, FilterOutlined, AppstoreOutlined, ShopOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function Home() {
  const navigate = useNavigate();

  // --- Sân lẻ ---
  const [fields, setFields]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [city, setCity]       = useState(null);
  const [district, setDistrict] = useState(null);
  const [category, setCategory] = useState(null);

  // --- Khu thể thao ---
  const [venues, setVenues]           = useState([]);
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [activeTab, setActiveTab]     = useState('fields');

  useEffect(() => {
    fetchFields();
  }, []);

  // Lazy-load venues khi người dùng chuyển tab lần đầu
  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === 'venues' && venues.length === 0) fetchVenues();
  };

  const fetchFields = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/fields');
      setFields(res.data.data);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVenues = async () => {
    setVenuesLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/venues');
      setVenues(res.data.data);
    } catch (error) {
      console.error('Lỗi khi lấy khu thể thao:', error);
    } finally {
      setVenuesLoading(false);
    }
  };

  // --- Derived data cho tab Sân ---
  const cities = useMemo(() =>
    [...new Set(fields.map(f => f.city).filter(Boolean))].sort(), [fields]);

  const districts = useMemo(() =>
    [...new Set(
      fields
        .filter(f => !city || f.city === city)
        .map(f => f.district)
        .filter(Boolean)
    )].sort(),
    [fields, city]
  );

  const categories = useMemo(() =>
    [...new Map(
      fields
        .filter(f => f.category?._id)
        .map(f => [String(f.category._id), f.category.name])
    ).entries()],
    [fields]
  );

  const filtered = useMemo(() => fields.filter(f => {
    if (city     && f.city     !== city)          return false;
    if (district && f.district !== district)      return false;
    if (category && f.category?._id !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!f.name.toLowerCase().includes(q) && !f.location.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [fields, city, district, category, search]);

  const handleCityChange = (val) => {
    setCity(val);
    setDistrict(null);
  };

  const tabItems = [
    {
      key: 'fields',
      label: <span><AppstoreOutlined /> Tất cả sân ({fields.length})</span>,
      children: (
        <>
          {/* Filter bar */}
          <div style={{
            backgroundColor: '#fff',
            padding: '18px 50px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            display: 'flex',
            gap: 16,
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <FilterOutlined style={{ color: '#008080', fontSize: 18 }} />
            <Select
              placeholder="Thành phố"
              style={{ width: 180 }}
              value={city}
              onChange={handleCityChange}
              allowClear
              options={cities.map(c => ({ value: c, label: c }))}
            />
            <Select
              placeholder="Quận / Huyện"
              style={{ width: 180 }}
              value={district}
              onChange={setDistrict}
              allowClear
              disabled={districts.length === 0}
              options={districts.map(d => ({ value: d, label: d }))}
            />
            <Select
              placeholder="Loại sân"
              style={{ width: 160 }}
              value={category}
              onChange={setCategory}
              allowClear
              options={categories.map(([id, name]) => ({ value: id, label: name }))}
            />
            <span style={{ color: '#888', fontSize: 14, marginLeft: 'auto' }}>
              {filtered.length} sân
            </span>
          </div>

          {/* Field list */}
          <div style={{ padding: '36px 50px 60px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', paddingTop: 60 }}><Spin size="large" /></div>
            ) : filtered.length === 0 ? (
              <Empty description="Không tìm thấy sân phù hợp" style={{ padding: '60px 0' }} />
            ) : (
              <Row gutter={[28, 28]}>
                {filtered.map(field => (
                  <Col xs={24} sm={12} md={8} lg={6} key={field._id}>
                    <Card
                      hoverable
                      onClick={() => navigate(`/field/${field._id}`)}
                      style={{ borderRadius: 16, overflow: 'hidden', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', height: '100%', cursor: 'pointer' }}
                      styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%' } }}
                      cover={
                        <div style={{ overflow: 'hidden', height: 200 }}>
                          <img
                            alt={field.name}
                            src={field.images?.[0] ? `http://localhost:5000${field.images[0]}` : 'https://via.placeholder.com/300x200'}
                            className="card-image-hover"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                            onError={e => { e.target.src = 'https://via.placeholder.com/300x200'; }}
                          />
                        </div>
                      }
                    >
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>{field.name}</Text>
                        {(field.city || field.district) && (
                          <div style={{ marginBottom: 6 }}>
                            {field.city && (
                              <Tag
                                color="cyan"
                                style={{ borderRadius: 10, fontSize: 12, cursor: 'pointer' }}
                                onClick={(e) => { e.stopPropagation(); setCity(field.city); setDistrict(null); }}
                              >
                                {field.city}
                              </Tag>
                            )}
                            {field.district && (
                              <Tag
                                color="geekblue"
                                style={{ borderRadius: 10, fontSize: 12, cursor: 'pointer' }}
                                onClick={(e) => { e.stopPropagation(); setCity(field.city); setDistrict(field.district); }}
                              >
                                {field.district}
                              </Tag>
                            )}
                          </div>
                        )}
                        <p style={{ color: '#777', fontSize: 13, margin: '0 0 8px' }}>
                          <EnvironmentOutlined /> {field.location}
                        </p>
                        <Tag color="#008080" style={{ borderRadius: 12, padding: '3px 10px', border: 'none', width: 'fit-content' }}>
                          <DollarCircleOutlined /> {field.pricePerHour?.toLocaleString()}đ/giờ
                        </Tag>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </>
      )
    },
    {
      key: 'venues',
      label: <span><ShopOutlined /> Khu thể thao</span>,
      children: (
        <div style={{ padding: '36px 50px 60px' }}>
          {venuesLoading ? (
            <div style={{ textAlign: 'center', paddingTop: 60 }}><Spin size="large" /></div>
          ) : venues.length === 0 ? (
            <Empty description="Chưa có khu thể thao nào" style={{ padding: '60px 0' }} />
          ) : (
            <Row gutter={[28, 28]}>
              {venues.map(venue => (
                <Col xs={24} sm={12} md={8} lg={6} key={venue._id}>
                  <Card
                    hoverable
                    onClick={() => navigate(`/venue/${venue._id}`)}
                    style={{ borderRadius: 16, overflow: 'hidden', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', height: '100%', cursor: 'pointer' }}
                    styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%' } }}
                    cover={
                      <div style={{ overflow: 'hidden', height: 200, position: 'relative' }}>
                        <img
                          alt={venue.name}
                          src={venue.images?.[0] ? `http://localhost:5000${venue.images[0]}` : 'https://via.placeholder.com/300x200'}
                          className="card-image-hover"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                          onError={e => { e.target.src = 'https://via.placeholder.com/300x200'; }}
                        />
                        <div style={{
                          position: 'absolute', bottom: 10, right: 10,
                          background: 'rgba(0,128,128,0.85)',
                          color: '#fff', fontSize: 12, fontWeight: 600,
                          padding: '3px 10px', borderRadius: 20
                        }}>
                          {venue.fieldsCount} sân
                        </div>
                      </div>
                    }
                  >
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 6 }}>{venue.name}</Text>
                      <p style={{ color: '#777', fontSize: 13, margin: 0, flex: 1 }}>
                        <EnvironmentOutlined /> {venue.address}
                      </p>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ backgroundColor: '#fcfcfd', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #008080 0%, #00c2c2 100%)',
        padding: '80px 40px 60px',
        color: 'white',
        textAlign: 'center',
      }}>
        <Title level={1} style={{ color: 'white', fontSize: '44px', fontWeight: 700, marginBottom: 12 }}>
          Đừng Chỉ Chơi, Hãy Trải Nghiệm
        </Title>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '17px', maxWidth: 560, margin: '0 auto 36px' }}>
          Hệ thống đặt sân thể thao số 1 Việt Nam. Sân đẹp, giá tốt, đặt ngay trong 30 giây.
        </p>
        <Input
          size="large"
          placeholder="Tìm tên sân hoặc địa chỉ..."
          prefix={<SearchOutlined style={{ color: '#999' }} />}
          style={{ maxWidth: 500, height: 52, borderRadius: 26, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
          value={search}
          onChange={e => { setSearch(e.target.value); setActiveTab('fields'); }}
          allowClear
        />
      </div>

      {/* Tabs */}
      <div style={{ backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          size="large"
          style={{ padding: '0 50px' }}
          tabBarStyle={{ marginBottom: 0, fontWeight: 600 }}
        />
      </div>

      <style>{`.card-image-hover:hover { transform: scale(1.05); }`}</style>
    </div>
  );
}

export default Home;
