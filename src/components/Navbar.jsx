import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Button, Space, Badge } from 'antd';
import { HomeOutlined, LoginOutlined, LogoutOutlined, CoffeeOutlined, CalendarOutlined, ScheduleOutlined, WalletOutlined, TagOutlined, ShopOutlined } from '@ant-design/icons';
import socket from '../socket';
import { jwtDecode } from "jwt-decode";

const { Header } = Layout;

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [ownerBadge, setOwnerBadge] = useState(0);
  const [customerBadge, setCustomerBadge] = useState(0);

  let userRole = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userRole = decoded.role;
    } catch (error) {
      console.error("Token không hợp lệ:", error);
      localStorage.removeItem('token');
    }
  }

  useEffect(() => {
    const handleNewBooking = () => {
      if (userRole === 'Owner') setOwnerBadge(prev => prev + 1);
    };
    const handleCustomerNotif = () => {
      if (userRole === 'Customer') setCustomerBadge(prev => prev + 1);
    };
    socket.on('newBooking', handleNewBooking);
    socket.on('bookingConfirmed', handleCustomerNotif);
    socket.on('bookingCancelled', handleCustomerNotif);
    socket.on('bookingCompleted', handleCustomerNotif);
    return () => {
      socket.off('newBooking', handleNewBooking);
      socket.off('bookingConfirmed', handleCustomerNotif);
      socket.off('bookingCancelled', handleCustomerNotif);
      socket.off('bookingCompleted', handleCustomerNotif);
    };
  }, [userRole]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    socket.disconnect();
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
          <>
            <Badge count={customerBadge} size="small">
              <Button type="text" icon={<CalendarOutlined />} onClick={() => { setCustomerBadge(0); navigate('/my-bookings'); }} style={{ color: '#008080', fontWeight: 'bold' }}>
                Đặt sân của tôi
              </Button>
            </Badge>
            <Button type="text" icon={<WalletOutlined />} onClick={() => navigate('/my-payments')} style={{ color: '#008080', fontWeight: 'bold' }}>
              Lịch sử thanh toán
            </Button>
          </>
        )}

        {userRole === 'Owner' && (
          <>
            <Button type="text" icon={<ShopOutlined />} onClick={() => navigate('/manage-venues')} style={{ color: '#008080', fontWeight: 'bold' }}>
              Quản lý khu
            </Button>
            <Button type="text" icon={<CoffeeOutlined />} onClick={() => navigate('/manage-fields')} style={{ color: '#008080', fontWeight: 'bold' }}>
              Quản lý sân
            </Button>
            <Badge count={ownerBadge} size="small">
              <Button type="text" icon={<ScheduleOutlined />} onClick={() => { setOwnerBadge(0); navigate('/manage-bookings'); }} style={{ color: '#008080', fontWeight: 'bold' }}>
                Quản lý đặt sân
              </Button>
            </Badge>
          </>
        )}

        {userRole === 'Admin' && (
          <>
            <Button type="text" icon={<WalletOutlined />} onClick={() => navigate('/manage-payments')} style={{ color: '#008080', fontWeight: 'bold' }}>
              Quản lý thanh toán
            </Button>
            <Button type="text" icon={<TagOutlined />} onClick={() => navigate('/manage-promotions')} style={{ color: '#008080', fontWeight: 'bold' }}>
              Mã giảm giá
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