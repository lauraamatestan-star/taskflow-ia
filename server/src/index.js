const express = require('express');
const cors = require('cors');
const path = require('path');
const { PORT } = require('./config/env');
const taskRoutes = require('./routes/task.routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

// Middleware global
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../docs/ai')));

// Ruta de prueba
app.get('/health', (req, res) => {
  res.json({ message: 'Servidor TaskFlow funcionando' });
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas de tareas
app.use('/api/v1/tasks', taskRoutes);

// Middleware global de manejo de errores (al final de las rutas)
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);

  if (err.message && err.message.includes('NOT_FOUND')) {
    return res.status(404).json({ error: 'Recurso no encontrado' });
  }

  if (err.message && err.message.toLowerCase().includes('validation')) {
    return res.status(400).json({ error: err.message });
  }

  if (err.status === 400) {
    return res.status(400).json({ error: err.message || 'Solicitud inválida' });
  }

  return res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`[TaskFlow API] Servidor escuchando en puerto ${PORT}`);
});