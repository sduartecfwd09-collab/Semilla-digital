// ============================================================
// productorService.ts
// Servicios específicos del productor autenticado (backend real,
// vía authFetch — NO json-server). Mantener separado de
// ProductorServices.jsx, que apunta a la mock-API legacy.
// ============================================================
import { authFetch, ENDPOINTS } from './api.config';
import { Feria } from '../types/feria.types';

// Shape "raw" que devuelve el backend: la Feria incluye su Direccion con
// Provincia anidada. Se preserva tal cual para que los consumidores actuales
// (AdminProductForm) puedan seguir leyendo `direccion.provincia.nombre`.
export type FeriaAutorizada = Feria & {
  direccion?: {
    provincia?: { nombre?: string };
    canton?: { nombre?: string };
    distrito?: { nombre?: string };
  } | string;
};

// Devuelve solo las ferias donde el productor logueado tiene puesto autorizado.
// - Si el usuario no es productor o aún no fue aprobado: []
// - El llamador debe asumir lista vacía como estado válido ("aún no tenés ferias asignadas").
export const getMisFerias = async (): Promise<FeriaAutorizada[]> => {
  const res = await authFetch(ENDPOINTS.productorMisFerias);
  if (!res.ok) {
    throw new Error(`Error ${res.status} al cargar ferias autorizadas`);
  }
  const json = await res.json();
  return (json?.data ?? []) as FeriaAutorizada[];
};
