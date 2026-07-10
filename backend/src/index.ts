import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import apiRoutes from './routes/api';

const app = express();
const port = process.env.PORT || 3000;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';

// Ensure uploads/audio directory exists
const uploadsDir = path.join(__dirname, '../uploads');
const audioDir = path.join(uploadsDir, 'audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// Middlewares
app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(morgan('dev'));
app.use(express.json());

// Serve static uploads
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api', apiRoutes);

// Root health-checks
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Walkin Portal Express API Server. Healthy and running.' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(Number(port), '0.0.0.0', () => {
  console.log(`🚀 Backend Express server ready at http://0.0.0.0:${port}`);
  console.log(`🔗 Accepting requests from: ${frontendUrl}`);
});

export default app;
