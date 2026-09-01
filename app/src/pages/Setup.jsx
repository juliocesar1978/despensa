import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api.js';

export default function Setup() {
  const [dominio, setDominio] = useState('');
  const [admin, setAdmin] = useState({ nome: '', email: '', password: '' });
  const [membro, setMembro] = useState({ nome: '', email: '', password: '' });
  const [done, setDone] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    apiGet('/setup/status').then((r) => setDominio(r.detectedDomain || ''));
  }, []);

  async function submeter(e) {
    e.preventDefault();
    setErro('');
    try {
      await apiPost('/setup', { dominio, admin, membros: membro.nome ? [membro] : [] });
      setDone(true);
    } catch (err) {
      setErro(err.message);
    }
  }

  if (done) {
    return (
      <div style={{ maxWidth: 480, margin: '48px auto', fontFamily: 'sans-serif', padding: 16 }}>
        <h2>Instalação concluída ✅</h2>
        <p>Já podes fazer login em <strong>{dominio}</strong>.</p>
        <a href="/login">Ir para o login</a>
      </div>
    );
  }

  return (
    <form onSubmit={submeter} style={{ maxWidth: 480, margin: '48px auto', fontFamily: 'sans-serif', padding: 16 }}>
      <h1>🏠 Configuração inicial da Despensa</h1>

      <p>Domínio detetado automaticamente (podes ajustar se necessário):</p>
      <input value={dominio} onChange={(e) => setDominio(e.target.value)} style={{ width: '100%', marginBottom: 16, padding: 8 }} />

      <h3>Administrador</h3>
      <input placeholder="Nome" value={admin.nome} onChange={(e) => setAdmin({ ...admin, nome: e.target.value })} style={{ width: '100%', marginBottom: 8, padding: 8 }} required />
      <input placeholder="Email" type="email" value={admin.email} onChange={(e) => setAdmin({ ...admin, email: e.target.value })} style={{ width: '100%', marginBottom: 8, padding: 8 }} required />
      <input placeholder="Palavra-passe" type="password" value={admin.password} onChange={(e) => setAdmin({ ...admin, password: e.target.value })} style={{ width: '100%', marginBottom: 16, padding: 8 }} required />

      <h3>Adicionar membro (opcional — dá para fazer depois)</h3>
      <input placeholder="Nome" value={membro.nome} onChange={(e) => setMembro({ ...membro, nome: e.target.value })} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
      <input placeholder="Email" type="email" value={membro.email} onChange={(e) => setMembro({ ...membro, email: e.target.value })} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
      <input placeholder="Palavra-passe" type="password" value={membro.password} onChange={(e) => setMembro({ ...membro, password: e.target.value })} style={{ width: '100%', marginBottom: 16, padding: 8 }} />

      {erro && <p style={{ color: 'red' }}>{erro}</p>}
      <button type="submit" style={{ width: '100%', padding: 12 }}>Concluir instalação</button>
    </form>
  );
}
