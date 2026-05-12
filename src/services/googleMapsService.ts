import { Feria } from "../types/feria.types";

const GOOGLE_MAPS_API_KEY = "TU_API_KEY_AQUI"; // El usuario deberá poner su API Key aquí
const BASE_URL = "https://maps.googleapis.com/maps/api";

const IS_MOCKING = GOOGLE_MAPS_API_KEY === "TU_API_KEY_AQUI";

/**
 * Servicio para consultar ferias desde Google Maps Platform.
 */
export const searchFeriasInGoogle = async (provincia: string): Promise<Feria[]> => {
  if (IS_MOCKING) {
    // Simulación de respuesta de Google Maps si no hay API Key activa
    await new Promise((resolve) => setTimeout(resolve, 800));
    return [
      {
        id: `google-${provincia}-1`,
        nombre: `Feria de ${provincia} centro`,
        direccion: `Distrito Central, ${provincia}`,
        provincia: provincia,
        dias: "Sábados", // Esto suele faltar en Google Maps, por eso es importante el fallback
        horario: "05:00 - 13:00",
        source: "google",
      },
    ];
  }

  try {
    const textSearchUrl = `${BASE_URL}/place/textsearch/json?query=feria del agricultor en ${provincia}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(textSearchUrl);
    const data = await response.json();

    if (data.status !== "OK") {
      throw new Error(`Google Places API error: ${data.status}`);
    }

    const ferias: Feria[] = await Promise.all(
      (data.results || []).map(async (result: { place_id: string; name: string; formatted_address?: string; vicinity?: string; opening_hours?: { open_now?: boolean } }) => {
        // Obtenemos dirección formateada y provincia mediante Geocoding
        const geocodeUrl = `${BASE_URL}/geocode/json?place_id=${result.place_id}&key=${GOOGLE_MAPS_API_KEY}`;
        const geoResponse = await fetch(geocodeUrl);
        const geoData = await geoResponse.json();

        // Extraer provincia de geodata si es posible
        let provinciaDetectada = provincia;
        if (geoData.status === "OK") {
          const addressComponents = geoData.results[0]?.address_components || [];
          const provinceComp = addressComponents.find((comp: { types: string[]; long_name: string }) =>
            comp.types.includes("administrative_area_level_1")
          );
          if (provinceComp) {
            provinciaDetectada = provinceComp.long_name;
          }
        }

        return {
          id: result.place_id,
          nombre: result.name,
          direccion: result.formatted_address || result.vicinity || "",
          provincia: provinciaDetectada,
          dias: "No especificado", // Google Places suele no tener estos datos específicos
          horario: result.opening_hours?.open_now ? "Abierto ahora" : "Cerrado",
          source: "google" as const,
        };
      })
    );

    return ferias;
  } catch (error) {
    console.error("Google Maps Service Error:", error);
    return [];
  }
};
