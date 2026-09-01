import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { checkLowStock } from '../services/stockChecks.js';

const router = Router();
router.use(requireAuth);

// Stock atual agregado por produto
router.get('/', async (req, res) => {
  const rows = await db('products as p')
    .leftJoin('stock_items as s', 's.product_id', 'p.id')
    .groupBy('p.id')
    .select('p.id', 'p.nome', 'p.unidade', 'p.stock_minimo', 'p.imagem_url')
    .sum('s.quantidade as total_stock')
    .min('s.validade as validade_mais_proxima');
  res.json(rows);
});

// Produtos a expirar nos próximos N dias (default 5)
router.get('/a-expirar', async (req, res) => {
  const dias = Number(req.query.dias) || 5;
  const limite = new Date();
  limite.setDate(limite.getDate() + dias);
  const rows = await db('stock_items as s')
    .join('products as p', 'p.id', 's.product_id')
    .where('s.validade', '<=', limite.toISOString().slice(0, 10))
    .andWhere('s.quantidade', '>', 0)
    .select('s.*', 'p.nome', 'p.unidade')
    .orderBy('s.validade', 'asc');
  res.json(rows);
});

// Entrada de stock (compra / arrumação)
router.post('/entrada', async (req, res) => {
  const { product_id, quantidade, validade, localizacao } = req.body;
  await db.transaction(async (trx) => {
    await trx('stock_items').insert({
      product_id, quantidade, validade: validade || null, localizacao, adicionado_por: req.user.id
    });
    await trx('movements').insert({ product_id, tipo: 'entrada', quantidade, user_id: req.user.id });
  });
  res.json({ ok: true });
});

// Consumo de stock — retira pela validade mais próxima primeiro (FIFO)
router.post('/consumo', async (req, res) => {
  const { product_id, quantidade, tipo = 'consumo' } = req.body;
  let restante = Number(quantidade);

  await db.transaction(async (trx) => {
    const items = await trx('stock_items')
      .where({ product_id })
      .andWhere('quantidade', '>', 0)
      .orderBy('validade', 'asc');

    for (const item of items) {
      if (restante <= 0) break;
      const usar = Math.min(item.quantidade, restante);
      await trx('stock_items').where({ id: item.id }).decrement('quantidade', usar);
      restante -= usar;
    }
    await trx('movements').insert({ product_id, tipo, quantidade, user_id: req.user.id });
  });

  await checkLowStock(product_id);
  res.json({ ok: true });
});

export default router;
