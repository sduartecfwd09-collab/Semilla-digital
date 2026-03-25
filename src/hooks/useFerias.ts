import { useState, useEffect } from "react";
import { Feria } from "../types/feria.types";
import { searchFeriasInGoogle } from "../services/googleMapsService";
import { fetchFeriasFallback } from "../services/feriasFallbackService";
import { ENDPOINTS } from "../services/api.config";

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
  return combined.map((f, index) => ({
    id: f.id || `f-${index}`,
    nombre: f.nombre || f.name || "Feria sin nombre",
    direccion: f.direccion || f.location || "Ubicación no especificada",
    provincia: f.provincia || f.province || "Otras",
    dias: f.dias || (f.schedule && f.schedule.split(',')[0]) || "Sábados",
    horario: f.horario || (f.schedule && f.schedule.split(',')[1]) || "Mañana",
    source: f.source || "merged"
  }));
};

/**
 * Hook para obtener y combinar todas las ferias del agricultor de Google Maps y el fallback.
 * Orquesta la búsqueda por provincia.
 */
export const useFerias = () => {
  const [allFerias, setAllFerias] = useState<Feria[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch de fallback inicial
        const fallbackResults = await fetchFeriasFallback();

        // Fetch de Google por cada provincia
        const googleFetchResultsPromises = PROVINCIAS_COSTA_RICA.map((p) =>
          searchFeriasInGoogle(p)
        );
        const googleFetchResults = await Promise.all(googleFetchResultsPromises);
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

        setAllFerias(uniqueMergedData);

        // Sincronización: Registrar nuevas ferias en db.json
        // Solo si el nombre no existe EXACTAMENTE (para evitar duplicados infinitos)
        const newFerias = uniqueMergedData.filter(m => 
          m.source === "google" &&
          !fallbackResults.some(f => 
            f.nombre.toLowerCase().trim() === m.nombre.toLowerCase().trim()
          )
        );

        const syncNewFerias = async () => {
          for (const feria of newFerias) {
            try {
              await fetch(ENDPOINTS.ferias, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: feria.nombre,
                  province: feria.provincia,
                  location: feria.direccion,
                  schedule: `${feria.dias || 'Sábados'}, ${feria.horario || '05:00 - 13:00'}`,
                }),
              });
              console.log(`Feria sincronizada: ${feria.nombre}`);
            } catch (syncErr) {
              console.error("Error al sincronizar feria:", syncErr);
            }
          }
        };

        if (newFerias.length > 0) {
          syncNewFerias();
        }
      } catch (err) {
        console.error(err);
        setError("Error al cargar las ferias del agricultor");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { allFerias, loading, error };
};
