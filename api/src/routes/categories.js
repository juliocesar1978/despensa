import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  res.json(await db('categories').select('*').orderBy('nome'));
});

router.post('/', async (req, res) => {
  const [id] = await db('categories').insert({ nome: req.body.nome });
  res.json({ id });
});

export default router;
