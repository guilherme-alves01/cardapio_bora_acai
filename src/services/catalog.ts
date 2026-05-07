import type { Product } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { products as fallbackProducts } from '../data/products';

interface ProductRow {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  image_url: string | null;
  category: string;
  featured: boolean | null;
}

const mapProduct = (row: ProductRow): Product => ({
  id: row.id,
  name: row.name,
  description: row.description ?? '',
  price: Number(row.price),
  image: row.image_url ?? '',
  category: row.category,
  featured: Boolean(row.featured),
});

export const getCatalogProducts = async (): Promise<Product[]> => {
  if (!isSupabaseConfigured || !supabase) {
    return fallbackProducts;
  }

  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, price, image_url, category, featured')
    .eq('active', true)
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapProduct);
};
