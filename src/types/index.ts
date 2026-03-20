export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Vendedor' | 'Administrador' | 'Comprador' | string;
  status: 'Activo' | 'Inactivo' | string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  image?: string;
}

export interface Fair {
  id: string;
  name: string;
  province: string;
  location: string;
  schedule: string;
}

export interface Price {
  id: string;
  productId: string | null;
  fair: string;
  price: number;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  difficulty: string;
  time: string;
}
