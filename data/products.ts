import { Product } from '@/types';

export const dummyProducts: Product[] = [
  {
    id: '1',
    name: 'Addisyn Shoulder Bag',
    price: 76000,
    image: '/images/products/shoulder-bag.jpg',
    description: 'A beautiful crescent-shaped shoulder bag with premium leather and gold hardware. Perfect for everyday use.',
    store: {
      id: 'store-1',
      name: 'Noir Essentials',
      verified: true,
      address: '14B Charcoal Grove, Victoria Island, Lagos',
      description: 'Noir Essentials is the intersection of raw minimalism and high-end durability, made for those who find power in the shadows.',
    },
  },
  {
    id: '2',
    name: 'Birkenstock Clogs',
    price: 35000,
    image: '/images/products/birkenstock.jpg',
    description: 'Classic Birkenstock clogs in light beige suede with cork soles. Comfortable and stylish.',
    store: {
      id: 'store-1',
      name: 'Noir Essentials',
      verified: true,
      address: '14B Charcoal Grove, Victoria Island, Lagos',
      description: 'Noir Essentials is the intersection of raw minimalism and high-end durability, made for those who find power in the shadows.',
    },
  },
  {
    id: '3',
    name: 'Apple Bundle - MacBook',
    price: 1359000,
    image: '/images/products/macbook.jpg',
    description: 'Complete Apple MacBook bundle with all accessories included. Premium quality and performance.',
    store: {
      id: 'store-1',
      name: 'Noir Essentials',
      verified: true,
      address: '14B Charcoal Grove, Victoria Island, Lagos',
      description: 'Noir Essentials is the intersection of raw minimalism and high-end durability, made for those who find power in the shadows.',
    },
  },
  {
    id: '4',
    name: 'Marvel Women\'s X-Men T-Shirt',
    price: 12000,
    image: '/images/products/tshirt.jpg',
    description: 'Comfortable black t-shirt featuring X-Men design. Made from premium cotton.',
    store: {
      id: 'store-1',
      name: 'Noir Essentials',
      verified: true,
      address: '14B Charcoal Grove, Victoria Island, Lagos',
      description: 'Noir Essentials is the intersection of raw minimalism and high-end durability, made for those who find power in the shadows.',
    },
  },
];
