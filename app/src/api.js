const BASE = '/api';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiGet(path) {
  const res = await fetch(BASE + path, { headers: authHeaders() });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Erro');
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Erro');
  return res.json();
}
