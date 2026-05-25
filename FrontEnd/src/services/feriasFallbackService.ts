import { Feria } from "../types/feria.types";
import { ENDPOINTS } from "./api.config";

/**
 * Servicio de fallback que consume datos locales desde db.json.
 * Proporciona información sobre horarios y días de feria si Google Maps no los tiene.
 */
export const fetchFeriasFallback = async (): Promise<Feria[]> => {
  try {
    const response = await fetch(ENDPOINTS.ferias);
    if (!response.ok) throw new Error("Error fetching fallback ferias");
    const json = await response.json();
    const data = json.success ? json.data : json;

    return (data || []).map((item: any) => {
      const rawProv = item.direccion?.provincia?.nombre || item.provincia || item.province || "Otras";
      let provincia = rawProv;
      if (!rawProv || rawProv === 'Otras') {
        const nombreFeria = item.nombre || item.name || '';
        const PROVINCIAS_CR = ["San José", "Alajuela", "Cartago", "Heredia", "Guanacaste", "Puntarenas", "Limón"];
        const match = PROVINCIAS_CR.find(p => nombreFeria.toLowerCase().includes(p.toLowerCase()));
        if (match) provincia = match;
      }
      return {
        id: String(item.id),
        nombre: item.nombre || item.name || "Feria sin nombre",
        direccion: item.direccion?.distrito?.nombre || item.direccion || item.location || "Ubicación no especificada",
        provincia,
        dias: item.dias || (item.schedule && item.schedule.split(',')[0]) || "No especificado",
        horario: item.horario || (item.schedule && item.schedule.split(',')[1]?.trim()) || "No especificado",
        source: "fallback",
      };
    });
  } catch (error) {
    console.error("Fallback Service Error:", error);
    return [];
  }
};
