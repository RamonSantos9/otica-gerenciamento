import { v4 as uuidv4 } from 'uuid';
import { Product } from './types';

// Mock data for products
const mockProducts: Product[] = [
  {
    id: uuidv4(),
    name: 'Armação Ray-Ban RB3025',
    category: 'armacoes',
    brand: 'Ray-Ban',
    price: 599.99,
    stock: 15,
    threshold: 5,
    lastRestock: '2023-01-15T10:30:00Z'
  },
  {
    id: uuidv4(),
    name: 'Lente Multifocal Transitions',
    category: 'lentes',
    brand: 'Transitions',
    price: 850.00,
    stock: 8,
    threshold: 3,
    lastRestock: '2023-02-10T14:45:00Z'
  },
  {
    id: uuidv4(),
    name: 'Óculos de Sol Oakley Holbrook',
    category: 'oculos_de_sol',
    brand: 'Oakley',
    price: 750.00,
    stock: 10,
    threshold: 4,
    lastRestock: '2023-01-20T09:15:00Z'
  },
  {
    id: uuidv4(),
    name: 'Estojo de Óculos Premium',
    category: 'acessorios',
    brand: 'Generic',
    price: 45.00,
    stock: 25,
    threshold: 10,
    lastRestock: '2023-02-05T11:00:00Z'
  },
  {
    id: uuidv4(),
    name: 'Spray de Limpeza para Lentes',
    category: 'produtos_limpeza',
    brand: 'CleanVision',
    price: 28.50,
    stock: 30,
    threshold: 10,
    lastRestock: '2023-02-15T16:30:00Z'
  },
  {
    id: uuidv4(),
    name: 'Armação Infantil Flexível',
    category: 'armacoes',
    brand: 'KidsVision',
    price: 350.00,
    stock: 12,
    threshold: 5,
    lastRestock: '2023-01-25T13:20:00Z'
  },
  {
    id: uuidv4(),
    name: 'Lentes de Contato Coloridas',
    category: 'lentes',
    brand: 'ColorEyes',
    price: 120.00,
    stock: 20,
    threshold: 8,
    lastRestock: '2023-02-20T10:15:00Z'
  },
  {
    id: uuidv4(),
    name: 'Óculos de Sol Polarizado Premium',
    category: 'oculos_de_sol',
    brand: 'PolarView',
    price: 480.00,
    stock: 7,
    threshold: 3,
    lastRestock: '2023-02-12T15:45:00Z'
  },
  {
    id: uuidv4(),
    name: 'Flanela de Microfibra para Limpeza',
    category: 'produtos_limpeza',
    brand: 'CleanVision',
    price: 12.00,
    stock: 40,
    threshold: 15,
    lastRestock: '2023-02-18T09:30:00Z'
  },
  {
    id: uuidv4(),
    name: 'Cordão para Óculos',
    category: 'acessorios',
    brand: 'EyeStyle',
    price: 25.00,
    stock: 35,
    threshold: 10,
    lastRestock: '2023-02-08T14:00:00Z'
  }
];

// Get all products
export const getProducts = async (): Promise<Product[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...mockProducts];
};

// Get a product by ID
export const getProductById = async (id: string): Promise<Product | undefined> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockProducts.find(product => product.id === id);
};

// Add a new product
export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newProduct: Product = {
    id: uuidv4(),
    ...product
  };
  
  mockProducts.push(newProduct);
  return newProduct;
};

// Update an existing product
export const updateProduct = async (updatedProduct: Product): Promise<Product> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const productIndex = mockProducts.findIndex(p => p.id === updatedProduct.id);
  
  if (productIndex === -1) {
    throw new Error('Product not found');
  }
  
  mockProducts[productIndex] = {
    ...mockProducts[productIndex],
    ...updatedProduct
  };
  
  return mockProducts[productIndex];
};

// Get products with stock below threshold
export const getLowStockProducts = async (): Promise<Product[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Filter products that have stock lower than or equal to threshold
  return mockProducts.filter(product => product.stock <= product.threshold);
};
