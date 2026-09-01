import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../api.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const nav = useNavigate();

  async function submeter(e) {
    e.preventDefault();
    try {
      const r = await apiPost('/auth/login', { email, password });
      localStorage.setItem('token', r.token);
      localStorage.setItem('user', JSON.stringify(r.user));
      nav('/');
    } catch {
      setErro('Credenciais inválidas');
    }
  }

  return (
    <form onSubmit={submeter} style={{ maxWidth: 360, margin: '80px auto', fontFamily: 'sans-serif', padding: 16 }}>
      <h1>🥫 Despensa</h1>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
      <input placeholder="Palavra-passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', marginBottom: 16, padding: 8 }} />
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
      <button type="submit" style={{ width: '100%', padding: 12 }}>Entrar</button>
    </form>
  );
}
