import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Import thêm Skeleton để làm hiệu ứng tải trang xịn
import { Card, Row, Col, Typography, Tag, Spin, Input, Select, Empty, Tabs, Skeleton } from 'antd';
import { EnvironmentOutlined, DollarCircleOutlined, SearchOutlined, FilterOutlined, AppstoreOutlined, ShopOutlined, SortAscendingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function Home() {
  const navigate = useNavigate();

  // --- Sân lẻ ---
  const [fields, setFields]   = useState([]);
  const [loading, setLoading] = useState(true);
  
  // VŨ KHÍ 1: STATE CHO DEBOUNCE SEARCH
  const [searchInput, setSearchInput] = useState(''); // Text gõ tức thời
  const [search, setSearch]   = useState('');         // Text dùng để lọc (sau delay)
  
  const [city, setCity]       = useState(null);
  const [district, setDistrict] = useState(null);
  const [category, setCategory] = useState(null);
  
  // VŨ KHÍ 2: STATE CHO SẮP XẾP GIÁ
  const [sortOrder, setSortOrder] = useState(null);

  // --- Khu thể thao ---
  const [venues, setVenues]           = useState([]);
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [activeTab, setActiveTab]     = useState('fields');

  useEffect(() => {
    fetchFields();
  }, []);

  // LOGIC DEBOUNCE: Đợi 500ms sau khi ngừng gõ mới cập nhật search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

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

  // LOGIC LỌC & SẮP XẾP
  const filtered = useMemo(() => {
    let result = fields.filter(f => {
      if (city     && f.city     !== city)          return false;
      if (district && f.district !== district)      return false;
      if (category && f.category?._id !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!f.name.toLowerCase().includes(q) && !f.location.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    // Sắp xếp theo giá
    if (sortOrder === 'asc') {
      result.sort((a, b) => (a.pricePerHour || 0) - (b.pricePerHour || 0));
    } else if (sortOrder === 'desc') {
      result.sort((a, b) => (b.pricePerHour || 0) - (a.pricePerHour || 0));
    }

    return result;
  }, [fields, city, district, category, search, sortOrder]);

  const handleCityChange = (val) => {
    setCity(val);
    setDistrict(null);
  };

  // VŨ KHÍ 3: GIAO DIỆN SKELETON LOADING
  const renderSkeleton = () => (
    <Row gutter={[32, 32]}>
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <Col xs={24} sm={12} md={8} lg={6} key={i}>
          <Card className="sporty-card" cover={<div style={{ height: 220, background: '#f0f2f5' }} />}>
            <Skeleton active paragraph={{ rows: 2 }} />
          </Card>
        </Col>
      ))}
    </Row>
  );

  const tabItems = [
    {
      key: 'fields',
      label: <span className="tab-title"><AppstoreOutlined /> Tất cả sân ({fields.length})</span>,
      children: (
        <>
          {/* Thanh Filter Glassmorphism */}
          <div className="floating-filter-wrapper">
            <div className="floating-filter">
              <FilterOutlined style={{ color: '#00e676', fontSize: 20, fontWeight: 'bold' }} />
              <Select placeholder="Thành phố" style={{ width: 140 }} value={city} onChange={handleCityChange} allowClear options={cities.map(c => ({ value: c, label: c }))} bordered={false} className="sporty-select" />
              <div className="filter-divider"></div>
              <Select placeholder="Quận / Huyện" style={{ width: 140 }} value={district} onChange={setDistrict} allowClear disabled={districts.length === 0} options={districts.map(d => ({ value: d, label: d }))} bordered={false} className="sporty-select" />
              <div className="filter-divider"></div>
              <Select placeholder="Loại sân" style={{ width: 130 }} value={category} onChange={setCategory} allowClear options={categories.map(([id, name]) => ({ value: id, label: name }))} bordered={false} className="sporty-select" />
              <div className="filter-divider"></div>
              
              {/* VŨ KHÍ 2: NÚT SẮP XẾP */}
              <Select 
                placeholder={<span><SortAscendingOutlined /> Sắp xếp giá</span>} 
                style={{ width: 160 }} 
                value={sortOrder} 
                onChange={setSortOrder} 
                allowClear 
                options={[
                  { value: 'asc', label: '💰 Giá thấp đến cao' },
                  { value: 'desc', label: '💎 Giá cao đến thấp' }
                ]} 
                bordered={false} 
                className="sporty-select" 
              />

              <span className="filter-result-count">
                <span className="highlight-count">{filtered.length}</span> sân
              </span>
            </div>
          </div>

          <div style={{ padding: '40px 50px 80px' }}>
            {loading ? (
              renderSkeleton()
            ) : filtered.length === 0 ? (
              <Empty description="Không tìm thấy sân phù hợp" style={{ padding: '60px 0' }} />
            ) : (
              <Row gutter={[32, 32]}>
                {filtered.map((field, index) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={field._id}>
                    <Card
                      hoverable
                      onClick={() => navigate(`/field/${field._id}`)}
                      // VŨ KHÍ 4: FADE-IN-UP CLASS
                      className="sporty-card fade-in-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                      styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%', padding: '20px' } }}
                      cover={
                        <div className="card-image-wrapper">
                          <img
                            alt={field.name}
                            src={field.images?.[0] ? `http://localhost:5000${field.images[0]}` : 'https://via.placeholder.com/300x200'}
                            className="card-image-hover"
                            onError={e => { e.target.src = 'https://via.placeholder.com/300x200'; }}
                          />
                          {/* Hover Action Overlay */}
                          <div className="card-hover-action">
                            <span className="action-btn">Vào Sân Ngay ⚡</span>
                          </div>
                          <div className="card-price-badge">
                            <DollarCircleOutlined style={{ marginRight: 4 }}/> {field.pricePerHour?.toLocaleString()}đ/h
                          </div>
                        </div>
                      }
                    >
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Text strong className="card-title">{field.name}</Text>
                        {(field.city || field.district) && (
                          <div style={{ marginBottom: 12, display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {field.city && (
                              <Tag className="sporty-tag city-tag" onClick={(e) => { e.stopPropagation(); setCity(field.city); setDistrict(null); }}>
                                {field.city}
                              </Tag>
                            )}
                            {field.district && (
                              <Tag className="sporty-tag district-tag" onClick={(e) => { e.stopPropagation(); setCity(field.city); setDistrict(field.district); }}>
                                {field.district}
                              </Tag>
                            )}
                          </div>
                        )}
                        <p className="card-location">
                          <EnvironmentOutlined style={{ color: '#00c2c2' }} /> {field.location}
                        </p>
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
      label: <span className="tab-title"><ShopOutlined /> Khu thể thao</span>,
      children: (
        <div style={{ padding: '60px 50px 80px' }}>
          {venuesLoading ? (
            renderSkeleton()
          ) : venues.length === 0 ? (
            <Empty description="Chưa có khu thể thao nào" style={{ padding: '60px 0' }} />
          ) : (
            <Row gutter={[32, 32]}>
              {venues.map((venue, index) => (
                <Col xs={24} sm={12} md={8} lg={6} key={venue._id}>
                  <Card
                    hoverable
                    onClick={() => navigate(`/venue/${venue._id}`)}
                    // VŨ KHÍ 4: FADE-IN-UP CLASS
                    className="sporty-card fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                    styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%', padding: '20px' } }}
                    cover={
                      <div className="card-image-wrapper">
                        <img
                          alt={venue.name}
                          src={venue.images?.[0] ? `http://localhost:5000${venue.images[0]}` : 'https://via.placeholder.com/300x200'}
                          className="card-image-hover"
                          onError={e => { e.target.src = 'https://via.placeholder.com/300x200'; }}
                        />
                        {/* Hover Action Overlay */}
                        <div className="card-hover-action">
                          <span className="action-btn">Khám Phá Khu ⚡</span>
                        </div>
                        <div className="card-venue-badge">
                          {venue.fieldsCount} sân
                        </div>
                      </div>
                    }
                  >
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Text strong className="card-title">{venue.name}</Text>
                      <p className="card-location" style={{ flex: 1 }}>
                        <EnvironmentOutlined style={{ color: '#00c2c2' }} /> {venue.address}
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
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      
      {/* Banner Động Thể Thao */}
      <div className="animated-hero-container">
        <div className="hero-overlay"></div>
        
        {/* Hạt năng lượng */}
        <div className="particles">
          <span style={{"--i": 15}}></span><span style={{"--i": 22}}></span>
          <span style={{"--i": 18}}></span><span style={{"--i": 28}}></span>
          <span style={{"--i": 14}}></span><span style={{"--i": 25}}></span>
          <span style={{"--i": 19}}></span><span style={{"--i": 11}}></span>
        </div>

        {/* Nội dung Banner */}
        <div className="hero-content">
          <div className="hero-badge">HỆ THỐNG SỐ 1 VIỆT NAM</div>
          <Title level={1} className="hero-title">ĐỪNG CHỈ CHƠI<br/><span className="text-gradient">HÃY TRẢI NGHIỆM</span></Title>
          <p className="hero-subtitle">Sân đẹp, giá tốt, tìm đối nhanh chóng. Đặt sân ngay trong 30 giây!</p>
          <Input
            size="large"
            placeholder="Nhập tên sân, khu vực bạn muốn thi đấu..."
            prefix={<SearchOutlined style={{ color: '#00c2c2', fontSize: '20px' }} />}
            className="hero-search"
            // VŨ KHÍ 1: DÙNG searchInput THAY VÌ search
            value={searchInput}
            onChange={e => { setSearchInput(e.target.value); setActiveTab('fields'); }}
            allowClear
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="sporty-tabs-container">
        <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabItems} size="large" centered tabBarStyle={{ marginBottom: 0, borderBottom: 'none' }} />
      </div>

      {/* CSS SIÊU CẤP VIP PRO */}
      <style>{`
        /* Bố cục nền chung */
        .sporty-tabs-container {
          background-color: #f4f7f6;
          padding-top: 20px;
          position: relative;
          z-index: 5;
        }

        /* BANNER ĐỘNG - SPORTY THEME */
        .animated-hero-container {
          position: relative;
          width: 100%;
          min-height: 48vh;
          background: linear-gradient(-45deg, #0f2027, #203a43, #2c5364, #004d40);
          background-size: 400% 400%;
          animation: gradientBG 15s ease infinite;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          /* THÊM DÒNG NÀY ĐỂ ÉP KHUNG KHÔNG BỊ TRÀN VIỀN NÈ ÔNG: */
          box-sizing: border-box; 
        }

        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .hero-overlay {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.6) 100%);
          z-index: 1;
        }

        .particles { position: absolute; width: 100%; height: 100%; display: flex; justify-content: space-between; z-index: 2; }
        .particles span {
          width: 6px; height: 30px; background: #00ff88; box-shadow: 0 0 10px #00ff88, 0 0 20px #00ff88;
          border-radius: 10px; animation: animateEnergy calc(40s / var(--i)) linear infinite;
          bottom: -50px; position: relative; opacity: 0.6;
        }
        @keyframes animateEnergy { 0% { transform: translateY(100px) scale(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(-800px) scale(1.5); opacity: 0; } }

        .hero-content { position: relative; z-index: 3; text-align: center; width: 100%; max-width: 700px; }
        .hero-badge { display: inline-block; background: rgba(0, 255, 136, 0.15); color: #00ff88; padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 12px; letter-spacing: 2px; margin-bottom: 20px; border: 1px solid rgba(0, 255, 136, 0.3); backdrop-filter: blur(4px); }
        .hero-title { color: white !important; font-size: 52px !important; font-weight: 900 !important; margin-bottom: 20px !important; line-height: 1.1 !important; font-family: 'Montserrat', 'Segoe UI', sans-serif !important; text-transform: uppercase; }
        .text-gradient { background: linear-gradient(to right, #00ff88, #00c2c2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-subtitle { color: rgba(255, 255, 255, 0.85); font-size: 18px; margin-bottom: 40px; font-weight: 500; }
        .hero-search { max-width: 550px; height: 60px; border-radius: 30px; box-shadow: 0 15px 35px rgba(0,0,0,0.3); border: 2px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.95) !important; font-size: 16px; }
        .hero-search:focus-within { border-color: #00ff88; box-shadow: 0 15px 35px rgba(0, 255, 136, 0.2); }

        /* --- TABS HÌNH VIÊN THUỐC (ĐÃ CĂN BẰNG NHAU 100%) --- */
        .ant-tabs-nav::before { display: none !important; }
        .ant-tabs-ink-bar { display: none !important; }
        
        .ant-tabs-tab { 
          background: #e4e9ed !important; 
          border-radius: 30px !important; 
          margin: 0 10px !important; 
          padding: 0 32px !important; 
          border: none !important; 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important; 
          /* ÉP CỨNG CHIỀU CAO & CĂN GIỮA ĐỂ KHÔNG BỊ TO NHỎ LỆCH NHAU */
          height: 48px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .ant-tabs-tab:hover { background: #d3dce3 !important; }
        
        .ant-tabs-tab-active { 
          background: linear-gradient(135deg, #00c2c2 0%, #008080 100%) !important; 
          box-shadow: 0 8px 20px rgba(0, 128, 128, 0.3) !important; 
          /* Đã gỡ bỏ hiệu ứng nẩy (transform) để không bị lệch hàng */
        }
        
        .ant-tabs-tab-active .tab-title { color: white !important; }
        .ant-tabs-tab .tab-title { color: #555; transition: color 0.3s; margin: 0; padding: 0; }
        .tab-title { font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

        /* THANH FILTER TRÔI NỔI (GLASSMORPHISM) */
        .floating-filter-wrapper { display: flex; justify-content: center; margin-top: 30px; margin-bottom: -10px; position: relative; z-index: 10; }
        .floating-filter { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 50px; padding: 10px 30px; display: flex; gap: 15px; align-items: center; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid rgba(0,0,0,0.05); flex-wrap: wrap; }
        .filter-divider { width: 1px; height: 24px; background: #eaeaea; }
        .sporty-select .ant-select-selector { font-weight: 600 !important; color: #333 !important; }
        .filter-result-count { margin-left: auto; font-weight: 600; color: #666; padding-left: 20px; }
        .highlight-count { color: #00c2c2; font-size: 18px; font-weight: 800; }

        /* VŨ KHÍ 4: HIỆU ỨNG FADE-IN-UP (SCROLL REVEAL) */
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up {
          opacity: 0;
          animation: fadeInUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        /* CARD SÂN BÓNG - HIỆU ỨNG 3D & HOVER ACTION */
        .sporty-card { border-radius: 20px !important; overflow: hidden; border: none !important; box-shadow: 0 8px 24px rgba(0,0,0,0.04) !important; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important; height: 100%; background: #fff; }
        .sporty-card:hover { transform: translateY(-10px) !important; box-shadow: 0 20px 40px rgba(0, 194, 194, 0.15) !important; }
        .card-image-wrapper { position: relative; height: 220px; overflow: hidden; }
        .card-image-hover { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
        .sporty-card:hover .card-image-hover { transform: scale(1.08); }

        /* Lớp phủ Kính mờ (Blur Overlay) khi Hover */
        .card-hover-action { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(11, 19, 30, 0.4); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; opacity: 0; transition: all 0.4s ease; z-index: 2; }
        .sporty-card:hover .card-hover-action { opacity: 1; }
        
        /* Nút Vào Sân Ngay trượt lên */
        .action-btn { background: linear-gradient(135deg, #00c2c2 0%, #008080 100%); color: white; padding: 12px 28px; border-radius: 30px; font-weight: 800; font-size: 15px; text-transform: uppercase; letter-spacing: 1px; transform: translateY(20px); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-shadow: 0 10px 20px rgba(0, 128, 128, 0.4); }
        .sporty-card:hover .action-btn { transform: translateY(0); }

        .card-price-badge { position: absolute; bottom: 12px; right: 12px; background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%); color: white; padding: 6px 14px; border-radius: 12px; font-weight: 800; font-size: 14px; box-shadow: 0 4px 10px rgba(79, 172, 254, 0.4); z-index: 3; }
        .card-venue-badge { position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); color: #00ff88; padding: 6px 14px; border-radius: 12px; font-weight: 800; font-size: 13px; border: 1px solid rgba(0, 255, 136, 0.3); z-index: 3; }
        .card-title { font-size: 18px !important; color: #1a1a1a; margin-bottom: 10px !important; display: block; }
        .sporty-tag { border-radius: 6px !important; padding: 2px 10px !important; font-weight: 600 !important; border: none !important; }
        .city-tag { background: #e6f7ff !important; color: #1890ff !important; }
        .district-tag { background: #f6ffed !important; color: #52c41a !important; }
        .card-location { color: #777; font-size: 14px; margin: 0; display: flex; align-items: flex-start; gap: 6px; }
      `}</style>
    </div>
  );
}

export default Home;