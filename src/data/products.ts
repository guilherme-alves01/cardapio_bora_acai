import type { Product } from '../types';

/**
 * Lógica Automática:
 * O Vite permite importar todos os arquivos de uma pasta de uma vez usando import.meta.glob.
 * Isso significa que qualquer imagem que você colocar no 'assets' (exceto logotipo, hero, etc)
 * vai virar um produto automaticamente.
 */

const imageModules = import.meta.glob('../assets/*.{png,jpg,jpeg,webp,svg}', { 
  eager: true, 
  import: 'default' 
});

const ignoredFiles = ['logotipo.png', 'hero.png', 'react.svg', 'vite.svg'];

const generatedProducts: Product[] = Object.entries(imageModules)
  .filter(([path]) => {
    const fileName = path.split('/').pop() || '';
    return !ignoredFiles.includes(fileName) && !fileName.startsWith('WhatsApp');
  })
  .map(([path, url], index) => {
    const fileName = path.split('/').pop()?.split('.')[0] || '';
    
    // Transforma "polpa de abacaxi" em "Polpa de Abacaxi"
    const name = fileName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Define a categoria com base no nome do arquivo
    let category = 'Outros';
    if (fileName.toLowerCase().includes('polpa')) category = 'Polpas';
    if (fileName.toLowerCase().includes('licor')) category = 'Licores';
    if (fileName.toLowerCase().includes('biscoito') || fileName.toLowerCase().includes('especial')) category = 'Biscoitos';
    if (fileName.toLowerCase().includes('farinha') || fileName.toLowerCase().includes('tapioca')) category = 'Diversos';

    // Preço padrão (pode ser ajustado depois)
    let price = 4.50;
    if (category === 'Licores') price = 15.00;
    if (category === 'Biscoitos') price = 7.00;

    return {
      id: (index + 1).toString(),
      name,
      description: `${name} natural e de alta qualidade.`,
      price,
      image: url as string,
      category,
      featured: index < 4 // Os primeiros 4 ficam em destaque
    };
  });

export const products = generatedProducts;
