import React from 'react';
import { products } from '../data/products';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onSelectCategory }) => {
  // Extrai categorias únicas dos produtos
  const categories = ['Todos', ...new Set(products.map(p => p.category))];

  return (
    <div className="category-list" style={{ 
      display: 'flex', 
      gap: '12px', 
      overflowX: 'auto', 
      padding: '8px 0',
      marginBottom: '16px',
      scrollbarWidth: 'none' 
    }}>
      {categories.map(category => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
          style={{
            whiteSpace: 'nowrap',
            padding: '8px 20px',
            borderRadius: '20px',
            border: '1px solid var(--border)',
            backgroundColor: selectedCategory === category ? 'var(--primary)' : 'white',
            color: selectedCategory === category ? 'white' : 'var(--text-main)',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
        >
          {category}
        </button>
      ))}
    </div>
  );
};
