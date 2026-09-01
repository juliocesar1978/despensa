import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet, apiPost } from '../api.js';
import { ativarNotificacoes } from '../push.js';

export default function Dashboard() {
  const [stock, setStock] = useState([]);
  const [expira, setExpira] = useState([]);

  function carregar() {
    apiGet('/stock').then(setStock);
    apiGet('/stock/a-expirar?dias=5').then(setExpira);
  }

  useEffect(carregar, []);

  async function consumir(id) {
    await apiPost('/stock/consumo', { product_id: id, quantidade: 1 });
    carregar();
  }

  async function ativar() {
    try {
      await ativarNotificacoes();
      alert('Notificações ativadas! 🔔');
    } catch (e) {
      alert('Não foi possível ativar: ' + e.message);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 16, fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🥫 Despensa</h1>
        <nav>
          <Link to="/adicionar">➕ Adicionar</Link>{' '}・{' '}<Link to="/compras">🛒 Compras</Link>{' '}・{' '}
          <button onClick={ativar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit', padding: 0 }}>🔔 Notificações</button>
        </nav>
      </header>

      {expira.length > 0 && (
        <section style={{ background: '#fff4e5', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <strong>⚠️ A expirar em breve:</strong>
          <ul>
            {expira.map((i) => (
              <li key={i.id}>{i.nome} — {i.quantidade} {i.unidade} (válido até {i.validade})</li>
            ))}
          </ul>
        </section>
      )}

      <h2>Stock atual</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {stock.map((p) => (
          <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <span>
              {p.nome} — <strong>{p.total_stock || 0} {p.unidade}</strong>
              {p.total_stock < p.stock_minimo && ' 🔴'}
            </span>
            <button onClick={() => consumir(p.id)}>-1</button>
          </li>
        ))}
        {stock.length === 0 && <p>Ainda não há produtos registados.</p>}
      </ul>
    </div>
  );
}
