import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import { sequelize } from './models/index.js';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import guestRoutes from './routes/guests.js';
import attendanceRoutes from './routes/attendances.js';
import badgeRoutes from './routes/badges.js';
import statsRoutes from './routes/stats.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.set('io', io);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/attendances', attendanceRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/stats', statsRoutes);

// Socket.IO Events
io.on('connection', (socket) => {
  console.log(`🔌 Client connecté à Socket.IO: ${socket.id}`);

  socket.on('join-event', (eventId) => {
    socket.join(`event_${eventId}`);
  });

  socket.on('leave-event', (eventId) => {
    socket.leave(`event_${eventId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client déconnecté: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion MySQL réussie.');

    await sequelize.sync({ alter: true });
    console.log('✅ Synchronisation des tables effectuée avec succès.');

    server.listen(PORT, () => {
      console.log(`🚀 Serveur Backend El-Moultaka App en cours d'exécution sur le port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Impossible de démarrer le serveur:', error);
    process.exit(1);
  }
}

startServer();
