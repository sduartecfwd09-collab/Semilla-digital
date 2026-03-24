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
    const data = await response.json();

<<<<<<< HEAD
    return data.map((item: { id: string | number; name: string; location: string; province: string; schedule: string }) => ({
=======
    return data.map((item: any) => ({
>>>>>>> 4325f1856665e17db6cd392cc18ba9518db22206
      id: String(item.id),
      nombre: item.name,
      direccion: item.location,
      provincia: item.province,
      dias: item.schedule.split(",")[0] || "No especificado",
      horario: item.schedule.split(",")[1]?.trim() || "No especificado",
      source: "fallback",
    }));
  } catch (error) {
    console.error("Fallback Service Error:", error);
    return [];
  }
};
