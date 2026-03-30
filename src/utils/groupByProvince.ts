import { Feria } from '../types/feria.types';
import { Provincia } from '../types/province.types';

export const groupByProvince = (ferias: Feria[]): Provincia[] => {
  const grouped = ferias.reduce((acc, feria) => {
    const prov = feria.provincia || 'Otras';
    if (!acc[prov]) {
      acc[prov] = [];
    }
    acc[prov].push(feria);
    return acc;
  }, {} as Record<string, Feria[]>);

  return Object.entries(grouped).map(([nombre, ferias]) => ({
    nombre,
    cantidadFerias: ferias.length,
    ferias
  }));
};
