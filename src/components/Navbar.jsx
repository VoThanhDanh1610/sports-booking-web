import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Button, Badge, Dropdown } from 'antd';
import { 
  LoginOutlined, 
  LogoutOutlined, 
  CoffeeOutlined, 
  CalendarOutlined, 
  ScheduleOutlined, 
  WalletOutlined, 
  TagOutlined, 
  ShopOutlined, 
  AppstoreAddOutlined, 
  DashboardOutlined,
  HeartOutlined 
} from '@ant-design/icons';
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

  const customerItems = [
    {
      key: '1',
      icon: <CalendarOutlined />,
      label: <span>Đặt sân của tôi {customerBadge > 0 && <Badge count={customerBadge} style={{ marginLeft: 8 }} />}</span>,
      onClick: () => { setCustomerBadge(0); navigate('/my-bookings'); }
    },
    {
      key: '2',
      icon: <WalletOutlined />,
      label: 'Lịch sử thanh toán',
      onClick: () => navigate('/my-payments')
    }, // <--- PHẢI CÓ DẤU PHẨY Ở ĐÂY
    {
      key: '3',
      icon: <HeartOutlined />,
      label: 'Sân yêu thích',
      onClick: () => navigate('/my-favorites')
    }
  ];

  const ownerItems = [
    {
      key: '1',
      icon: <ScheduleOutlined />,
      label: <span>Quản lý đặt sân {ownerBadge > 0 && <Badge count={ownerBadge} style={{ marginLeft: 8 }} />}</span>,
      onClick: () => { setOwnerBadge(0); navigate('/manage-bookings'); }
    },
    { type: 'divider' },
    {
      key: '2',
      icon: <ShopOutlined />,
      label: 'Quản lý khu thể thao',
      onClick: () => navigate('/manage-venues')
    },
    {
      key: '3',
      icon: <CoffeeOutlined />,
      label: 'Quản lý sân lẻ',
      onClick: () => navigate('/manage-fields')
    }
  ];

  const adminItems = [
    {
      key: '1',
      icon: <WalletOutlined />,
      label: 'Quản lý thanh toán',
      onClick: () => navigate('/manage-payments')
    },
    {
      key: '2',
      icon: <TagOutlined />,
      label: 'Mã giảm giá',
      onClick: () => navigate('/manage-promotions')
    },
    {
      key: '3',
      icon: <AppstoreAddOutlined />,
      label: 'Quản lý loại sân',
      onClick: () => navigate('/manage-categories')
    }
  ];

  return (
    <>
      <Header 
        className="glass-navbar"
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '0 50px',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          height: '75px',
          lineHeight: 'normal'
        }}
      >
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🎾</span> 
          <span className="brand-text">SPORTS BOOKING</span>
        </Link>
        
        {/* KHUNG CHỨA CÁC NÚT: Đã gỡ bỏ toàn bộ các thẻ div bọc lẻ tẻ */}
        <div className="nav-menu" style={{ display: 'flex', alignItems: 'center', gap: '16px', height: '100%' }}>
          
          {userRole === 'Customer' && (
            <Dropdown menu={{ items: customerItems }} placement="bottomRight" arrow overlayClassName="custom-dropdown-menu">
              <Badge count={customerBadge} dot offset={[-5, 5]}>
                <Button type="text" className="nav-btn highlight-btn" icon={<DashboardOutlined />}>
                  Quản lý cá nhân
                </Button>
              </Badge>
            </Dropdown>
          )}

          {userRole === 'Owner' && (
            <Dropdown menu={{ items: ownerItems }} placement="bottomRight" arrow overlayClassName="custom-dropdown-menu">
              <Badge count={ownerBadge} dot offset={[-5, 5]}>
                <Button type="text" className="nav-btn highlight-btn" icon={<DashboardOutlined />}>
                  Quản lý hệ thống
                </Button>
              </Badge>
            </Dropdown>
          )}

          {userRole === 'Admin' && (
            <Dropdown menu={{ items: adminItems }} placement="bottomRight" arrow overlayClassName="custom-dropdown-menu">
              <Button type="text" className="nav-btn highlight-btn" icon={<DashboardOutlined />}>
                Quản trị Admin
              </Button>
            </Dropdown>
          )}

          {/* NÚT ĐĂNG NHẬP / ĐĂNG XUẤT ĐỨNG NGANG HÀNG TRỰC TIẾP */}
          {token ? (
            <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout} className="action-btn logout-btn">
              Đăng xuất
            </Button>
          ) : (
            <>
              <Button type="text" onClick={() => navigate('/register')} className="nav-btn">Đăng ký</Button>
              <Button type="primary" icon={<LoginOutlined />} onClick={() => navigate('/login')} className="action-btn login-btn">
                Đăng nhập
              </Button>
            </>
          )}
        </div>
      </Header>

      <style>{`
        .glass-navbar {
          background: rgba(255, 255, 255, 0.9) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03);
          transition: all 0.3s ease;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          text-decoration: none;
          gap: 10px;
          transition: transform 0.3s ease;
        }
        .navbar-brand:hover {
          transform: scale(1.05);
        }
        .brand-icon {
          font-size: 26px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }
        .brand-text {
          font-size: 22px;
          font-weight: 900;
          color: #008080;
          letter-spacing: 1.5px;
          background: linear-gradient(135deg, #00c2c2 0%, #008080 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          white-space: nowrap;
          line-height: 1;
        }

        /* GỘP CHUNG TẤT CẢ CÁC NÚT ĐỂ ÉP CHIỀU CAO VÀ CĂN GIỮA TUYỆT ĐỐI */
        .nav-btn, .action-btn {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          height: 42px !important;
          margin: 0 !important;
        }

        .nav-btn {
          font-size: 15px !important;
          font-weight: 600 !important;
          color: #555 !important;
          border-radius: 20px !important;
          padding: 0 16px !important;
          transition: all 0.3s ease !important;
        }
        
        .nav-btn:hover {
          color: #00c2c2 !important;
          background-color: rgba(0, 194, 194, 0.08) !important;
          transform: translateY(-2px);
        }

        .highlight-btn {
          color: #008080 !important;
          border: 1px solid rgba(0, 128, 128, 0.2) !important;
          background: rgba(0, 128, 128, 0.03) !important;
        }
        
        .highlight-btn:hover {
          border-color: #00c2c2 !important;
        }

        .action-btn {
          font-weight: 700 !important;
          border-radius: 25px !important;
          padding: 0 24px !important;
          border: none !important;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        }
        
        .login-btn {
          background: linear-gradient(135deg, #00c2c2 0%, #008080 100%) !important;
          color: white !important;
        }
        
        .logout-btn {
          background: linear-gradient(135deg, #ff4d4f 0%, #d9363e 100%) !important;
        }

        .action-btn:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 6px 20px rgba(0,0,0,0.15) !important;
        }

        /* Tinh chỉnh Menu Dropdown */
        .custom-dropdown-menu .ant-dropdown-menu {
          border-radius: 12px !important;
          padding: 8px !important;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
          border: 1px solid rgba(0,0,0,0.05);
        }
        
        .custom-dropdown-menu .ant-dropdown-menu-item {
          padding: 10px 20px !important;
          border-radius: 8px !important;
          font-weight: 500 !important;
          transition: all 0.2s !important;
        }
        
        .custom-dropdown-menu .ant-dropdown-menu-item:hover {
          background-color: rgba(0, 194, 194, 0.1) !important;
          color: #008080 !important;
        }
      `}</style>
    </>
  );
}

export default Navbar;