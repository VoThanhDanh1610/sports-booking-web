import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import FieldDetail from './pages/FieldDetail';
import Navbar from './components/Navbar';
import ManageFields from './pages/ManageFields';

// 1. Nhúng thư viện Toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// 2. Nhúng Ant Design ConfigProvider để "độ" giao diện toàn diện
import { ConfigProvider } from 'antd';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#008080', // Màu Teal sang trọng bạn đã chọn
          fontFamily: "'Poppins', sans-serif", // Phông chữ hiện đại
          borderRadius: 12, // Bo góc lớn cho cảm giác cao cấp
          colorBgContainer: '#ffffff',
        },
        components: {
          Button: {
            controlHeight: 40, // Nút bấm to và dễ bấm hơn
            fontWeight: 600,
          },
          Card: {
            boxShadowCard: '0 6px 16px 0 rgba(0, 0, 0, 0.08)', // Đổ bóng nhẹ cho thẻ sân
          }
        }
      }}
    >
      <BrowserRouter>
        {/* Navbar nằm ngoài Routes để trang nào cũng hiển thị */}
        <Navbar /> 
        
        {/* ToastContainer để thông báo hiện lên lung linh ở góc phải */}
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          theme="colored"
          style={{ marginTop: '50px' }} // Tránh đè lên Navbar
        />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/field/:id" element={<FieldDetail />} />
          <Route path="/register" element={<Register />} />
          <Route path="/manage-fields" element={<ManageFields />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;