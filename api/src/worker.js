import 'dotenv/config';
import cron from 'node-cron';
import db from './db.js';
import { checkAllLowStock, checkExpiringSoon } from './services/stockChecks.js';
import { sendNotificationToAll } from './services/push.js';

// Espera que a API tenha terminado as migrações antes de começar a interrogar as tabelas.
async function waitForDb(tentativas = 20) {
  for (let i = 0; i < tentativas; i++) {
    try {
      await db('users').first();
      return true;
    } catch {
      console.log('[worker] a aguardar base de dados / migrações...');
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  return false;
}

async function tarefaDiaria() {
  try {
    await checkAllLowStock();
    const aExpirar = await checkExpiringSoon(3);
    if (aExpirar.length > 0) {
      const nomes = aExpirar.map((i) => i.nome).join(', ');
      await sendNotificationToAll({
        title: '🥫 Despensa — produtos a expirar',
        body: `A expirar nos próximos 3 dias: ${nomes}`
      });
    }
    console.log(`[worker] verificação concluída — ${aExpirar.length} produto(s) a expirar em breve.`);
  } catch (err) {
    console.error('[worker] erro na tarefa diária:', err.message);
  }
}

(async () => {
  const ok = await waitForDb();
  if (!ok) {
    console.error('[worker] não foi possível ligar à base de dados. A sair.');
    process.exit(1);
  }
  console.log('[worker] Despensa worker (Pro) arrancado — tarefa diária às 08:00.');
  cron.schedule('0 8 * * *', tarefaDiaria);
  tarefaDiaria(); // corre uma vez logo no arranque, útil em testes
})();
