import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { setupGuard } from './middleware/setupGuard.js';

import setupRoutes from './routes/setup.js';
import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/categories.js';
import productRoutes from './routes/products.js';
import stockRoutes from './routes/stock.js';
import shoppingRoutes from './routes/shopping.js';
import pushRoutes from './routes/push.js';

const app = express();
app.set('trust proxy', true); // para ler o Host real reencaminhado pelo proxy (NPM / Cloudflare Tunnel)
app.use(cors());
app.use(express.json());

app.use('/api/setup', setupRoutes);
app.use('/api', setupGuard);

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/shopping', shoppingRoutes);
app.use('/api/push', pushRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true, edicao: process.env.DEPLOY_EDITION || 'lite' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Despensa API (${process.env.DEPLOY_EDITION || 'lite'}) a correr na porta ${PORT}`));
