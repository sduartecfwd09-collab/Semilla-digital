export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Vendedor' | 'Administrador' | 'Comprador' | string;
  status: 'Activo' | 'Inactivo' | string;
}

export interface Product {
  id: string;
  nombre: string;
  categoria: string;
  emoji?: string;
  descripcion?: string;
  disponible?: boolean;
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
  steps: string[];
  difficulty: string;
  time: string;
}

export interface PuestoAgricultor {
  id: string;
  usuarioId: string;
  nombrePuesto: string;
  descripcion: string;
  ubicacion: string;
  telefono: string;
  email: string;
  horarios: string;
  tiposProducto: string[];
  fechaRegistro: string;
}
