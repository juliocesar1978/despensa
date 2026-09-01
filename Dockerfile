import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { pushConfigured } from '../services/push.js';

const router = Router();

router.get('/public-key', (req, res) => {
  if (!pushConfigured) return res.status(501).json({ error: 'Notificações push não configuradas nesta edição.' });
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

router.post('/subscribe', requireAuth, async (req, res) => {
  if (!pushConfigured) return res.status(501).json({ error: 'Notificações push não configuradas nesta edição.' });
  const { endpoint, keys } = req.body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) return res.status(400).json({ error: 'Subscrição inválida' });

  const existing = await db('push_subscriptions').where({ endpoint }).first();
  if (existing) {
    await db('push_subscriptions').where({ endpoint }).update({ user_id: req.user.id, p256dh: keys.p256dh, auth: keys.auth });
  } else {
    await db('push_subscriptions').insert({ user_id: req.user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth });
  }
  res.json({ ok: true });
});

export default router;
