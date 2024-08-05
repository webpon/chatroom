const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// 托管static/dist目录中的静态文件
app.use(express.static(path.join(__dirname, 'static', 'dist')));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let users = [];

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join', (username) => {
    users.push(username);
    io.emit('user joined', users);
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    users = users.filter(user => user !== socket.username);
    io.emit('user left', users);
  });
});

// 为了确保Vue路由的history模式能正常工作，添加一个通配符路由
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
