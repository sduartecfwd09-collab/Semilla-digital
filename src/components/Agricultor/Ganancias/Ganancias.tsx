import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { getProductosByUser, Producto } from "../../../servers/ProductService";
import AgricultorSidebar from "../../adminAgricultor/AgricultorSidebar";
import AdminHeader from "../../adminAgricultor/AgricultorHeader";
import Navbar from "../../Navbar/Navbar";
import Footer from "../../Footer/Footer";
import GananciasChart from "./GananciasChart";
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
  const productosData = useMemo(() => {
    return productos.map((p) => {
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
  }, [productos, costos]);

  // Datos para las gráficas (Top 8 por ganancia)
  const chartDataItems = useMemo(() => {
    return [...productosData]
      .sort((a, b) => b.ganancia - a.ganancia)
      .slice(0, 8);
  }, [productosData]);

  const promedioMargen =
    productosData.length > 0
      ? productosData.reduce((sum, d) => sum + d.margenPct, 0) /
        productosData.length
      : 0;

  return (
    <>
      <Navbar />
      <div className="admin-layout">
        <AgricultorSidebar />
        <div className="admin-main">
          <AdminHeader
            title="Panel de Ganancias"
            subtitle="Análisis simplificado de tus ingresos por cada producto"
          />
          <div className="admin-content">
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Cargando tus datos financieros...</p>
              </div>
            ) : productos.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📂</span>
                <h3>Sin productos activos</h3>
                <p>
                  Agregá productos con precios en el inventario para ver tus
                  márgenes aquí.
                </p>
              </div>
            ) : (
              <div className="ganancias-page">
                {/* Resumen Superior - Accesible y Claro */}
                <div className="ganancias-stats-grid">
                  <div className="ganancias-stat-card primary">
                    <div className="stat-icon">📈</div>
                    <div className="stat-info">
                      <div className="ganancias-stat-title">
                        Margen Promedio
                      </div>
                      <div
                        className={`ganancias-stat-value ${promedioMargen >= 20 ? "success" : ""}`}
                      >
                        {promedioMargen.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="ganancias-stat-card accent">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-info">
                      <div className="ganancias-stat-title">Más Rentable</div>
                      <div
                        className="ganancias-stat-value success truncate"
                        title={chartDataItems[0]?.nombre}
                        >
                        {chartDataItems[0]?.nombre || "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="ganancias-stat-card info">
                    <div className="stat-icon">📦</div>
                    <div className="stat-info">
                      <div className="ganancias-stat-title">
                        Productos en Análisis
                      </div>
                      <div className="ganancias-stat-value">
                        {productosData.length}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección Visualización */}
                <div className="ganancias-section main-chart">
                  <div className="ganancias-section-header">
                    <div>
                      <h2 className="ganancias-section-title">
                        Visualización de Ganancias
                      </h2>
                      <p className="section-subtitle">
                        Comparativa de ingresos netos por producto
                      </p>
                    </div>
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

                  <div className="chart-display-area">
                    <GananciasChart type={chartType} items={chartDataItems} />
                  </div>
                </div>

                {/* Calculadora de Márgenes */}
                <div className="ganancias-section">
                  <div className="ganancias-section-header">
                    <div>
                      <h2 className="ganancias-section-title">
                        Calculadora de Costos
                      </h2>
                      <p className="section-subtitle">
                        Ajustá tus costos para ver la ganancia real
                      </p>
                    </div>
                  </div>

                  <div className="ganancias-table-container">
                    <table className="ganancias-table">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Precio Venta</th>
                          <th>Costo de Producción</th>
                          <th>Ganancia Neta</th>
                          <th>Estado Margen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productosData.map((d) => (
                          <tr key={d.id}>
                            <td className="font-bold">{d.nombre}</td>
                            <td className="text-secondary">
                              ₡{d.precioVenta.toLocaleString()}{" "}
                              <small>/ {d.unidad || "U"}</small>
                            </td>
                            <td>
                              <div className="input-with-currency">
                                <span>₡</span>
                                <input
                                  type="number"
                                  className="costo-input"
                                  value={costos[d.nombre] || ""}
                                  onChange={(e) =>
                                    handleCostoChange(d.nombre, e.target.value)
                                  }
                                  placeholder="0.00"
                                  min="0"
                                />
                              </div>
                            </td>
                            <td
                              className={`font-bold ${d.ganancia > 0 ? "text-profit" : "text-muted"}`}
                            >
                              ₡{d.ganancia.toLocaleString()}
                            </td>
                            <td>
                              <span className={`margen-badge ${d.margenClase}`}>
                                {d.margenPct.toFixed(1)}%{" "}
                                {d.margenPct >= 40
                                  ? ""
                                  : d.margenPct >= 20
                                    ? "🟡"
                                    : "⚠️"}
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
