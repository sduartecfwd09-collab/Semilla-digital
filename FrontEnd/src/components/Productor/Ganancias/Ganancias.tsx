import React, { useEffect, useState } from "react";
import { BarChart3, Calculator, PieChart } from "lucide-react";
import ReactECharts from "echarts-for-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useAuth } from "../../context/AuthContext";
import { getProductosByUser, Producto } from "../../../services/ProductService";
import ProductorSidebar from "../../adminProductor/ProductorSidebar";
import AdminHeader from "../../adminProductor/ProductorHeader";
import Navbar from "../../Navbar/Navbar";
import Footer from "../../Footer/Footer";
import "./Ganancias.css";

interface CostosData {
  [productoNombre: string]: number;
}

const chartColors = [
  "#2f8f46",
  "#6b8f3d",
  "#b7791f",
  "#4f7f6f",
  "#8a6f35",
  "#2f6f3e",
  "#9a6b2f",
  "#5f7f42",
];

const currencyFormatter = new Intl.NumberFormat("es-CR", {
  style: "currency",
  currency: "CRC",
  maximumFractionDigits: 0,
});

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

  const [cantidades, setCantidades] = useState<{
    [nombre: string]: string | number;
  }>(() => {
    try {
      return JSON.parse(localStorage.getItem(`cantidades_${user?.id}`) || "{}");
    } catch {
      return {};
    }
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
    if (value !== "" && !/^\d+$/.test(value)) return;
    const numValue = parseInt(value) || 0;
    const newCostos = { ...costos, [nombre]: numValue };
    setCostos(newCostos);
    if (user?.id) {
      localStorage.setItem(`costos_${user.id}`, JSON.stringify(newCostos));
    }
  };

  const handleCantidadChange = (nombre: string, value: string) => {
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    const newCantidades = { ...cantidades, [nombre]: value };
    setCantidades(newCantidades);
    if (user?.id)
      localStorage.setItem(
        `cantidades_${user.id}`,
        JSON.stringify(newCantidades),
      );
  };

  const productosData = productos.map((p) => {
    const precioVenta = p.precios[0]?.precio || 0;
    const costoEst = costos[p.nombre] || 0;
    const cantidadStr = cantidades[p.nombre];
    const cantidad =
      cantidadStr === ""
        ? 0
        : parseFloat(String(cantidadStr ?? (p as any).cantidad ?? 1)) || 0;

    const gananciaUnidad = Math.max(0, precioVenta - costoEst);
    const totalBruto = precioVenta * cantidad;
    const totalNeto = gananciaUnidad * cantidad;
    const margenPct =
      precioVenta > 0 ? (gananciaUnidad / precioVenta) * 100 : 0;

    let margenClase = "bajo";
    if (margenPct >= 40) margenClase = "excelente";
    else if (margenPct >= 20) margenClase = "bueno";

    return {
      ...p,
      precioVenta,
      costoEst,
      cantidad,
      gananciaUnidad,
      totalBruto,
      totalNeto,
      margenPct,
      margenClase,
    };
  });

  const chartData = [...productosData]
    .sort((a, b) => b.totalNeto - a.totalNeto)
    .slice(0, 8);

  const totalBrutoGlobal = productosData.reduce((s, d) => s + d.totalBruto, 0);
  const totalNetoGlobal = productosData.reduce((s, d) => s + d.totalNeto, 0);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("AgroMap — Margen de Ganancias", 14, 20);
    doc.setFontSize(10);
    doc.text(
      `Productor: ${(user as any)?.nombre || (user as any)?.email || "N/A"}`,
      14,
      28,
    );
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-CR")}`, 14, 34);

    autoTable(doc, {
      startY: 40,
      head: [
        [
          "Producto",
          "P.Venta",
          "Cant.",
          "Costo",
          "G.Unidad",
          "T.Bruto",
          "T.Neto",
          "Margen",
        ],
      ],
      body: productosData.map((d) => [
        d.nombre,
        currencyFormatter.format(d.precioVenta).replace("₡", "C"),
        d.cantidad,
        currencyFormatter.format(d.costoEst).replace("₡", "C"),
        currencyFormatter.format(d.gananciaUnidad).replace("₡", "C"),
        currencyFormatter.format(d.totalBruto).replace("₡", "C"),
        currencyFormatter.format(d.totalNeto).replace("₡", "C"),
        d.margenPct.toFixed(1) + "%",
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [47, 143, 70] },
    });
    doc.save(`agromap_ganancias_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <>
      <Navbar />
      <div className="admin-layout">
        <ProductorSidebar />
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
                <div className="ganancias-section">
                  <div
                    className="ganancias-stats-grid"
                    style={{ marginBottom: 0 }}
                  >
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
                        Total Bruto Global
                      </div>
                      <div className="ganancias-stat-value">
                        {currencyFormatter.format(totalBrutoGlobal)}
                      </div>
                    </div>
                    <div className="ganancias-stat-card">
                      <div className="ganancias-stat-title">
                        Ganancia Neta Total
                      </div>
                      <div className="ganancias-stat-value success">
                        {currencyFormatter.format(totalNetoGlobal)}
                      </div>
                    </div>
                    <div className="ganancias-stat-card">
                      <div className="ganancias-stat-title">
                        Producto Más Rentable
                      </div>
                      <div className="ganancias-stat-value success ganancias-stat-product">
                        {chartData[0]?.nombre || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Calculadora de Márgenes ── */}
                <div className="ganancias-section">
                  <div className="ganancias-section-header">
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <h2 className="ganancias-section-title">
                        <Calculator size={22} aria-hidden="true" />
                        Calculadora de Márgenes
                      </h2>
                      <p
                        className="ganancias-section-description"
                        style={{ margin: 0 }}
                      >
                        Ajustá las cantidades y costos para proyectar tus
                        ganancias netas.
                      </p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <h4>Descargar reporte</h4>
                      <button className="export-btn" onClick={exportPDF}>
                        ⬇ PDF
                      </button>
                    </div>
                  </div>

                  <div className="ganancias-table-container">
                    <table className="ganancias-table">
                      <thead>
                        <tr>
                          <th title="Nombre del producto">Producto</th>
                          <th
                            title="Precio de venta registrado"
                            className="text-right"
                          >
                            Precio Venta
                          </th>
                          <th
                            title="Cantidad que planeas vender"
                            className="text-center"
                          >
                            Cantidad
                          </th>
                          <th
                            title="Tu costo de producción por unidad"
                            className="text-center"
                          >
                            Costo Estimado
                          </th>
                          <th
                            title="Precio menos costo, por unidad"
                            className="text-right"
                          >
                            Ganancia Unidad
                          </th>
                          <th title="Precio × cantidad" className="text-right">
                            Total Bruto
                          </th>
                          <th
                            title="Ganancia × cantidad"
                            className="text-right"
                          >
                            Total Neto
                          </th>
                          <th
                            title="Porcentaje de ganancia sobre precio de venta"
                            className="text-center"
                          >
                            Margen (%)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {productosData.map((d) => (
                          <tr key={d.id}>
                            <td>
                              <span className="product-cell-name">
                                {d.nombre}
                              </span>
                            </td>
                            <td className="text-right">
                              {currencyFormatter.format(d.precioVenta)} /{" "}
                              {d.unidad || "U"}
                            </td>
                            <td>
                              <div className="costo-input-wrapper">
                                <input
                                  type="number"
                                  className="costo-input"
                                  value={
                                    cantidades[d.nombre] ??
                                    (d as any).cantidad ??
                                    1
                                  }
                                  onChange={(e) =>
                                    handleCantidadChange(
                                      d.nombre,
                                      e.target.value,
                                    )
                                  }
                                  onKeyDown={(e) =>
                                    ["e", "E", "+", "-"].includes(e.key) &&
                                    e.preventDefault()
                                  }
                                  min="0"
                                  placeholder="0"
                                />
                              </div>
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
                                  onKeyDown={(e) =>
                                    ["e", "E", "+", "-", "."].includes(e.key) &&
                                    e.preventDefault()
                                  }
                                  placeholder="0.00"
                                  min="0"
                                />
                              </div>
                            </td>
                            <td
                              className={`ganancia-cell text-right ${d.gananciaUnidad > 0 ? "positive" : ""}`}
                            >
                              {currencyFormatter.format(d.gananciaUnidad)}
                            </td>
                            <td className="text-right">
                              {currencyFormatter.format(d.totalBruto)}
                            </td>
                            <td
                              className={`ganancia-cell text-right ${d.totalNeto > 0 ? "positive" : ""}`}
                            >
                              {currencyFormatter.format(d.totalNeto)}
                            </td>
                            <td className="text-center">
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

                {/* ── Gráfico ECharts ── */}
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
                        onClick={() => {
                          setChartType("bar");
                          localStorage.setItem(
                            "agromap_ganancias_chart_type",
                            "bar",
                          );
                        }}
                      >
                        <BarChart3 size={17} aria-hidden="true" />
                        Barras
                      </button>
                      <button
                        className={`chart-toggle-btn ${
                          chartType === "pie" ? "active" : ""
                        }`}
                        onClick={() => {
                          setChartType("pie");
                          localStorage.setItem(
                            "agromap_ganancias_chart_type",
                            "pie",
                          );
                        }}
                      >
                        <PieChart size={17} aria-hidden="true" />
                        Pastel
                      </button>
                    </div>
                  </div>

                  <div style={{ height: "380px" }}>
                    <ReactECharts
                      notMerge={true}
                      style={{ height: "100%", width: "100%" }}
                      option={
                        chartType === "bar"
                          ? {
                              tooltip: {
                                trigger: "axis",
                                axisPointer: { type: "shadow" },
                                formatter: (params: any[]) => {
                                  const d = chartData[params[0].dataIndex];
                                  return `<b>${d.nombre}</b><br/>
                              Costo Total: ${currencyFormatter.format(d.costoEst * d.cantidad)}<br/>
                              Ganancia Neta: ${currencyFormatter.format(d.totalNeto)}<br/>
                              Margen: ${d.margenPct.toFixed(1)}%`;
                                },
                              },
                              legend: {
                                data: ["Costo Total", "Ganancia Neta"],
                                bottom: 0,
                              },
                              grid: {
                                left: "3%",
                                right: "4%",
                                bottom: "12%",
                                containLabel: true,
                              },
                              xAxis: {
                                type: "category",
                                data: chartData.map((d) => d.nombre),
                                axisLabel: { rotate: 20, fontSize: 11 },
                              },
                              yAxis: {
                                type: "value",
                                axisLabel: {
                                  formatter: (v: number) =>
                                    currencyFormatter.format(v),
                                },
                              },
                              series: [
                                {
                                  name: "Costo Total",
                                  type: "bar",
                                  stack: "total",
                                  data: chartData.map(
                                    (d) => d.costoEst * d.cantidad,
                                  ),
                                  itemStyle: {
                                    color: "#e07b54",
                                    borderRadius: [0, 0, 6, 6],
                                  },
                                },
                                {
                                  name: "Ganancia Neta",
                                  type: "bar",
                                  stack: "total",
                                  data: chartData.map((d) => d.totalNeto),
                                  itemStyle: {
                                    color: "#2f8f46",
                                    borderRadius: [6, 6, 0, 0],
                                  },
                                  label: {
                                    show: true,
                                    position: "top",
                                    formatter: (p: any) =>
                                      currencyFormatter.format(p.value),
                                    fontSize: 11,
                                    color: "#2f8f46",
                                    fontWeight: "bold",
                                  },
                                },
                              ],
                            }
                          : {
                              tooltip: {
                                trigger: "item",
                                formatter: (p: any) =>
                                  `${p.name}: ${currencyFormatter.format(p.value)} (${p.percent}%)`,
                              },
                              legend: {
                                orient: "vertical",
                                right: "5%",
                                top: "center",
                                formatter: (name: string) =>
                                  name.length > 15
                                    ? name.slice(0, 14) + "…"
                                    : name,
                              },
                              series: [
                                {
                                  name: "Ganancia Neta",
                                  type: "pie",
                                  radius: ["45%", "70%"],
                                  center: ["40%", "50%"],
                                  avoidLabelOverlap: true,
                                  label: {
                                    show: true,
                                    formatter: "{b}\n{d}%",
                                    fontSize: 11,
                                  },
                                  labelLine: { show: true },
                                  data: chartData.map((d, i) => ({
                                    value: d.totalNeto,
                                    name: d.nombre,
                                    itemStyle: {
                                      color:
                                        chartColors[i % chartColors.length],
                                    },
                                  })),
                                },
                              ],
                            }
                      }
                    />
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
