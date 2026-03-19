import { Feria } from './feria.types';

export interface Provincia {
  nombre: string;
  cantidadFerias: number;
  ferias: Feria[];
}
