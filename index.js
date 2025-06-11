import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import screenRoutes from './routes/screenRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

// Configurar dotenv
dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', userRoutes);
app.use("/api/proyectos", projectRoutes);
app.use("/api/screen", screenRoutes);
app.use("/api/message", messageRoutes);

app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

io.on('connection', (socket) => {
  console.log('👤 Usuario conectado:', socket.id);

  // Unirse a una sala de proyecto
  socket.on('join-project', ({ projectId }) => {
    socket.join(`project-${projectId}`);
    socket.to(`project-${projectId}`).emit('user-joined', {
      userId: socket.id,
      userName: 'Usuario',
      timestamp: Date.now()
    });
    console.log(`👥 Usuario ${socket.id} se unió al proyecto ${projectId}`);
  });

  // Salir de una sala de proyecto
  socket.on('leave-project', ({ projectId }) => {
    socket.leave(`project-${projectId}`);
    socket.to(`project-${projectId}`).emit('user-left', {
      userId: socket.id,
      userName: 'Usuario',
      timestamp: Date.now()
    });
    console.log(`👋 Usuario ${socket.id} salió del proyecto ${projectId}`);
  });

  // Actualizar elementos
  socket.on("update-elements", ({ projectId, screenId, elements, timestamp }) => {
    // ✅ AGREGAR: Validación básica
    if (!projectId || !screenId || !Array.isArray(elements)) {
      console.warn('⚠️ Datos inválidos en update-elements:', { projectId, screenId, elements });
      return;
    }

    // Enviar a todos los usuarios en la sala EXCEPTO al que envió
    socket.to(`project-${projectId}`).emit("elements-updated", {
      projectId,
      screenId,
      elements,
      timestamp,
      userId: socket.id
    });
    console.log(`🔄 Elementos actualizados en proyecto ${projectId}, pantalla ${screenId} (${elements.length} elementos)`);
  });

  socket.on('disconnect', () => {
    console.log('👤 Usuario desconectado:', socket.id);
  });
});
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor backend y WebSocket corriendo en http://localhost:${PORT}`);
});