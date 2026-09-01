import { createClient } from 'redis';

let client = null;
if (process.env.REDIS_URL) {
  client = createClient({ url: process.env.REDIS_URL });
  client.on('error', (err) => console.error('Redis erro:', err.message));
  client.connect().catch((err) => console.error('Redis ligação falhou:', err.message));
}

export async function cacheGet(key) {
  if (!client?.isOpen) return null;
  try {
    const v = await client.get(key);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key, value, ttlSeconds = 60 * 60 * 24 * 30) {
  if (!client?.isOpen) return;
  try {
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch {
    // cache é um bónus, nunca deve bloquear o fluxo principal
  }
}
