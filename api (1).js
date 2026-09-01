import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const rows = await db('shopping_list as sl')
    .join('products as p', 'p.id', 'sl.product_id')
    .where('sl.estado', 'pendente')
    .select('sl.*', 'p.nome', 'p.unidade')
    .orderBy('sl.criado_em', 'desc');
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { product_id, quantidade_sugerida } = req.body;
  const [id] = await db('shopping_list').insert({ product_id, quantidade_sugerida: quantidade_sugerida || 1, origem: 'manual' });
  res.json({ id });
});

router.post('/:id/comprado', async (req, res) => {
  await db('shopping_list').where({ id: req.params.id }).update({ estado: 'comprado' });
  res.json({ ok: true });
});

export default router;
