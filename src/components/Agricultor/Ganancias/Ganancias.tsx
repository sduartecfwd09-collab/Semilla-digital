import React, { useEffect, useState } from "react";
import { BarChart3, Calculator, PieChart } from "lucide-react";
import { Pie } from "react-chartjs-2";
import { useAuth } from "../../context/AuthContext";
import { getProductosByUser, Producto } from "../../../servers/ProductService";
import AgricultorSidebar from "../../adminAgricultor/AgricultorSidebar";
import AdminHeader from "../../adminAgricultor/AgricultorHeader";
import Navbar from "../../Navbar/Navbar";
import Footer from "../../Footer/Footer";
import {
  chartColors,
  currencyFormatter,
  getPieChartData,
  getPieChartOptions,
  type CostosData,
} from "./GananciasConfig";
import "./Ganancias.css";


const Ganancias: React.FC = () => {
  const { user } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [costos, setCostos] = useState<CostosData>({});
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<"bar" | "pie">(() => {
    return (
      (localStorage.getItem("agromap_ganancias_chart_type") as "bar" | "pie") ||
      "bar"
    );
  });

  useEffect(() => {
    if (user?.id) {
      try {
        const savedCostos = JSON.parse(
          localStorage.getItem(`costos_${user.id}`) || "{}",
        );
        setCostos(savedCostos);
      } catch {
        setCostos({});
      }
    }
  }, [user?.id]);

  useEffect(() => {
    const fetchProductos = async () => {
      if (!user) return;
      try {
        const prods = await getProductosByUser(user.id);
        setProductos(prods.filter((p) => p.precios && p.precios.length > 0));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, [user]);

  const handleCostoChange = (nombre: string, value: string) => {
    const numValue = parseInt(value) || 0;
    const newCostos = { ...costos, [nombre]: numValue };
    setCostos(newCostos);
    if (user?.id) {
      localStorage.setItem(`costos_${user.id}`, JSON.stringify(newCostos));
    }
  };

  const handleChartTypeChange = (type: "bar" | "pie") => {
    setChartType(type);
    localStorage.setItem("agromap_ganancias_chart_type", type);
  };

  const productosData = productos.map((p) => {
    const precioVenta = p.precios[0]?.precio || 0;
    const costoEst = costos[p.nombre] || 0;
    const ganancia = Math.max(0, precioVenta - costoEst);
    const margenPct = precioVenta > 0 ? (ganancia / precioVenta) * 100 : 0;

    let margenClase = "bajo";
    if (margenPct >= 40) margenClase = "excelente";
    else if (margenPct >= 20) margenClase = "bueno";

    return {
      ...p,
      precioVenta,
      costoEst,
      ganancia,
      margenPct,
      margenClase,
    };
  });

  const chartData = [...productosData]
    .sort((a, b) => b.ganancia - a.ganancia)
    .slice(0, 8);

  const maxGanancia = Math.max(...chartData.map((d) => d.ganancia), 1000);
  const totalGananciaEstimada = productosData.reduce(
    (sum, d) => sum + d.ganancia,
    0,
  );
  const promedioMargen =
    chartData.length > 0
      ? chartData.reduce((sum, d) => sum + d.margenPct, 0) / chartData.length
      : 0;
  const hasPieData = chartData.some((d) => d.ganancia > 0);



  return (
    <>
      <Navbar />
      <div className="admin-layout">
        <AgricultorSidebar />
        <div className="admin-main">
          <AdminHeader
            title="Margen de Ganancias"
            subtitle="Analizá la rentabilidad de tus productos"
          />
          <div className="admin-content">
            {loading ? (
              <p>Cargando datos...</p>
            ) : productos.length === 0 ? (
              <p>
                No tienes productos registrados con precios. Agrega productos
                primero.
              </p>
            ) : (
              <div className="ganancias-page">
                <div className="ganancias-stats-grid">
                  <div className="ganancias-stat-card">
                    <div className="ganancias-stat-title">
                      Productos Analizados
                    </div>
                    <div className="ganancias-stat-value">
                      {productosData.length}
                    </div>
                  </div>
                  <div className="ganancias-stat-card">
                    <div className="ganancias-stat-title">
                      Ganancia Estimada
                    </div>
                    <div className="ganancias-stat-value success">
                      {currencyFormatter.format(totalGananciaEstimada)}
                    </div>
                  </div>
                  <div className="ganancias-stat-card">
                    <div className="ganancias-stat-title">Margen Promedio</div>
                    <div
                      className={`ganancias-stat-value ${
                        promedioMargen >= 40
                          ? "success"
                          : promedioMargen >= 20
                            ? "warning"
                            : ""
                      }`}
                    >
                      {promedioMargen.toFixed(1)}%
                    </div>
                  </div>
                  <div className="ganancias-stat-card">
                    <div className="ganancias-stat-title">
                      Producto más rentable
                    </div>
                    <div className="ganancias-stat-value success ganancias-stat-product">
                      {chartData[0]?.nombre || "N/A"}
                    </div>
                  </div>
                </div>

                <div className="ganancias-section">
                  <div className="ganancias-section-header">
                    <h2 className="ganancias-section-title">
                      <BarChart3 size={22} aria-hidden="true" />
                      Visualización de Ganancias
                    </h2>
                    <div className="chart-toggle-group">
                      <button
                        className={`chart-toggle-btn ${
                          chartType === "bar" ? "active" : ""
                        }`}
                        onClick={() => handleChartTypeChange("bar")}
                      >
                        <BarChart3 size={17} aria-hidden="true" />
                        Barras
                      </button>
                      <button
                        className={`chart-toggle-btn ${
                          chartType === "pie" ? "active" : ""
                        }`}
                        onClick={() => handleChartTypeChange("pie")}
                      >
                        <PieChart size={17} aria-hidden="true" />
                        Pastel
                      </button>
                    </div>
                  </div>

                  {chartType === "bar" ? (
                    <div className="ganancias-chart-container">
                      <div className="chart-y-axis">
                        <span>{currencyFormatter.format(maxGanancia)}</span>
                        <span>
                          {currencyFormatter.format(
                            Math.round(maxGanancia / 2),
                          )}
                        </span>
                        <span>0</span>
                      </div>
                      {chartData.map((d) => {
                        const heightPct = (d.ganancia / maxGanancia) * 100;
                        return (
                          <div className="chart-bar-group" key={d.id}>
                            <div
                              className="chart-bar"
                              style={{ height: `${heightPct}%` }}
                            >
                              <div className="chart-bar-tooltip">
                                {d.nombre}:{" "}
                                {currencyFormatter.format(d.ganancia)} ganancia
                              </div>
                            </div>
                            <div className="chart-label" title={d.nombre}>
                              {d.nombre}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="pie-chart-wrapper">
                      <div className="pie-chart-container">
                        {hasPieData ? (
                          <>
                            <Pie
                              data={getPieChartData(chartData)}
                              options={getPieChartOptions(totalGananciaEstimada)}
                            />
                            <div className="pie-chart-center">
                              <span>Total</span>
                              <strong>
                                {currencyFormatter.format(
                                  totalGananciaEstimada,
                                )}
                              </strong>
                            </div>
                          </>
                        ) : (
                          <div className="pie-empty-state">
                            Ingresá costos menores al precio de venta para ver
                            el gráfico.
                          </div>
                        )}
                      </div>
                      <div className="pie-legend">
                        {chartData.map((d, i) => {
                          const percent =
                            totalGananciaEstimada > 0
                              ? (d.ganancia / totalGananciaEstimada) * 100
                              : 0;
                          return (
                            <div key={d.id} className="legend-item">
                              <span
                                className="legend-dot"
                                style={{
                                  backgroundColor:
                                    chartColors[i % chartColors.length],
                                }}
                              ></span>
                              <span className="legend-text">{d.nombre}</span>
                              <span className="legend-value">
                                {percent.toFixed(1)}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="ganancias-section">
                  <div className="ganancias-section-header">
                    <h2 className="ganancias-section-title">
                      <Calculator size={22} aria-hidden="true" />
                      Calculadora de Márgenes
                    </h2>
                    <p className="ganancias-section-description">
                      Ingresá tu costo estimado para calcular el margen.
                    </p>
                  </div>
                  <div className="ganancias-table-container">
                    <table className="ganancias-table">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Precio Venta</th>
                          <th>Costo Estimado</th>
                          <th>Ganancia Neta</th>
                          <th>Margen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productosData.map((d) => (
                          <tr key={d.id}>
                            <td>
                              <div className="product-cell">
                                <span className="product-cell-name">
                                  {d.nombre}
                                </span>
                              </div>
                            </td>
                            <td>
                              {currencyFormatter.format(d.precioVenta)} /{" "}
                              {d.unidad || "U"}
                            </td>
                            <td>
                              <div className="costo-input-wrapper">
                                <span>₡</span>
                                <input
                                  type="number"
                                  className="costo-input"
                                  value={costos[d.nombre] || ""}
                                  onChange={(e) =>
                                    handleCostoChange(d.nombre, e.target.value)
                                  }
                                  placeholder="Ej: 500"
                                  min="0"
                                />
                              </div>
                            </td>
                            <td
                              className={`ganancia-cell ${
                                d.ganancia > 0 ? "positive" : ""
                              }`}
                            >
                              {currencyFormatter.format(d.ganancia)}
                            </td>
                            <td>
                              <span className={`margen-badge ${d.margenClase}`}>
                                {d.margenPct.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Ganancias;
