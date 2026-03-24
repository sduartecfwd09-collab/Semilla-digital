import { Feria } from "../types/feria.types";
import { Provincia } from "../types/province.types";

const PROVINCIAS_COST_RICA = [
  "San José",
  "Alajuela",
  "Cartago",
  "Heredia",
  "Guanacaste",
  "Puntarenas",
  "Limón",
];

/**
 * Agrupa una lista de ferias por provincia costarricense.
 * Asegura que se retornen todas las provincias, incluso si no tienen datos.
 */
export const groupByProvince = (allFerias: Feria[]): Provincia[] => {
  return PROVINCIAS_COST_RICA.map((provincia) => {
    const feriasDeProvincia = allFerias.filter(
      (f) => f.provincia.toLowerCase().trim() === provincia.toLowerCase().trim()
    );

    // Deduplicar ferias por nombre dentro de la misma provincia
    const uniqueFerias: Feria[] = [];
    const seenNames = new Set();
    
    feriasDeProvincia.forEach(f => {
      const cleanName = f.nombre.toLowerCase().trim();
      if (!seenNames.has(cleanName)) {
        seenNames.add(cleanName);
        uniqueFerias.push(f);
      }
    });

    return {
      nombre: provincia,
      cantidadFerias: uniqueFerias.length,
      ferias: uniqueFerias,
    };
  });
};
