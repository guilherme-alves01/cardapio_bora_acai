import type { Product } from '../types';

// Importações das Imagens
import imgAbacaxi from '../assets/polpa de abacaxi.jpeg';
import imgAcerola from '../assets/polpa de acerola.jpeg';
import imgCaja from '../assets/polpa de cajá.jpeg';
import imgCupuacu from '../assets/polpa de cupuaçu.jpeg';
import imgGoiaba from '../assets/polpa de goiaba.jpeg';
import imgGraviola from '../assets/polpa de graviola.jpeg';
import imgJenipapo from '../assets/polpa de jenipapo.jpeg';
import imgManga from '../assets/polpa de manga.jpeg';
import imgMaracujaSemCaroco from '../assets/polpa de maracujá sem caroço.jpeg';
import imgMaracuja from '../assets/polpa de maracujá.jpeg';
import imgTamarindo from '../assets/polpa de tamarindo.jpeg';

export const products: Product[] = [
  {
    id: '1',
    name: 'Polpa de Abacaxi',
    description: 'Polpa natural de fruta selecionada. Pacote 300g.',
    price: 5.00,
    image: imgAbacaxi,
    category: 'Polpas'
  },
  {
    id: '2',
    name: 'Polpa de Acerola',
    description: 'Polpa natural de fruta selecionada. Pacote 300g.',
    price: 5.00,
    image: imgAcerola,
    category: 'Polpas'
  },
  {
    id: '3',
    name: 'Polpa de Cajá',
    description: 'Polpa natural de fruta selecionada. Pacote 300g.',
    price: 5.00,
    image: imgCaja,
    category: 'Polpas'
  },
  {
    id: '4',
    name: 'Polpa de Cupuaçu',
    description: 'Polpa natural de fruta selecionada. Pacote 300g.',
    price: 7.00,
    image: imgCupuacu,
    category: 'Polpas'
  },
  {
    id: '5',
    name: 'Polpa de Goiaba',
    description: 'Polpa natural de fruta selecionada. Pacote 300g.',
    price: 5.00,
    image: imgGoiaba,
    category: 'Polpas'
  },
  {
    id: '6',
    name: 'Polpa de Graviola',
    description: 'Polpa natural de fruta selecionada. Pacote 300g.',
    price: 7.00,
    image: imgGraviola,
    category: 'Polpas'
  },
  {
    id: '7',
    name: 'Polpa de Jenipapo',
    description: 'Polpa natural de fruta selecionada. Pacote 300g.',
    price: 7.00,
    image: imgJenipapo,
    category: 'Polpas'
  },
  {
    id: '8',
    name: 'Polpa de Manga',
    description: 'Polpa natural de fruta selecionada. Pacote 300g.',
    price: 4.00,
    image: imgManga,
    category: 'Polpas'
  },
  {
    id: '9',
    name: 'Polpa de Maracujá Sem Caroço',
    description: 'Polpa natural de fruta selecionada. Pacote 300g.',
    price: 9.00,
    image: imgMaracujaSemCaroco,
    category: 'Polpas'
  },
  {
    id: '10',
    name: 'Polpa de Maracujá',
    description: 'Polpa natural de fruta selecionada. Pacote 300g.',
    price: 8.00,
    image: imgMaracuja,
    category: 'Polpas'
  },
  {
    id: '11',
    name: 'Polpa de Tamarindo',
    description: 'Polpa natural de fruta selecionada. Pacote 300g.',
    price: 7.00,
    image: imgTamarindo,
    category: 'Polpas'
  }
];
