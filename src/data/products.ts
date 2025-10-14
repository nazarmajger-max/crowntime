import { Product } from '@/types/product';
import watch1 from '@/assets/watch-1.jpg';
import watch2 from '@/assets/watch-2.jpg';
import watch3 from '@/assets/watch-3.jpg';
import watch4 from '@/assets/watch-4.jpg';
import watch5 from '@/assets/watch-5.jpg';
import watch6 from '@/assets/watch-6.jpg';

export const products: Product[] = [
  {
    id: '1',
    name: 'Classic Chronograph',
    brand: 'Daikany',
    price: 2499,
    image: watch1,
    description: 'Elegant chronograph watch with blue dial and leather strap. Features precision Swiss movement and water resistance up to 50m.',
    category: 'Chronograph',
    gender: 'men',
    type: 'luxury',
    caseMaterial: 'Stainless Steel',
    dialColor: 'Blue',
    waterResistance: '50m',
    movement: 'Automatic',
    inStock: true,
  },
  {
    id: '2',
    name: 'Sport Master',
    brand: 'Kamronna',
    price: 3299,
    image: watch2,
    description: 'Professional sports watch with stainless steel bracelet and luminous markers. Perfect for active lifestyles.',
    category: 'Sport',
    gender: 'men',
    type: 'sport',
    caseMaterial: 'Stainless Steel',
    dialColor: 'Black',
    waterResistance: '100m',
    movement: 'Automatic',
    inStock: true,
  },
  {
    id: '3',
    name: 'Elegance Gold',
    brand: 'Classic Time',
    price: 1899,
    image: watch3,
    description: 'Minimalist dress watch with gold case and brown leather strap. Timeless design for formal occasions.',
    category: 'Dress',
    gender: 'unisex',
    type: 'dress',
    caseMaterial: 'Gold Plated',
    dialColor: 'White',
    waterResistance: '30m',
    movement: 'Quartz',
    inStock: true,
  },
  {
    id: '4',
    name: 'Deep Sea Diver',
    brand: 'Neowx',
    price: 4599,
    image: watch4,
    description: 'Professional diving watch with rotating bezel and rubber strap. Water resistant to 300m with luminous hands.',
    category: 'Dive',
    gender: 'men',
    type: 'dive',
    caseMaterial: 'Stainless Steel',
    dialColor: 'Blue',
    waterResistance: '300m',
    movement: 'Automatic',
    inStock: true,
  },
  {
    id: '5',
    name: 'Skeleton Masterpiece',
    brand: 'Nibex',
    price: 5999,
    image: watch5,
    description: 'Mechanical automatic watch with visible movement and exhibition case back. A true horological masterpiece.',
    category: 'Luxury',
    gender: 'men',
    type: 'luxury',
    caseMaterial: 'Stainless Steel',
    dialColor: 'Black',
    waterResistance: '50m',
    movement: 'Automatic Skeleton',
    inStock: true,
  },
  {
    id: '6',
    name: 'Rose Élégance',
    brand: 'Oisiv',
    price: 2799,
    image: watch6,
    description: "Women's luxury watch with rose gold bracelet and mother of pearl dial. Adorned with diamonds for ultimate elegance.",
    category: 'Luxury',
    gender: 'women',
    type: 'luxury',
    caseMaterial: 'Rose Gold',
    dialColor: 'Pearl',
    waterResistance: '30m',
    movement: 'Quartz',
    inStock: true,
  },
];

export const brands = [...new Set(products.map(p => p.brand))];
export const genders = ['men', 'women', 'unisex'];
export const types = ['analog', 'digital', 'sport', 'luxury', 'dress', 'dive'];
export const caseMaterials = [...new Set(products.map(p => p.caseMaterial))];
export const dialColors = [...new Set(products.map(p => p.dialColor))];
