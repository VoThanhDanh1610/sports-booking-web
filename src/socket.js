import { io } from 'socket.io-client';

// autoConnect: false → chỉ connect khi user đã đăng nhập
const socket = io('http://localhost:5000', { autoConnect: false });

export default socket;
