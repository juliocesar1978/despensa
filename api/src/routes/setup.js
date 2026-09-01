import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';

const router = Router();

// Usado pelo wizard para saber se falta configurar e para detetar o domínio automaticamente
// (via header X-Forwarded-Host, reencaminhado pelo Nginx Proxy Manager).
router.get('/status', async (req, res) => {
  const admin = await db('users').where({ role: 'admin' }).first();
  const forwardedHost = req.headers['x-forwarded-host'];
  const detectedDomain = (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost) || req.headers.host;
  res.json({ needsSetup: !admin, detectedDomain });
});

// Cria o admin + domínio + membros iniciais. Só funciona enquanto não houver admin.
router.post('/', async (req, res) => {
  const existingAdmin = await db('users').where({ role: 'admin' }).first();
  if (existingAdmin) return res.status(409).json({ error: 'A instalação já foi concluída.' });

  const { dominio, admin, membros } = req.body;
  if (!admin?.nome || !admin?.email || !admin?.password) {
    return res.status(400).json({ error: 'Dados do administrador em falta.' });
  }

  await db.transaction(async (trx) => {
    const hash = await bcrypt.hash(admin.password, 10);
    await trx('users').insert({ nome: admin.nome, email: admin.email, password_hash: hash, role: 'admin' });

    for (const m of membros || []) {
      if (!m.nome || !m.email || !m.password) continue;
      const h = await bcrypt.hash(m.password, 10);
      await trx('users').insert({ nome: m.nome, email: m.email, password_hash: h, role: 'membro' });
    }

    if (dominio) {
      await trx('settings').insert({ chave: 'app_domain', valor: dominio }).onConflict('chave').merge();
    }
    await trx('settings').insert({ chave: 'setup_completed', valor: 'true' }).onConflict('chave').merge();
  });

  res.json({ ok: true });
});

export default router;
