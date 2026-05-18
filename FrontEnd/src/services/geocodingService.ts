import { Feria } from "../types/feria.types";
import { ENDPOINTS, authFetch } from "./api.config";

/**
 * Servicio para geocodificar direcciones usando Nominatim (OpenStreetMap)
 * y manejar el almacenamiento en caché en la base de datos.
 */
export const geocodeFeria = async (feria: Feria): Promise<{ lat: number; lng: number } | null> => {
  // 1. Si ya tiene coordenadas, retornarlas
  if ((feria as any).lat && (feria as any).lng) {
    return { lat: Number((feria as any).lat), lng: Number((feria as any).lng) };
  }

  try {
    // 2. Intentar geocodificar con Nominatim
    const query = `${feria.nombre}, ${feria.direccion}, ${feria.provincia}, Costa Rica`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'es',
        'User-Agent': 'AgroMap-App' // Requerido por la política de Nominatim
      }
    });
    
    const data = await response.json();

    if (data && data.length > 0) {
      const coords = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };

      // 3. Guardar en caché en el backend (opcionalmente)
      // Solo si tenemos un ID real y no es de google mock
      if (feria.id && !String(feria.id).startsWith('google-')) {
        await authFetch(`${ENDPOINTS.ferias}/${feria.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            lat: coords.lat,
            lng: coords.lng
          })
        }).catch(err => console.error("Error al cachear coordenadas:", err));
      }

      return coords;
    }

    // 4. Fallback si no encuentra la feria específica, intentar solo con la dirección
    const fallbackQuery = `${feria.direccion}, ${feria.provincia}, Costa Rica`;
    const fallbackUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fallbackQuery)}&format=json&limit=1`;
    const fallbackRes = await fetch(fallbackUrl, {
        headers: { 'User-Agent': 'AgroMap-App' }
    });
    const fallbackData = await fallbackRes.json();

    if (fallbackData && fallbackData.length > 0) {
        return {
            lat: parseFloat(fallbackData[0].lat),
            lng: parseFloat(fallbackData[0].lon)
        };
    }

    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

/**
 * Mantiene la interfaz de búsqueda por provincia pero usando un mock o 
 * una lógica simplificada sin Google Maps.
 */
export const searchFeriasInOSM = async (provincia: string): Promise<Feria[]> => {
    // Como Nominatim no es bueno para "buscar todas las ferias en X", 
    // seguiremos confiando en nuestra base de datos local y el fallback.
    // Esta función queda como placeholder para cumplir con la interfaz.
    return [];
};
