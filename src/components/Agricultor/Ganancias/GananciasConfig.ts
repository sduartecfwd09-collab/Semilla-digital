import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
  type ChartOptions,
  type ChartData,
} from "chart.js";

// Registrar componentes de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

export interface CostosData {
  [productoNombre: string]: number;
}

export const chartColors = [
  "#2f8f46",
  "#6b8f3d",
  "#b7791f",
  "#4f7f6f",
  "#8a6f35",
  "#2f6f3e",
  "#9a6b2f",
  "#5f7f42",
];

export const currencyFormatter = new Intl.NumberFormat("es-CR", {
  style: "currency",
  currency: "CRC",
  maximumFractionDigits: 0,
});

/**
 * Retorna los datos configurados para el gráfico de pastel.
 */
export const getPieChartData = (
  chartData: any[],
): ChartData<"pie", number[], string> => ({
  labels: chartData.map((d) => d.nombre),
  datasets: [
    {
      data: chartData.map((d) => d.ganancia),
      backgroundColor: chartData.map(
        (_, i) => chartColors[i % chartColors.length],
      ),
      borderColor: "#ffffff",
      borderWidth: 4,
      hoverBorderColor: "#f7f3ea",
      hoverOffset: 10,
    },
  ],
});

/**
 * Retorna las opciones configuradas para el gráfico de pastel (Pie Chart).
 * Se usa una función para poder inyectar dinámicamente la ganancia total en los tooltips.
 */
export const getPieChartOptions = (
  totalGananciaEstimada: number,
): ChartOptions<"pie"> => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: "70%",
  animation: {
    animateRotate: true,
    animateScale: true,
    duration: 900,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "#17351f",
      titleColor: "#ffffff",
      bodyColor: "#ffffff",
      borderColor: "#d8c7a3",
      borderWidth: 1,
      padding: 12,
      displayColors: true,
      callbacks: {
        label: (context) => {
          const value = (context.parsed as number) || 0;
          const percent =
            totalGananciaEstimada > 0
              ? (value / totalGananciaEstimada) * 100
              : 0;
          return ` ${currencyFormatter.format(value)} (${percent.toFixed(1)}%)`;
        },
      },
    },
  },
});
