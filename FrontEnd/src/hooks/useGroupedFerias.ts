import { useMemo } from "react";
import { useFerias } from "./useFerias";
import { groupByProvince } from "../utils/groupByProvince";
import { Provincia } from "../types/province.types";

/**
 * Hook que utiliza useFerias para obtener la lista plana y luego
 * agruparla por provincia costarricense.
 */
export const useGroupedFerias = () => {
  const { allFerias, loading, error } = useFerias();

  // El agrupamiento se memoiza para evitar cálculos excesivos al renderizar.
  const groupedFeriasByProvince: Provincia[] = useMemo(() => {
    return groupByProvince(allFerias);
  }, [allFerias]);

  return { groupedFeriasByProvince, loading, error };
};
