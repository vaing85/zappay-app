const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Store connected users
const connectedUsers = new Map();

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user authentication
  socket.on('authenticate', (data) => {
    const { userId } = data;
    connectedUsers.set(socket.id, { userId, socket });
    console.log(`User ${userId} authenticated with socket ${socket.id}`);
  });

  // Handle balance requests
  socket.on('request_balance', (data) => {
    const { userId } = data;
    const user = connectedUsers.get(socket.id);
    
    if (user && user.userId === userId) {
      // Simulate balance update
      const currentBalance = Math.random() * 10000 + 1000; // Random balance between 1000-11000
      const previousBalance = currentBalance - (Math.random() * 200 - 100); // Random change
      const change = currentBalance - previousBalance;
      
      socket.emit('balance_updated', {
        userId,
        balance: currentBalance,
        previousBalance,
        change,
        timestamp: new Date(),
        reason: 'transaction'
      });
    }
  });

  // Simulate real-time events
  setInterval(() => {
    connectedUsers.forEach((user, socketId) => {
      if (user.socket) {
        // Simulate random notifications
        if (Math.random() < 0.1) { // 10% chance every 5 seconds
          const notificationTypes = ['transaction', 'balance', 'security', 'system'];
          const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
          
          user.socket.emit('system_notification', {
            userId: user.userId,
            title: `${type.charAt(0).toUpperCase() + type.slice(1)} Update`,
            message: `This is a simulated ${type} notification`,
            priority: 'medium',
            broadcast: false
          });
        }

        // Simulate balance changes
        if (Math.random() < 0.05) { // 5% chance every 5 seconds
          const currentBalance = Math.random() * 10000 + 1000;
          const previousBalance = currentBalance - (Math.random() * 200 - 100);
          const change = currentBalance - previousBalance;
          
          user.socket.emit('balance_updated', {
            userId: user.userId,
            balance: currentBalance,
            previousBalance,
            change,
            timestamp: new Date(),
            reason: 'transaction'
          });
        }
      }
    });
  }, 5000); // Every 5 seconds

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    connectedUsers.delete(socket.id);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    connectedUsers: connectedUsers.size,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
