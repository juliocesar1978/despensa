import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api.js';

export default function ShoppingList() {
  const [itens, setItens] = useState([]);

  function carregar() { apiGet('/shopping').then(setItens); }
  useEffect(carregar, []);

  async function marcarComprado(id) {
    await apiPost(`/shopping/${id}/comprado`, {});
    carregar();
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 16, fontFamily: 'sans-serif' }}>
      <h1>🛒 Lista de compras</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {itens.map((i) => (
          <li key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <span>{i.nome} — {i.quantidade_sugerida} {i.unidade} {i.origem === 'auto_stock_baixo' && '🔴 automático'}</span>
            <button onClick={() => marcarComprado(i.id)}>✅ Comprado</button>
          </li>
        ))}
      </ul>
      {itens.length === 0 && <p>Nada a comprar por agora 🎉</p>}
    </div>
  );
}
