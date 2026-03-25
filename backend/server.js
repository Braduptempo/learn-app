import express from 'express';
import cors from 'cors';
import vakkenRoutes from './routes/vakkenRoutes.js';
import vragenRoutes from './routes/vragenRoutes.js';
import modulesRoutes from './routes/modulesRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Routes koppelen
app.use('/api/vakken', vakkenRoutes);
app.use('/api/vragen', vragenRoutes);
app.use('/api/modules', modulesRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server draait op http://localhost:${PORT}`);
});
