import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, Loader2, LogOut, Save, Trash2, Upload } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import logoImg from '../assets/logotipo_bora_acai.png';

interface AdminProduct {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  image_url: string | null;
  category: string;
  featured: boolean;
  active: boolean;
  sort_order: number;
}

interface ProductForm {
  name: string;
  description: string;
  price: string;
  category: string;
  featured: boolean;
  active: boolean;
  sortOrder: string;
}

const emptyForm: ProductForm = {
  name: '',
  description: '',
  price: '',
  category: '',
  featured: false,
  active: true,
  sortOrder: '0',
};

const formatCurrency = (value: number | string) =>
  Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const normalizeFileName = (fileName: string) =>
  fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();

export function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const categories = useMemo(
    () => Array.from(new Set(products.map(product => product.category))).sort(),
    [products],
  );

  const loadProducts = useCallback(async () => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, price, image_url, category, featured, active, sort_order')
      .order('category', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      setMessage(`Erro ao carregar produtos: ${error.message}`);
      return;
    }

    setProducts(data ?? []);
  }, []);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
      if (data.session) {
        void loadProducts();
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) {
        void loadProducts();
      } else {
        setProducts([]);
      }
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, [loadProducts]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;

    setIsSaving(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setIsSaving(false);
    if (error) {
      setMessage(`Erro no login: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setProducts([]);
  };

  const uploadImage = async () => {
    if (!supabase || !imageFile) return '';

    const path = `${Date.now()}-${normalizeFileName(imageFile.name)}`;
    const { error } = await supabase.storage.from('product-images').upload(path, imageFile);

    if (error) {
      throw new Error(error.message);
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleCreateProduct = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;

    setIsSaving(true);
    setMessage('');

    try {
      const imageUrl = await uploadImage();
      const price = Number(form.price.replace(',', '.'));
      const sortOrder = Number(form.sortOrder || 0);

      if (!form.name || !form.category || Number.isNaN(price)) {
        throw new Error('Preencha nome, categoria e preço corretamente.');
      }

      const { error } = await supabase.from('products').insert({
        name: form.name.trim(),
        description: form.description.trim(),
        price,
        category: form.category.trim(),
        image_url: imageUrl,
        featured: form.featured,
        active: form.active,
        sort_order: Number.isNaN(sortOrder) ? 0 : sortOrder,
      });

      if (error) throw new Error(error.message);

      setForm(emptyForm);
      setImageFile(null);
      setMessage('Produto cadastrado.');
      await loadProducts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao cadastrar produto.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!supabase) return;
    const shouldDelete = window.confirm('Remover este produto do cardápio?');
    if (!shouldDelete) return;

    const { error } = await supabase.from('products').delete().eq('id', productId);

    if (error) {
      setMessage(`Erro ao remover produto: ${error.message}`);
      return;
    }

    setMessage('Produto removido.');
    await loadProducts();
  };

  if (!isSupabaseConfigured) {
    return (
      <main className="admin-page">
        <section className="admin-card admin-setup">
          <img src={logoImg} alt="Bora Açaí" className="admin-logo" />
          <h1>Supabase não configurado</h1>
          <p>Crie o projeto no Supabase, rode o SQL de `supabase/schema.sql` e preencha o `.env` com as chaves públicas.</p>
          <code>VITE_SUPABASE_URL</code>
          <code>VITE_SUPABASE_ANON_KEY</code>
          <a href="/" className="admin-link-button">Voltar ao cardápio</a>
        </section>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="admin-page admin-loading">
        <Loader2 className="spin" size={28} />
      </main>
    );
  }

  if (!session) {
    return (
      <main className="admin-page">
        <form className="admin-card admin-login" onSubmit={handleLogin}>
          <img src={logoImg} alt="Bora Açaí" className="admin-logo" />
          <h1>Bora Açaí</h1>
          <label>
            E-mail
            <input type="email" value={email} onChange={event => setEmail(event.target.value)} required />
          </label>
          <label>
            Senha
            <input type="password" value={password} onChange={event => setPassword(event.target.value)} required />
          </label>
          {message && <p className="admin-message">{message}</p>}
          <button className="admin-primary-btn" type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="spin" size={18} /> : <Link size={18} />}
            Entrar
          </button>
          <a href="/" className="admin-secondary-link">Voltar ao cardápio</a>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-title-group">
          <img src={logoImg} alt="Bora Açaí" className="admin-topbar-logo" />
          <div>
            <h1>Produtos e categorias</h1>
            <span>{session.user.email}</span>
          </div>
        </div>
        <div className="admin-actions">
          <a href="/" className="admin-secondary-link">Cardápio</a>
          <button className="admin-icon-btn" type="button" onClick={handleLogout} aria-label="Sair">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <section className="admin-grid">
        <form className="admin-panel" onSubmit={handleCreateProduct}>
          <h2>Novo produto</h2>

          <label>
            Nome
            <input value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} required />
          </label>

          <label>
            Categoria
            <input
              list="admin-categories"
              value={form.category}
              onChange={event => setForm({ ...form, category: event.target.value })}
              placeholder="Ex: Açaí, Cremes, Bebidas"
              required
            />
            <datalist id="admin-categories">
              {categories.map(category => <option key={category} value={category} />)}
            </datalist>
          </label>

          <label>
            Preço
            <input
              inputMode="decimal"
              value={form.price}
              onChange={event => setForm({ ...form, price: event.target.value })}
              placeholder="Ex: 18,90"
              required
            />
          </label>

          <label>
            Descrição
            <textarea value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} />
          </label>

          <label>
            Ordem
            <input
              inputMode="numeric"
              value={form.sortOrder}
              onChange={event => setForm({ ...form, sortOrder: event.target.value })}
            />
          </label>

          <label className="admin-file-field">
            Imagem
            <span>
              <Upload size={18} />
              {imageFile ? imageFile.name : 'Escolher imagem'}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={event => setImageFile(event.target.files?.[0] ?? null)}
            />
          </label>

          <div className="admin-checks">
            <label>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={event => setForm({ ...form, featured: event.target.checked })}
              />
              Destaque
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.active}
                onChange={event => setForm({ ...form, active: event.target.checked })}
              />
              Ativo
            </label>
          </div>

          {message && <p className="admin-message">{message}</p>}

          <button className="admin-primary-btn" type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="spin" size={18} /> : <Save size={18} />}
            Salvar produto
          </button>
        </form>

        <section className="admin-panel">
          <h2>Catálogo atual</h2>
          {products.length === 0 ? (
            <p className="admin-empty">Nenhum produto cadastrado.</p>
          ) : (
            <div className="admin-product-list">
              {products.map(product => (
                <article className={`admin-product-row ${!product.active ? 'inactive' : ''}`} key={product.id}>
                  <div className="admin-product-thumb">
                    {product.image_url ? <img src={product.image_url} alt={product.name} /> : <span />}
                  </div>
                  <div className="admin-product-info">
                    <strong>{product.name}</strong>
                    <span>{product.category} · {formatCurrency(product.price)}</span>
                    <small>{product.active ? 'Ativo' : 'Inativo'}{product.featured ? ' · Destaque' : ''}</small>
                  </div>
                  <button className="admin-danger-btn" type="button" onClick={() => handleDeleteProduct(product.id)} aria-label="Remover produto">
                    <Trash2 size={16} />
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
