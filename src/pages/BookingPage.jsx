import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Card, Button, DatePicker, Typography, Spin, Row, Col, Tag, Divider } from 'antd';
import {
  ArrowLeftOutlined, CalendarOutlined, ClockCircleOutlined,
  CheckCircleOutlined, EnvironmentOutlined, DollarCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

function BookingPage() {
  const { fieldId } = useParams();
  const navigate = useNavigate();
  const [field, setField] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchField = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/fields/${fieldId}`);
        setField(res.data.data);
      } catch {
        toast.error('Không tìm thấy thông tin sân!');
        navigate('/');
      }
    };
    fetchField();
  }, [fieldId]);

  useEffect(() => {
    if (fieldId && selectedDate) fetchTimeSlots(selectedDate);
  }, [selectedDate, fieldId]);

  const fetchTimeSlots = async (date) => {
    setLoadingSlots(true);
    setSelectedSlots([]);
    try {
      const dateStr = date.format('YYYY-MM-DD');
      const res = await axios.get(
        `http://localhost:5000/api/bookings/fields/${fieldId}/timeslots?date=${dateStr}`
      );
      setTimeSlots(res.data);
    } catch {
      toast.error('Không thể tải khung giờ!');
    } finally {
      setLoadingSlots(false);
    }
  };

  const toggleSlot = (slot) => {
    if (slot.status === 'booked') return;
    setSelectedSlots(prev =>
      prev.includes(slot._id)
        ? prev.filter(id => id !== slot._id)
        : [...prev, slot._id]
    );
  };

  const totalPrice = field ? field.pricePerHour * selectedSlots.length : 0;

  const handleBooking = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.warning('Bạn cần đăng nhập để đặt sân!');
      navigate('/login');
      return;
    }
    if (selectedSlots.length === 0) {
      toast.warning('Vui lòng chọn ít nhất 1 khung giờ!');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(
        'http://localhost:5000/api/bookings',
        { fieldId, date: selectedDate.format('YYYY-MM-DD'), timeSlotIds: selectedSlots },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Đặt sân thành công! 🎉');
      navigate('/my-bookings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đặt sân thất bại!');
    } finally {
      setSubmitting(false);
    }
  };

  if (!field) return (
    <div style={{ textAlign: 'center', padding: '100px' }}>
      <Spin size="large" tip="Đang tải dữ liệu..." />
    </div>
  );

  return (
    <div style={{ padding: '40px 50px', backgroundColor: '#fcfcfd', minHeight: '100vh' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(`/field/${fieldId}`)}
        style={{ marginBottom: 20, borderRadius: 8 }}
      >
        Quay lại
      </Button>

      <Title level={3} style={{ color: '#008080', marginBottom: 4 }}>
        Đặt sân: {field.name}
      </Title>
      <Text type="secondary">
        <EnvironmentOutlined /> {field.location} &nbsp;|&nbsp;
        <DollarCircleOutlined /> {field.pricePerHour.toLocaleString()}đ/giờ
      </Text>

      <Row gutter={[30, 30]} style={{ marginTop: 30 }}>
        {/* Chọn ngày + khung giờ */}
        <Col xs={24} lg={16}>
          <Card
            title={<span><CalendarOutlined /> Chọn ngày &amp; khung giờ</span>}
            style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          >
            <div style={{ marginBottom: 24 }}>
              <Text strong>Ngày đặt sân: </Text>
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                disabledDate={(d) => d && d < dayjs().startOf('day')}
                format="DD/MM/YYYY"
                size="large"
                style={{ marginLeft: 12, borderRadius: 8 }}
              />
            </div>

            <Divider orientation="left">
              <ClockCircleOutlined /> Khung giờ trong ngày (06:00 - 22:00)
            </Divider>

            {loadingSlots ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin />
              </div>
            ) : (
              <Row gutter={[12, 12]}>
                {timeSlots.map(slot => {
                  const isSelected = selectedSlots.includes(slot._id);
                  const isBooked = slot.status === 'booked';
                  return (
                    <Col key={slot._id} xs={12} sm={8} md={6}>
                      <div
                        onClick={() => toggleSlot(slot)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: 10,
                          textAlign: 'center',
                          cursor: isBooked ? 'not-allowed' : 'pointer',
                          border: `2px solid ${isBooked ? '#f0f0f0' : isSelected ? '#008080' : '#d9d9d9'}`,
                          backgroundColor: isBooked ? '#f5f5f5' : isSelected ? '#e6f7f7' : '#fff',
                          transition: 'all 0.2s',
                          userSelect: 'none'
                        }}
                      >
                        <Text
                          strong
                          style={{
                            color: isBooked ? '#bbb' : isSelected ? '#008080' : '#333',
                            fontSize: 13
                          }}
                        >
                          {slot.startTime} - {slot.endTime}
                        </Text>
                        <br />
                        <Tag
                          color={isBooked ? 'default' : isSelected ? 'cyan' : 'green'}
                          style={{ marginTop: 4, fontSize: 11, borderRadius: 6 }}
                        >
                          {isBooked ? 'Đã đặt' : isSelected ? 'Đã chọn' : 'Trống'}
                        </Tag>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            )}
          </Card>
        </Col>

        {/* Tóm tắt đơn đặt */}
        <Col xs={24} lg={8}>
          <Card
            title={<span><CheckCircleOutlined /> Tóm tắt đặt sân</span>}
            style={{
              borderRadius: 16,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              position: 'sticky',
              top: 80
            }}
          >
            <div style={{ marginBottom: 14 }}>
              <Text type="secondary">Sân:</Text>
              <br />
              <Text strong>{field.name}</Text>
            </div>
            <div style={{ marginBottom: 14 }}>
              <Text type="secondary">Ngày:</Text>
              <br />
              <Text strong>{selectedDate?.format('DD/MM/YYYY')}</Text>
            </div>
            <div style={{ marginBottom: 14 }}>
              <Text type="secondary">Số giờ đã chọn:</Text>
              <br />
              <Text strong>{selectedSlots.length} giờ</Text>
            </div>
            <div style={{ marginBottom: 14 }}>
              <Text type="secondary">Giá/giờ:</Text>
              <br />
              <Text strong>{field.pricePerHour.toLocaleString()}đ</Text>
            </div>
            <Divider />
            <div style={{ marginBottom: 20 }}>
              <Text type="secondary">Tổng tiền:</Text>
              <br />
              <Text strong style={{ fontSize: 26, color: '#008080' }}>
                {totalPrice.toLocaleString()}đ
              </Text>
            </div>
            <Button
              type="primary"
              size="large"
              block
              loading={submitting}
              disabled={selectedSlots.length === 0}
              onClick={handleBooking}
              style={{ height: 50, borderRadius: 12, fontWeight: 'bold' }}
            >
              XÁC NHẬN ĐẶT SÂN
            </Button>
            <Text type="secondary" style={{ display: 'block', marginTop: 10, textAlign: 'center', fontSize: 12 }}>
              Giữ Ctrl để chọn nhiều khung giờ
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default BookingPage;
