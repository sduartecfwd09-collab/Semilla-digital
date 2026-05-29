import { Feria } from '../types/feria.types';

const DIAS_MAP: Record<string, number> = {
  domingo: 0, domingos: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6, sabados: 6,
};

const normalize = (s: string): string =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const dayToIndex = (day: string): number | null => {
  const idx = DIAS_MAP[normalize(day)];
  return idx === undefined ? null : idx;
};

export const parseDias = (diasStr: string): number[] => {
  if (!diasStr) return [];
  const normalized = normalize(diasStr);

  if (normalized.includes(' a ')) {
    const [start, end] = normalized.split(' a ').map(s => s.trim());
    const startIdx = dayToIndex(start);
    const endIdx = dayToIndex(end);
    if (startIdx === null || endIdx === null) return [];

    const result: number[] = [];
    let i = startIdx;
    while (true) {
      result.push(i);
      if (i === endIdx) break;
      i = (i + 1) % 7;
      if (result.length > 7) return [];
    }
    return result;
  }

  if (normalized.includes(' y ')) {
    const parts = normalized.split(' y ').map(s => s.trim());
    const indices = parts.map(dayToIndex);
    if (indices.some(x => x === null)) return [];
    return indices as number[];
  }

  const single = dayToIndex(normalized);
  return single !== null ? [single] : [];
};

export const parseHorario = (horarioStr: string): { apertura: number; cierre: number } | null => {
  if (!horarioStr) return null;

  const timePattern = /(\d{1,2}):(\d{2})\s*(AM|PM)?/gi;
  const matches = [...horarioStr.matchAll(timePattern)];

  if (matches.length !== 2) return null;

  const toMinutes = (match: RegExpMatchArray): number => {
    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const period = match[3]?.toUpperCase();

    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    return hour * 60 + minute;
  };

  const apertura = toMinutes(matches[0]);
  const cierre = toMinutes(matches[1]);

  if (cierre <= apertura) return null;

  return { apertura, cierre };
};

export const isFeriaOpenNow = (feria: Feria, now: Date = new Date()): boolean => {
  const dias = parseDias(feria.dias);
  const rango = parseHorario(feria.horario);

  if (!dias.length || !rango) return false;
  if (!dias.includes(now.getDay())) return false;

  const minutosAhora = now.getHours() * 60 + now.getMinutes();
  return minutosAhora >= rango.apertura && minutosAhora < rango.cierre;
};

export const isFeriaToday = (feria: Feria, now: Date = new Date()): boolean => {
  const dias = parseDias(feria.dias);
  return dias.includes(now.getDay());
};
