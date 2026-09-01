import { cacheGet, cacheSet } from './cache.js';

const BASE = 'https://world.openfoodfacts.org/api/v2/product';

export async function lookupByEan(ean) {
  const cacheKey = `off:${ean}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const resp = await fetch(`${BASE}/${ean}.json`);
  if (!resp.ok) return null;
  const data = await resp.json();
  if (data.status !== 1) return null;

  const p = data.product;
  const info = {
    nome: p.product_name || p.generic_name || `Produto ${ean}`,
    imagem_url: p.image_front_small_url || p.image_url || null,
    categoria: (p.categories_tags?.[0] || '').replace(/^\w+:/, '')
  };

  await cacheSet(cacheKey, info);
  return info;
}
