import db from '../db.js';

// Bloqueia todas as rotas exceto /api/setup até existir um administrador.
export async function setupGuard(req, res, next) {
  const admin = await db('users').where({ role: 'admin' }).first();
  if (!admin) {
    return res.status(503).json({ needsSetup: true, message: 'Instalação por concluir. Vai a /setup.' });
  }
  next();
}
