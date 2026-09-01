const BASE = '/api';

function getStoredToken() {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

function clearAuth() {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch {
    // Ignora falhas de storage em browsers restritivos.
  }
}

function authHeaders() {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseError(res) {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const payload = await res.json().catch(() => ({}));
    return payload.error || payload.message || 'Erro inesperado.';
  }

  return res.statusText || 'Erro inesperado.';
}

async function ensureOk(res, path) {
  if (res.ok) return;

  if (res.status === 401 || res.status === 403) {
    clearAuth();
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.assign('/login');
    }
  }

  throw new Error(await parseError(res, path));
}

export async function apiGet(path) {
  const res = await fetch(BASE + path, { headers: authHeaders() });
  await ensureOk(res, path);
  return res.json().catch(() => ({}));
}

export async function apiPost(path, body) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body)
  });
  await ensureOk(res, path);
  return res.json().catch(() => ({}));
}
