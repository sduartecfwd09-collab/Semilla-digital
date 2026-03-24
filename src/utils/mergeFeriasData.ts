import { Feria } from "../types/feria.types";

/**
 * Combina datos de Google Maps con datos locales de fallback.
 * Prioriza Google para nombres y direcciones, y fallback para horarios y días.
 */
export const mergeFeriasData = (googleData: Feria[], fallbackData: Feria[]): Feria[] => {
  const merged: Feria[] = [...googleData];

  // Buscamos completar datos faltantes (días, horario) de las de Google
  merged.forEach((item) => {
    const match = fallbackData.find((f) => 
      f.nombre.toLowerCase().includes(item.nombre.toLowerCase()) ||
      item.nombre.toLowerCase().includes(f.nombre.toLowerCase())
    );

    if (match) {
      if (item.dias === "No especificado" || !item.dias) {
        item.dias = match.dias;
        item.source = "merged";
      }
      if (item.horario === "No especificado" || !item.horario || item.horario === "Abierto ahora" || item.horario === "Cerrado") {
        item.horario = match.horario;
        item.source = "merged";
      }
    }
  });

  // Agregar ferias del fallback que no estén en Google (por si Google falló en encontrarlas)
  fallbackData.forEach((f) => {
    const isAlreadyIn = merged.some((m) => 
      m.nombre.toLowerCase().includes(f.nombre.toLowerCase()) ||
      f.nombre.toLowerCase().includes(m.nombre.toLowerCase())
    );

    if (!isAlreadyIn) {
      merged.push(f);
    }
  });

  return merged;
};
