import webpush from 'web-push';
import db from '../db.js';

export const pushConfigured = !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);

if (pushConfigured) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// Envia a mesma notificação a todos os subscritores (é uma app de casa, sem segmentação por utilizador).
export async function sendNotificationToAll(payload) {
  if (!pushConfigured) return;
  const subs = await db('push_subscriptions').select('*');
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      );
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        await db('push_subscriptions').where({ id: sub.id }).delete();
      }
    }
  }
}
