import db from '../db.js';

export async function checkLowStock(productId) {
  const product = await db('products').where({ id: productId }).first();
  if (!product) return;
  const row = await db('stock_items').where({ product_id: productId }).sum('quantidade as total').first();
  const total = row?.total || 0;
  if (total < product.stock_minimo) {
    const existing = await db('shopping_list').where({ product_id: productId, estado: 'pendente' }).first();
    if (!existing) {
      await db('shopping_list').insert({
        product_id: productId,
        quantidade_sugerida: Math.max(product.stock_minimo - total, 1),
        origem: 'auto_stock_baixo'
      });
    }
  }
}

export async function checkAllLowStock() {
  const products = await db('products').select('id');
  for (const p of products) await checkLowStock(p.id);
}

export async function checkExpiringSoon(dias = 3) {
  const limite = new Date();
  limite.setDate(limite.getDate() + dias);
  return db('stock_items as s')
    .join('products as p', 'p.id', 's.product_id')
    .where('s.validade', '<=', limite.toISOString().slice(0, 10))
    .andWhere('s.quantidade', '>', 0)
    .select('s.*', 'p.nome', 'p.unidade');
}
