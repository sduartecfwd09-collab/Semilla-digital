import { useState, useEffect } from "react";
import { Feria } from "../types/feria.types";
import { searchFeriasInGoogle } from "../services/googleMapsService";
import { fetchFeriasFallback } from "../services/feriasFallbackService";
import { ENDPOINTS, authFetch } from "../services/api.config";

const PROVINCIAS_COSTA_RICA = [
  "San José",
  "Alajuela",
  "Cartago",
  "Heredia",
  "Guanacaste",
  "Puntarenas",
  "Limón",
];

const mergeFeriasData = (google: any[], fallback: any[]): Feria[] => {
  const combined = [...google, ...fallback];
  return combined.map((f, index) => {
    // Extraer provincia de diversas estructuras posibles (API Google vs API Backend)
    const rawProv = f.provincia?.nombre || f.direccion?.provincia?.nombre || f.provincia || f.province || "Otras";
    let provinciaNombre = rawProv;
    if (!rawProv || rawProv === 'Otras') {
      const nombreFeria = f.nombre || f.name || '';
      const match = PROVINCIAS_COSTA_RICA.find(p => nombreFeria.toLowerCase().includes(p.toLowerCase()));
      if (match) provinciaNombre = match;
    }
    const direccionTexto = f.direccion?.distrito?.nombre 
      ? `${f.direccion.distrito.nombre}, ${f.direccion.canton?.nombre || ''}`
      : (f.direccion || f.location || "Ubicación no especificada");

    return {
      id: f.id || `f-${index}`,
      nombre: f.nombre || f.name || "Feria sin nombre",
      direccion: direccionTexto,
      provincia: provinciaNombre,
      dias: f.dias || (f.schedule && f.schedule.split(',')[0]) || "Sábados",
      horario: f.horario || (f.schedule && f.schedule.split(',')[1]) || "05:00 - 13:00",
      source: f.source || "merged"
    };
  });
};

/**
 * Hook para obtener y combinar todas las ferias del productor de Google Maps y el fallback.
 * Orquesta la búsqueda por provincia.
 */
export const useFerias = () => {
  const [allFerias, setAllFerias] = useState<Feria[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch de fallback inicial
        const fallbackResults = await fetchFeriasFallback();
        if (cancelled) return;

        // Fetch de Google por cada provincia
        const googleFetchResultsPromises = PROVINCIAS_COSTA_RICA.map((p) =>
          searchFeriasInGoogle(p)
        );
        const googleFetchResults = await Promise.all(googleFetchResultsPromises);
        if (cancelled) return;
        const googleDataFlat = googleFetchResults.flat();

        // Mezclar y enriquecer datos
        const mergedData = mergeFeriasData(googleDataFlat, fallbackResults);

        // Deduplicar por nombre para evitar que duplicados en db.json afecten el reporte
        const uniqueMergedData: Feria[] = [];
        const seenNames = new Set();
        mergedData.forEach(f => {
          const cleanName = f.nombre.toLowerCase().trim();
          if (!seenNames.has(cleanName)) {
            seenNames.add(cleanName);
            uniqueMergedData.push(f);
          }
        });

        if (cancelled) return;
        setAllFerias(uniqueMergedData);

        // Sincronización: registramos en el backend cualquier feria de Google
        // que no esté ya en el fallback. El endpoint POST /ferias es idempotente
        // (findOrCreate por nombre) así que repetir la llamada no duplica, y
        // cada feria se intenta de forma independiente (no rompemos el lote
        // si una falla).
        const newFerias = uniqueMergedData.filter(m =>
          m.source === "google" &&
          !fallbackResults.some(f =>
            f.nombre.toLowerCase().trim() === m.nombre.toLowerCase().trim()
          )
        );

        if (newFerias.length > 0) {
          // Fire-and-forget: no bloquea la UI
          (async () => {
            await Promise.allSettled(newFerias.map(feria =>
              authFetch(ENDPOINTS.ferias, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  nombre: feria.nombre,
                  provincia: feria.provincia,
                  direccion: feria.direccion,
                  dias: feria.dias,
                  horario: feria.horario,
                  source: 'google'
                }),
              })
            ));
          })();
        }
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setError("Error al cargar las ferias del productor");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, []);

  return { allFerias, loading, error };
};
