import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { apiGet } from './api.js';
import Setup from './pages/Setup.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AddProduct from './pages/AddProduct.jsx';
import ShoppingList from './pages/ShoppingList.jsx';

export default function App() {
  const [needsSetup, setNeedsSetup] = useState(null);

  useEffect(() => {
    let cancelled = false;

    apiGet('/setup/status')
      .then((r) => {
        if (!cancelled) setNeedsSetup(Boolean(r.needsSetup));
      })
      .catch(() => {
        if (!cancelled) setNeedsSetup(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (needsSetup === null) return <p style={{ padding: 24, fontFamily: 'sans-serif' }}>A carregar…</p>;
  if (needsSetup) return <Setup />;

  let isLogged = false;
  try {
    isLogged = !!localStorage.getItem('token');
  } catch {
    isLogged = false;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={isLogged ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/adicionar" element={isLogged ? <AddProduct /> : <Navigate to="/login" />} />
      <Route path="/compras" element={isLogged ? <ShoppingList /> : <Navigate to="/login" />} />
    </Routes>
  );
}
