// server/app.js
require('dotenv').config();

const express = require('express');
const app = express();
require('./db/conn'); 

const http = require('http');
const { Server } = require("socket.io");

const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const partyRoutes = require('./routes/partyRoutes');
const movieRoutes = require('./routes/movieRoutes');

const corsOptions = {
    origin: ['http://localhost:8080', 'http://192.168.29.11:8080', 'http://172.28.81.140:8080', 'http://192.168.71.106:8080', 'http://192.168.29.10:8080', 'http://192.168.29.230:8080', 'http://172.28.81.73:8080','http://172.28.80.165:8080' ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(express.json());
app.use(cors(corsOptions));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/parties', partyRoutes);
app.use('/api/movies', movieRoutes);

const port = process.env.PORT || 8005;
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: corsOptions.origin,
    methods: ["GET", "POST"],
  }
});

app.set('socketio', io);

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Usuário conectado: ${socket.id}`);

  socket.on('joinPartyRoom', (partyId) => {
    if (partyId) {
        socket.join(partyId.toString());
        console.log(`[Socket.IO] Socket ${socket.id} entrou na sala da party ${partyId}`);
    } else {
        console.warn(`[Socket.IO] Socket ${socket.id} tentou entrar em sala de party com ID indefinido.`);
    }
  });

  socket.on('leavePartyRoom', (partyId) => {
    if (partyId) {
        socket.leave(partyId.toString());
        console.log(`[Socket.IO] Socket ${socket.id} saiu da sala da party ${partyId}`);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`[Socket.IO] Usuário desconectado: ${socket.id}. Razão: ${reason}`);
  });
});

httpServer.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Servidor (HTTP & WebSocket) rodando em http://0.0.0.0:${port}`);
});