import { useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { apiGet, apiPost } from '../api.js';

export default function AddProduct() {
  const videoRef = useRef(null);
  const [ean, setEan] = useState('');
  const [sugestao, setSugestao] = useState(null);
  const [form, setForm] = useState({ nome: '', quantidade: 1, validade: '', localizacao: '', unidade: 'un', stock_minimo: 1 });
  const [aScanear, setAScanear] = useState(false);
  const [msg, setMsg] = useState('');

  async function iniciarScan() {
    setAScanear(true);
    const reader = new BrowserMultiFormatReader();
    try {
      const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
        if (result) {
          const codigo = result.getText();
          setEan(codigo);
          controls.stop();
          setAScanear(false);
          consultarEan(codigo);
        }
      });
    } catch {
      setMsg('Não foi possível aceder à câmara (confirma que estás em HTTPS e que deste permissão).');
      setAScanear(false);
    }
  }

  async function consultarEan(codigo) {
    const r = await apiGet(`/products/lookup/${codigo}`);
    if (r.existe) {
      setForm((f) => ({ ...f, nome: r.product.nome, unidade: r.product.unidade, stock_minimo: r.product.stock_minimo }));
      setSugestao({ productId: r.product.id });
    } else if (r.encontrado) {
      setForm((f) => ({ ...f, nome: r.sugestao.nome }));
      setSugestao({ novo: true, imagem_url: r.sugestao.imagem_url });
    } else {
      setMsg('Código não encontrado na Open Food Facts — preenche o nome manualmente.');
    }
  }

  async function guardar(e) {
    e.preventDefault();
    let productId = sugestao?.productId;
    if (!productId) {
      const novo = await apiPost('/products', {
        nome: form.nome,
        ean: ean || null,
        unidade: form.unidade,
        stock_minimo: form.stock_minimo,
        imagem_url: sugestao?.imagem_url || null
      });
      productId = novo.id;
    }
    await apiPost('/stock/entrada', {
      product_id: productId,
      quantidade: Number(form.quantidade),
      validade: form.validade || null,
      localizacao: form.localizacao
    });
    window.location.href = '/';
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 16, fontFamily: 'sans-serif' }}>
      <h1>➕ Adicionar produto</h1>

      {!aScanear && <button onClick={iniciarScan}>📷 Ler código de barras</button>}
      {aScanear && <video ref={videoRef} style={{ width: '100%', marginTop: 8 }} />}
      {msg && <p>{msg}</p>}

      <form onSubmit={guardar} style={{ marginTop: 16 }}>
        <input placeholder="Nome do produto" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} style={{ width: '100%', marginBottom: 8, padding: 8 }} required />
        <input type="number" placeholder="Quantidade" value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: e.target.value })} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
        <input type="date" value={form.validade} onChange={(e) => setForm({ ...form, validade: e.target.value })} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
        <input placeholder="Localização (ex. Despensa, Frigorífico)" value={form.localizacao} onChange={(e) => setForm({ ...form, localizacao: e.target.value })} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
        <input type="number" placeholder="Stock mínimo (alerta)" value={form.stock_minimo} onChange={(e) => setForm({ ...form, stock_minimo: e.target.value })} style={{ width: '100%', marginBottom: 16, padding: 8 }} />
        <button type="submit" style={{ width: '100%', padding: 12 }}>Guardar</button>
      </form>
    </div>
  );
}
