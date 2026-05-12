import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

interface ChartItem {
  nombre: string;
  ganancia: number;
}

interface GananciasChartProps {
  type: 'bar' | 'pie';
  items: ChartItem[];
}

const GananciasChart: React.FC<GananciasChartProps> = ({ type, items }) => {
  // Configuración de Colores Premium (Verdes y Tierras)
  const chartColors = [
    'rgba(59, 156, 58, 0.85)',   // Verde Principal
    'rgba(45, 122, 45, 0.85)',   // Verde Bosque
    'rgba(82, 183, 136, 0.85)',  // Verde Esmeralda
    'rgba(5, 46, 22, 0.85)',    // Verde Oscuro Profundo
    'rgba(113, 128, 150, 0.85)', // Gris Slate
    'rgba(55, 65, 81, 0.85)',    // Gris Carbón
    'rgba(30, 41, 59, 0.85)',    // Slate Oscuro
    'rgba(22, 101, 52, 0.85)',   // Verde Musgo
  ];

  const chartBorderColors = chartColors.map(c => c.replace('0.85', '1'));

  const chartData = {
    labels: items.map(d => d.nombre),
    datasets: [{
      label: 'Ganancia (₡)',
      data: items.map(d => d.ganancia),
      backgroundColor: type === 'pie' ? chartColors : 'rgba(59, 156, 58, 0.7)',
      borderColor: type === 'pie' ? chartBorderColors : 'rgba(59, 156, 58, 1)',
      borderWidth: 1.5,
      borderRadius: type === 'bar' ? 8 : 0,
    }]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { size: 16, weight: 'bold' as const },
        bodyFont: { size: 14 },
        padding: 12,
        callbacks: {
          label: (context: any) => ` Ganancia: ₡${context.parsed.y.toLocaleString()}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { font: { size: 12, weight: 600 }, color: '#64748b' },
        grid: { color: '#f1f5f9' }
      },
      x: {
        ticks: { font: { size: 12, weight: 700 }, color: '#1e293b' },
        grid: { display: false }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 20,
          font: { size: 14, weight: 600 },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        callbacks: {
          label: (context: any) => {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const value = context.parsed;
            const percentage = ((value / total) * 100).toFixed(1);
            return ` ₡${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '65%' // Donut effect
  };

  return (
    <div style={{ height: '350px', width: '100%' }}>
      {type === 'bar' ? (
        <Bar data={chartData} options={barOptions} />
      ) : (
        <Pie data={chartData} options={pieOptions} />
      )}
    </div>
  );
};

export default GananciasChart;
