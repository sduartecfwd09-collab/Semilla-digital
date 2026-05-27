import React, { useState, useEffect, useMemo } from 'react';
import './CustomDatePicker.css';

interface CustomDatePickerProps {
  value: string; // Formato standard "YYYY-MM-DD" o vacío ""
  onChange: (value: string) => void;
  minYear?: number;
  maxYear?: number;
}

const MONTHS = [
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' }
];

const DAYS = Array.from({ length: 31 }, (_, i) => {
  const d = (i + 1).toString().padStart(2, '0');
  return { value: d, label: (i + 1).toString() };
});

const ChevronDown: React.FC = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="custom-date-picker-chevron"
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  minYear,
  maxYear,
}) => {
  // Parsear el valor "YYYY-MM-DD" inicial
  const parts = useMemo(() => (value ? value.split('-') : []), [value]);
  const selectedYear = parts[0] || '';
  const selectedMonth = parts[1] || '';
  const selectedDay = parts[2] || '';

  // Determinar la cantidad de días del mes y año seleccionados de manera dinámica
  const daysInMonth = useMemo(() => {
    if (!selectedMonth) return 31;
    const m = parseInt(selectedMonth, 10);
    if (m === 2) {
      if (!selectedYear) return 29; // valor por defecto temporal
      const y = parseInt(selectedYear, 10);
      return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 29 : 28;
    }
    if ([4, 6, 9, 11].includes(m)) return 30;
    return 31;
  }, [selectedMonth, selectedYear]);

  // Si el día seleccionado es mayor a los días del nuevo mes elegido, lo ajustamos
  useEffect(() => {
    if (selectedDay && parseInt(selectedDay, 10) > daysInMonth) {
      const adjustedDay = daysInMonth.toString().padStart(2, '0');
      if (selectedYear && selectedMonth) {
        onChange(`${selectedYear}-${selectedMonth}-${adjustedDay}`);
      }
    }
  }, [selectedMonth, selectedYear, daysInMonth, selectedDay, onChange]);

  // Generar rango de años
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = maxYear !== undefined ? maxYear : currentYear + 15;
    const endYear = minYear !== undefined ? minYear : currentYear - 100;
    
    const yearList: string[] = [];
    if (startYear >= endYear) {
      for (let y = startYear; y >= endYear; y--) {
        yearList.push(y.toString());
      }
    } else {
      for (let y = startYear; y <= endYear; y++) {
        yearList.push(y.toString());
      }
    }
    return yearList;
  }, [minYear, maxYear]);

  const handleSelectChange = (segment: 'day' | 'month' | 'year', val: string) => {
    let newDay = selectedDay;
    let newMonth = selectedMonth;
    let newYear = selectedYear;

    if (segment === 'day') newDay = val;
    else if (segment === 'month') newMonth = val;
    else if (segment === 'year') newYear = val;

    if (!newDay && !newMonth && !newYear) {
      onChange('');
    } else {
      // Disparar onChange sólo cuando esté completo para mantener la integridad en BD
      if (newDay && newMonth && newYear) {
        onChange(`${newYear}-${newMonth}-${newDay}`);
      } else {
        onChange(''); // se mantiene vacío para invalidación estándar si está incompleto
      }
    }
  };

  const visibleDays = useMemo(() => DAYS.slice(0, daysInMonth), [daysInMonth]);

  return (
    <div className="custom-date-picker-container">
      {/* Segmento: Día */}
      <div className="custom-date-picker-segment">
        <select
          value={selectedDay}
          onChange={(e) => handleSelectChange('day', e.target.value)}
          className="custom-date-picker-select"
          aria-label="Seleccionar Día"
        >
          <option value="">Día</option>
          {visibleDays.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
        <ChevronDown />
      </div>

      {/* Segmento: Mes */}
      <div className="custom-date-picker-segment">
        <select
          value={selectedMonth}
          onChange={(e) => handleSelectChange('month', e.target.value)}
          className="custom-date-picker-select"
          aria-label="Seleccionar Mes"
        >
          <option value="">Mes</option>
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <ChevronDown />
      </div>

      {/* Segmento: Año */}
      <div className="custom-date-picker-segment">
        <select
          value={selectedYear}
          onChange={(e) => handleSelectChange('year', e.target.value)}
          className="custom-date-picker-select"
          aria-label="Seleccionar Año"
        >
          <option value="">Año</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <ChevronDown />
      </div>
    </div>
  );
};

export default CustomDatePicker;
