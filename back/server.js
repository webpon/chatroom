const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'static', 'dist')));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let users = new Map(); // 使用 Map 来存储用户名和 socket.id 的对应关系

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join', (username) => {
    users.set(socket.id, username);
    io.emit('user joined', Array.from(users.values()));
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    users.delete(socket.id);
    io.emit('user left', Array.from(users.values()));
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
