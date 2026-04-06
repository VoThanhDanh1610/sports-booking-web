import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import FieldDetail from './pages/FieldDetail';
import Navbar from './components/Navbar';
import ManageFields from './pages/ManageFields';
import BookingPage from './pages/BookingPage';
import MyBookings from './pages/MyBookings';
import ManageBookings from './pages/ManageBookings';
import MyPayments from './pages/MyPayments';
import ManagePayments from './pages/ManagePayments';
import ManagePromotions from './pages/ManagePromotions';
import PaymentReturn from './pages/PaymentReturn';
import ManageVenues from './pages/ManageVenues';
import VenueDetail from './pages/VenueDetail';
<<<<<<< HEAD
import ManageUsers from './pages/ManageUsers';
=======
import ManageCategories from './pages/ManageCategories';
import MyFavorites from './pages/MyFavorites';
>>>>>>> c0a1ad870691fc2b2aafa2d1ebe4794ea1504942

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ConfigProvider } from 'antd';
import socket from './socket';

function App() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch {
      return;
    }

    const userId = decoded.id;
    const userRole = decoded.role;

    socket.connect();
    socket.emit('joinRoom', userId);
    if (userRole === 'Admin') socket.emit('joinRoom', 'admin');

    // Lắng nghe thông báo đến đúng user
    socket.on('newBooking', (data) => {
      toast.info(data.message, { autoClose: 5000 });
    });
    socket.on('bookingConfirmed', (data) => {
      toast.success(data.message, { autoClose: 5000 });
    });
    socket.on('bookingCancelled', (data) => {
      toast.warning(data.message, { autoClose: 5000 });
    });
    socket.on('bookingCompleted', (data) => {
      toast.success(data.message, { autoClose: 5000 });
    });

    return () => {
      socket.off('newBooking');
      socket.off('bookingConfirmed');
      socket.off('bookingCancelled');
      socket.off('bookingCompleted');
      socket.disconnect();
    };
  }, []);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#008080',
          fontFamily: "'Poppins', sans-serif",
          borderRadius: 12,
          colorBgContainer: '#ffffff',
        },
        components: {
          Button: { controlHeight: 40, fontWeight: 600 },
          Card: { boxShadowCard: '0 6px 16px 0 rgba(0, 0, 0, 0.08)' }
        }
      }}
    >
      <BrowserRouter>
        <Navbar />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="colored"
          style={{ marginTop: '50px' }}
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/field/:id" element={<FieldDetail />} />
          <Route path="/register" element={<Register />} />
          <Route path="/manage-fields" element={<ManageFields />} />
          <Route path="/booking/:fieldId" element={<BookingPage />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/manage-bookings" element={<ManageBookings />} />
          <Route path="/my-payments" element={<MyPayments />} />
          <Route path="/manage-payments" element={<ManagePayments />} />
          <Route path="/manage-promotions" element={<ManagePromotions />} />
          <Route path="/payment/return" element={<PaymentReturn />} />
          <Route path="/manage-venues" element={<ManageVenues />} />
          <Route path="/venue/:id" element={<VenueDetail />} />
<<<<<<< HEAD
          <Route path="/manage-users" element={<ManageUsers />} />
=======
          <Route path="/manage-categories" element={<ManageCategories />} />
          <Route path="/my-favorites" element={<MyFavorites />} />
>>>>>>> c0a1ad870691fc2b2aafa2d1ebe4794ea1504942
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
