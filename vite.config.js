import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { lookupByEan } from '../services/openFoodFacts.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  res.json(await db('products').select('*').orderBy('nome'));
});

// Consulta por EAN: primeiro na BD local (produto já conhecido), depois na Open Food Facts.
// Não cria nada — é usado logo a seguir a ler o código de barras.
router.get('/lookup/:ean', async (req, res) => {
  const cached = await db('products').where({ ean: req.params.ean }).first();
  if (cached) return res.json({ existe: true, product: cached });

  const info = await lookupByEan(req.params.ean);
  if (!info) return res.status(404).json({ existe: false, encontrado: false });
  res.json({ existe: false, encontrado: true, sugestao: { ...info, ean: req.params.ean } });
});

router.post('/', async (req, res) => {
  const { nome, ean, categoria_id, imagem_url, unidade, stock_minimo } = req.body;
  const [id] = await db('products').insert({ nome, ean: ean || null, categoria_id, imagem_url, unidade, stock_minimo });
  res.json({ id });
});

export default router;
