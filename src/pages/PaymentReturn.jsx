import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

function PaymentReturn() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const code = params.get('code');
  const orderCode = params.get('orderCode');
  const cancelled = params.get('cancelled');
  const isSuccess = code === '00' && !cancelled;

  useEffect(() => {
    if (isSuccess && orderCode) {
      // Gọi backend xác nhận thanh toán (fallback khi webhook chưa kịp gọi)
      axios.get(`http://localhost:5000/api/payments/confirm-return?orderCode=${orderCode}`)
        .catch(() => {});
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fcfcfd' }}>
      {isSuccess ? (
        <Result
          icon={<CheckCircleOutlined style={{ color: '#008080' }} />}
          title="Thanh toán thành công!"
          subTitle="Cảm ơn bạn đã thanh toán. Đặt sân của bạn đã được xác nhận."
          extra={
            <Button type="primary" onClick={() => navigate('/my-bookings')} style={{ borderRadius: 8 }}>
              Xem lịch sử đặt sân
            </Button>
          }
        />
      ) : (
        <Result
          icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
          status="error"
          title="Thanh toán thất bại hoặc đã hủy"
          subTitle="Giao dịch chưa hoàn tất. Bạn có thể thử lại từ trang đặt sân của tôi."
          extra={
            <Button onClick={() => navigate('/my-bookings')} style={{ borderRadius: 8 }}>
              Quay lại đặt sân của tôi
            </Button>
          }
        />
      )}
    </div>
  );
}

export default PaymentReturn;
