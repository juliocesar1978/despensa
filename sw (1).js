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
    apiGet('/setup/status').then((r) => setNeedsSetup(r.needsSetup)).catch(() => setNeedsSetup(false));
  }, []);

  if (needsSetup === null) return <p style={{ padding: 24, fontFamily: 'sans-serif' }}>A carregar…</p>;
  if (needsSetup) return <Setup />;

  const isLogged = !!localStorage.getItem('token');

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={isLogged ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/adicionar" element={isLogged ? <AddProduct /> : <Navigate to="/login" />} />
      <Route path="/compras" element={isLogged ? <ShoppingList /> : <Navigate to="/login" />} />
    </Routes>
  );
}
