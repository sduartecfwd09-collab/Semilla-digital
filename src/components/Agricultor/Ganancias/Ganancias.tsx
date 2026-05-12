import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getProductosByUser, Producto } from "../../../servers/ProductService";
import AgricultorSidebar from "../../adminAgricultor/AgricultorSidebar";
import AdminHeader from "../../adminAgricultor/AgricultorHeader";
import Navbar from "../../Navbar/Navbar";
import Footer from "../../Footer/Footer";
import "./Ganancias.css";

interface CostosData {
  [productoNombre: string]: number;
}

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

  // Cargar datos cuando el usuario esté disponible
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

  // Cálculos para la tabla y gráficas
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

  // Ordenar por ganancia para el gráfico (top 5 o similar)
  const chartData = [...productosData]
    .sort((a, b) => b.ganancia - a.ganancia)
    .slice(0, 8);

  const maxGanancia = Math.max(...chartData.map((d) => d.ganancia), 1000);

  // Resumen
  const totalGananciaEstimada = chartData.reduce(
    (sum, d) => sum + d.ganancia,
    0,
  );
  const promedioMargen =
    chartData.length > 0
      ? chartData.reduce((sum, d) => sum + d.margenPct, 0) / chartData.length
      : 0;

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
                {/* Stats */}
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
                    <div className="ganancias-stat-title">Margen Promedio</div>
                    <div
                      className={`ganancias-stat-value ${promedioMargen >= 40 ? "success" : promedioMargen >= 20 ? "warning" : ""}`}
                    >
                      {promedioMargen.toFixed(1)}%
                    </div>
                  </div>
                  <div className="ganancias-stat-card">
                    <div className="ganancias-stat-title">
                      Producto más rentable
                    </div>
                    <div
                      className="ganancias-stat-value success"
                      style={{ fontSize: "1.4rem", marginTop: "0.4rem" }}
                    >
                      {chartData[0]?.nombre || "N/A"}
                    </div>
                  </div>
                </div>

                {/* Gráfica */}
                <div className="ganancias-section">
                  <div className="ganancias-section-header">
                    <h2 className="ganancias-section-title">
                      📊 Visualización de Ganancias
                    </h2>
                    <div className="chart-toggle-group">
                      <button
                        className={`chart-toggle-btn ${chartType === "bar" ? "active" : ""}`}
                        onClick={() => handleChartTypeChange("bar")}
                      >
                        Barras
                      </button>
                      <button
                        className={`chart-toggle-btn ${chartType === "pie" ? "active" : ""}`}
                        onClick={() => handleChartTypeChange("pie")}
                      >
                        Pastel
                      </button>
                    </div>
                  </div>

                  {chartType === "bar" ? (
                    <div className="ganancias-chart-container">
                      <div className="chart-y-axis">
                        <span>₡{maxGanancia}</span>
                        <span>₡{Math.round(maxGanancia / 2)}</span>
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
                                {d.nombre}: ₡{d.ganancia} ganancia
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
                        <svg viewBox="0 0 100 100" className="pie-chart-svg">
                          {(() => {
                            let cumulativePercent = 0;
                            const colors = [
                              "#3B9C3A",
                              "#2d7a2d",
                              "#52b788",
                              "#052e16",
                              "#718096",
                              "#374151",
                              "#1e293b",
                              "#166534",
                            ];

                            return chartData.map((d, i) => {
                              const percent =
                                (d.ganancia / totalGananciaEstimada) * 100;
                              const startX = Math.cos(
                                (2 * Math.PI * cumulativePercent) / 100,
                              );
                              const startY = Math.sin(
                                (2 * Math.PI * cumulativePercent) / 100,
                              );
                              cumulativePercent += percent;
                              const endX = Math.cos(
                                (2 * Math.PI * cumulativePercent) / 100,
                              );
                              const endY = Math.sin(
                                (2 * Math.PI * cumulativePercent) / 100,
                              );

                              const largeArcFlag = percent > 50 ? 1 : 0;
                              const pathData = `M 50 50 L ${50 + 40 * startX} ${50 + 40 * startY} A 40 40 0 ${largeArcFlag} 1 ${50 + 40 * endX} ${50 + 40 * endY} Z`;

                              return (
                                <g key={d.id} className="pie-segment">
                                  <path
                                    d={pathData}
                                    fill={colors[i % colors.length]}
                                  />
                                  <title>
                                    {d.nombre}: {percent.toFixed(1)}%
                                  </title>
                                </g>
                              );
                            });
                          })()}
                          <circle cx="50" cy="50" r="20" fill="white" />{" "}
                          {/* Donut effect */}
                        </svg>
                      </div>
                      <div className="pie-legend">
                        {chartData.map((d, i) => {
                          const colors = [
                            "#3B9C3A",
                            "#2d7a2d",
                            "#52b788",
                            "#052e16",
                            "#718096",
                            "#374151",
                            "#1e293b",
                            "#166534",
                          ];
                          return (
                            <div key={d.id} className="legend-item">
                              <span
                                className="legend-dot"
                                style={{
                                  backgroundColor: colors[i % colors.length],
                                }}
                              ></span>
                              <span className="legend-text">
                                {d.nombre}
                              </span>
                              <span className="legend-value">
                                {(
                                  (d.ganancia / totalGananciaEstimada) *
                                  100
                                ).toFixed(1)}
                                %
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tabla de Costos */}
                <div className="ganancias-section">
                  <div className="ganancias-section-header">
                    <h2 className="ganancias-section-title">
                      💵 Calculadora de Márgenes
                    </h2>
                    <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
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
                              ₡{d.precioVenta.toLocaleString()} /{" "}
                              {d.unidad || "U"}
                            </td>
                            <td>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                }}
                              >
                                <span>₡</span>
                                <input
                                  type="number"
                                  className="costo-input"
                                  value={costos[d.nombre] || ""}
                                  onChange={(e) =>
                                    handleCostoChange(
                                      d.nombre,
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Ej: 500"
                                  min="0"
                                />
                              </div>
                            </td>
                            <td
                              style={{
                                fontWeight: 700,
                                color: d.ganancia > 0 ? "#052e16" : "#94a3b8",
                              }}
                            >
                              ₡{d.ganancia.toLocaleString()}
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
