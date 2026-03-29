import { Link, useNavigate } from 'react-router-dom';
import { Layout, Button, Space } from 'antd';
import { HomeOutlined, LoginOutlined, LogoutOutlined, CoffeeOutlined, CalendarOutlined, ScheduleOutlined } from '@ant-design/icons';
import { jwtDecode } from "jwt-decode"; // Thư viện để "đọc" nội dung bên trong Token

const { Header } = Layout;

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  // --- BƯỚC 1: GIẢI MÃ TOKEN ĐỂ LẤY ROLE ---
  let userRole = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userRole = decoded.role; // Lấy 'Owner', 'Customer' hoặc 'Admin' từ thẻ thông hành
    } catch (error) {
      console.error("Token không hợp lệ:", error);
      localStorage.removeItem('token'); // Nếu token lỗi thì xóa luôn cho sạch
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload();
  };

  return (
    <Header style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      background: '#fff', 
      boxShadow: '0 2px 8px #f0f1f2',
      padding: '0 50px' 
    }}>
      <Link to="/" style={{ fontSize: '20px', fontWeight: 'bold', color: '#008080', display: 'flex', alignItems: 'center' }}>
        🎾 <span style={{ marginLeft: '10px' }}>SPORTS BOOKING</span>
      </Link>
      
      <Space size="middle">
        <Button type="text" icon={<HomeOutlined />} onClick={() => navigate('/')}>
          Trang chủ
        </Button>

        {/* --- BƯỚC 2: PHÂN QUYỀN HIỂN THỊ --- */}
        {userRole === 'Customer' && (
          <Button
            type="text"
            icon={<CalendarOutlined />}
            onClick={() => navigate('/my-bookings')}
            style={{ color: '#008080', fontWeight: 'bold' }}
          >
            Đặt sân của tôi
          </Button>
        )}

        {userRole === 'Owner' && (
          <>
            <Button
              type="text"
              icon={<CoffeeOutlined />}
              onClick={() => navigate('/manage-fields')}
              style={{ color: '#008080', fontWeight: 'bold' }}
            >
              Quản lý sân
            </Button>
            <Button
              type="text"
              icon={<ScheduleOutlined />}
              onClick={() => navigate('/manage-bookings')}
              style={{ color: '#008080', fontWeight: 'bold' }}
            >
              Quản lý đặt sân
            </Button>
          </>
        )}

        {token ? (
          <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
            Đăng xuất
          </Button>
        ) : (
          <Space>
            <Button type="text" onClick={() => navigate('/register')}>Đăng ký</Button>
            <Button type="primary" icon={<LoginOutlined />} onClick={() => navigate('/login')}>
              Đăng nhập
            </Button>
          </Space>
        )}
      </Space>
    </Header>
  );
}

export default Navbar;