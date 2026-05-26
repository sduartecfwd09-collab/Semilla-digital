import React, { useEffect, useState, useCallback } from "react";
import ReactECharts from "echarts-for-react";
import { useAuth } from "../../context/AuthContext";
import { authFetch, ENDPOINTS } from "../../../services/api.config";

interface VentaRow {
  id: string;
  proforma_id: string;
  monto_bruto: number;
  comision_plataforma: number;
  porcentaje_comision: number;
  monto_neto: number;
  fecha_liquidacion: string | null;
  created_at: string;
  proformaItem?: {
    nombre_snapshot: string;
    cantidad: number;
    precio_unitario: number;
    unidad: string;
  };
  proforma?: { id: string; fecha: string };
}

interface Resumen {
  total_bruto: number;
  total_comision: number;
  total_neto: number;
  total_pendiente: number;
}

const fmt = new Intl.NumberFormat("es-CR", {
  style: "currency",
  currency: "CRC",
  maximumFractionDigits: 0,
});

const VentasReales: React.FC = () => {
  const { user } = useAuth();
  const [ventas, setVentas] = useState<VentaRow[]>([]);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mesFilter, setMesFilter] = useState("");
  const [anioFilter, setAnioFilter] = useState(
    String(new Date().getFullYear()),
  );

  const fetchVentas = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (mesFilter) params.set("mes", mesFilter);
      if (anioFilter) params.set("anio", anioFilter);
      const res = await authFetch(`${ENDPOINTS.ventasMine}?${params}`);
      if (!res.ok) throw new Error("Error al cargar ventas");
      const json = await res.json();
      const data = json.success ? json.data : json;
      setVentas(data.ventas || []);
      setResumen(data.resumen || null);
    } catch (e: any) {
      setError(e.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  }, [user, mesFilter, anioFilter]);

  useEffect(() => {
    fetchVentas();
  }, [fetchVentas]);

  const chartData = ventas.slice(0, 8).map((v) => ({
    name: v.proformaItem?.nombre_snapshot || "Producto",
    value: v.monto_neto,
  }));

  if (loading)
    return <p style={{ padding: "1rem" }}>Cargando ventas reales...</p>;
  if (error)
    return <p style={{ padding: "1rem", color: "#e53e3e" }}>{error}</p>;

  return (
    <div>
      {/* Filtros */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "#4a5568",
          }}
        >
          Mes
          <select
            value={mesFilter}
            onChange={(e) => setMesFilter(e.target.value)}
            style={{
              padding: "6px 10px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: "0.9rem",
            }}
          >
            <option value="">Todos</option>
            {[
              "Enero",
              "Febrero",
              "Marzo",
              "Abril",
              "Mayo",
              "Junio",
              "Julio",
              "Agosto",
              "Septiembre",
              "Octubre",
              "Noviembre",
              "Diciembre",
            ].map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "#4a5568",
          }}
        >
          Año
          <input
            type="number"
            value={anioFilter}
            onChange={(e) => setAnioFilter(e.target.value)}
            style={{
              padding: "6px 10px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: "0.9rem",
              width: "90px",
            }}
          />
        </label>
        <button
          onClick={fetchVentas}
          style={{
            marginTop: "auto",
            padding: "7px 18px",
            background: "#2f8f46",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Actualizar
        </button>
      </div>

      {/* Tarjetas resumen */}
      {resumen && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          {[
            {
              label: "Ventas brutas",
              value: fmt.format(resumen.total_bruto),
              color: "#2f8f46",
            },
            {
              label: "Comisión plataforma",
              value: fmt.format(resumen.total_comision),
              color: "#e07b54",
            },
            {
              label: "Ganancia neta total",
              value: fmt.format(resumen.total_neto),
              color: "#2f8f46",
            },
            {
              label: "Pendiente de cobro",
              value: fmt.format(resumen.total_pendiente),
              color: "#b7791f",
            },
          ].map((c) => (
            <div
              key={c.label}
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "1rem",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#64748b",
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
              >
                {c.label}
              </div>
              <div
                style={{ fontSize: "1.2rem", fontWeight: 800, color: c.color }}
              >
                {c.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {ventas.length === 0 ? (
        <p style={{ color: "#718096", textAlign: "center", padding: "2rem" }}>
          No hay ventas registradas para el período seleccionado.
        </p>
      ) : (
        <>
          {/* Gráfico */}
          {chartData.length > 0 && (
            <div style={{ height: "260px", marginBottom: "1.5rem" }}>
              <ReactECharts
                style={{ height: "100%", width: "100%" }}
                option={{
                  tooltip: {
                    trigger: "item",
                    formatter: (p: any) => `${p.name}: ${fmt.format(p.value)}`,
                  },
                  series: [
                    {
                      type: "pie",
                      radius: ["40%", "65%"],
                      center: ["50%", "50%"],
                      data: chartData,
                      label: {
                        show: true,
                        formatter: "{b}\n{d}%",
                        fontSize: 11,
                      },
                    },
                  ],
                }}
              />
            </div>
          )}

          {/* Tabla */}
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.875rem",
              }}
            >
              <thead>
                <tr style={{ background: "#f1f5f9" }}>
                  {[
                    "Fecha",
                    "Producto",
                    "Cant.",
                    "Precio unit.",
                    "Bruto",
                    "Comisión",
                    "Neto",
                  
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 12px",
                        textAlign: "left",
                        fontWeight: 700,
                        color: "#374151",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ventas.map((v) => (
                  <tr key={v.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td
                      style={{
                        padding: "9px 12px",
                        whiteSpace: "nowrap",
                        color: "#6b7280",
                      }}
                    >
                      {v.proforma?.fecha
                        ? new Date(v.proforma.fecha).toLocaleDateString("es-CR")
                        : "—"}
                    </td>
                    <td style={{ padding: "9px 12px", fontWeight: 600 }}>
                      {v.proformaItem?.nombre_snapshot || "—"}
                    </td>
                    <td style={{ padding: "9px 12px", textAlign: "center" }}>
                      {v.proformaItem?.cantidad ?? "—"}{" "}
                      {v.proformaItem?.unidad || ""}
                    </td>
                    <td style={{ padding: "9px 12px", textAlign: "right" }}>
                      {v.proformaItem?.precio_unitario != null
                        ? fmt.format(v.proformaItem.precio_unitario)
                        : "—"}
                    </td>
                    <td style={{ padding: "9px 12px", textAlign: "right" }}>
                      {fmt.format(v.monto_bruto)}
                    </td>
                    <td
                      style={{
                        padding: "9px 12px",
                        textAlign: "right",
                        color: "#e07b54",
                      }}
                    >
                      -{fmt.format(v.comision_plataforma)} (
                      {v.porcentaje_comision}%)
                    </td>
                    <td
                      style={{
                        padding: "9px 12px",
                        textAlign: "right",
                        fontWeight: 700,
                        color: "#2f8f46",
                      }}
                    >
                      {fmt.format(v.monto_neto)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default VentasReales;
