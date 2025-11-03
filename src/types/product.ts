export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  description: string;
  category: string;
  gender: 'men' | 'women' | 'unisex';
  type: 'analog' | 'digital' | 'sport' | 'luxury' | 'dress' | 'dive';
  caseMaterial: string;
  dialColor: string;
  waterResistance: string;
  movement: string;
  inStock: boolean;
  // Extended specifications
  glassType?: string;
  diameter?: string;
  illumination?: string;
  dialType?: string;
  caseColor?: string;
  dateIndication?: boolean;
  dayIndication?: boolean;
  watchStyle?: string;
  indicationType?: string;
  caseShape?: string;
  strapMaterial?: string;
  strapColor?: string;
  modelCode?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Filters {
  brands: string[];
  priceRange: [number, number];
  gender: string[];
  type: string[];
  caseMaterial: string[];
  dialColor: string[];
}
