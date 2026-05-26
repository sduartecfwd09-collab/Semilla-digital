// ============================================================
// productorService.ts
// Servicios del dominio productor — backend real, vía authFetch.
// Centraliza: ferias autorizadas, puesto del productor, lista
// completa de ferias (pública). No usar json-server ni mocks.
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

// Devuelve el puesto del productor indicado (relación 1:1 — usuario_id es UNIQUE).
// Retorna null si el usuario aún no tiene puesto registrado/aprobado.
export const getPuestoByUserId = async (userId: number | string): Promise<Record<string, unknown> | null> => {
  const res = await authFetch(`${ENDPOINTS.puestosProductor}/usuario/${userId}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Error ${res.status} al cargar puesto del productor`);
  }
  const json = await res.json();
  return json?.data ?? null;
};

// Lista completa de ferias desde el backend real.
// Usa fetch plano (sin authFetch) porque RegisterForm la invoca antes de que el
// usuario tenga sesión activa. GET /ferias es ruta pública — no requiere token.
export const getFerias = async (): Promise<FeriaAutorizada[]> => {
  const res = await fetch(ENDPOINTS.ferias);
  if (!res.ok) {
    throw new Error(`Error ${res.status} al cargar ferias`);
  }
  const json = await res.json();
  return (json?.data ?? []) as FeriaAutorizada[];
};
