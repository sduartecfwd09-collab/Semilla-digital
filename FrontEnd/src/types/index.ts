export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'Administrador' | 'Productor' | 'Usuario' | 'Repartidor';
  status: 'Activo' | 'Inactivo' | string;
  avatar?: string;
  feriaId?: string;
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

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image_url?: string | null;
  ingredients: string[];
  steps: string[];
  difficulty: string;
  time: string;
}

export interface PuestoProductor {
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
