import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import {
  ProductComparisonData,
  ComparisonRow,
} from "../ProductComparisonCard/ProductComparisonCard";
import "./ProductModal.css";

interface ProductModalProps {
  product: ProductComparisonData;
  feriaId: number;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  product,
  feriaId,
  onClose,
}) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [addedIndex, setAddedIndex] = useState<number | null>(null);
  const [deliveryToggle, setDeliveryToggle] = useState<Record<number, boolean>>(
    {},
  );
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  // Filtrar ofertas a la feria seleccionada por el usuario y ordenarlas
  // de menor a mayor precio para que la "mejor opción" quede al tope.
  const ofertasEnFeria = [...product.rows]
    .filter((r) => r.feriaId === feriaId)
    .sort((a, b) => a.priceNumeric - b.priceNumeric);

  const lowestPrice =
    ofertasEnFeria.length > 0 ? ofertasEnFeria[0].priceNumeric : 0;

  // Contexto de feria (para mostrar nombre/ubicación en el header del modal)
  const feriaContext = ofertasEnFeria[0];

  const getQuantity = (index: number) => quantities[index] || 1;

  const handleQuantityChange = (index: number, val: number) => {
    if (val < 1) return;
    setQuantities((prev) => ({ ...prev, [index]: val }));
  };

  const handleAddToCart = (row: ComparisonRow, index: number) => {
    if (!user) {
      Swal.fire({
        icon: "warning",
        title: "🔒🛒 Desbloqueá Tu Carrito",
        text: "Para agregar productos a tu carrito, comparar precios de ferias y generar tus proformas, necesitás tener una cuenta en AgroMap. ¡Es gratis y solo te tomará un minuto!",
        confirmButtonColor: "#3B9C3A",
        showCancelButton: true,
        confirmButtonText: "Registrarse ahora",
        cancelButtonText: "Seguir navegando",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/auth");
        }
      });
      return;
    }
    const hasDelivery = deliveryToggle[index] || false;
    const qty = getQuantity(index);
    // El cart id incluye ofertaProductoId (o productorId como fallback) para que
    // dos productores que vendan el mismo producto en la misma feria queden como
    // ítems distintos del carrito, no se fusionen.
    const cartId =
      row.ofertaProductoId != null
        ? `oferta-${row.ofertaProductoId}`
        : `${product.name}-${row.feriaName}-${row.productorId ?? "x"}`;
    addToCart(
      {
        id: cartId,
        nombre: product.name,
        emoji: product.emoji,
        precio: row.priceNumeric + (hasDelivery ? 1500 : 0),
        feriaNombre: row.feriaName,
        provincia: row.province || "",
        unidad: product.unit || "Unidad",
        descripcion: hasDelivery
          ? `${product.description || ""} (Incluye Delivery)`
          : product.description,
        categoria: product.category,
        producto_id: row.productoId,
        oferta_producto_id: row.ofertaProductoId,
        productor_id: row.productorId,
      },
      qty,
    );
    setAddedIndex(index);
    setTimeout(() => setAddedIndex(null), 1500);
  };

  const toggleDelivery = (index: number) => {
    setDeliveryToggle((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div className="product-modal" onClick={(e) => e.stopPropagation()}>
        <div className="product-modal-hero">
          <button className="product-modal-close" onClick={onClose}>
            ✕
          </button>
          <div className="product-modal-emoji">{product.emoji}</div>
          <span className="product-modal-category">{product.category}</span>
          <h2 className="product-modal-title">{product.name}</h2>
          {feriaContext && (
            <p className="product-modal-desc">
              📍 {feriaContext.feriaName} · {feriaContext.feriaLocation}
            </p>
          )}
        </div>

        <div className="product-modal-body">
          <h3 className="product-modal-section-title">
            👥 Productores en esta feria
          </h3>
          <div className="product-modal-prices">
            {ofertasEnFeria.length === 0 && (
              <p
                style={{
                  color: "#718096",
                  textAlign: "center",
                  padding: "1rem",
                }}
              >
                No hay productores disponibles para este producto en la feria
                seleccionada.
              </p>
            )}
            {ofertasEnFeria.map((row, index) => {
              const isBest = row.priceNumeric === lowestPrice;
              const isDeliveryOn = deliveryToggle[index] || false;
              return (
                <div
                  key={`oferta-${row.ofertaProductoId ?? `${row.productorId}-${index}`}`}
                  className={`product-modal-price-row ${isBest ? "best" : ""}`}
                >
                  <div>
                    <div className="product-modal-price-feria">
                      👤 {row.productorNombre || "Productor"}
                      {isBest && (
                        <span className="product-modal-price-best-badge">
                          Mejor precio
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <span className="product-modal-price-value">
                      ₡
                      {(
                        row.priceNumeric + (isDeliveryOn ? 1500 : 0)
                      ).toLocaleString()}
                    </span>

                    {/* Selector de cantidad dependiente de la unidad de medida */}
                    <div className="product-modal-qty-selector">
                      <button
                        className="product-modal-qty-btn"
                        onClick={() =>
                          handleQuantityChange(index, getQuantity(index) - 1)
                        }
                      >
                        -
                      </button>
                      <span className="product-modal-qty-value">
                        {getQuantity(index)}
                      </span>
                      <button
                        className="product-modal-qty-btn"
                        onClick={() =>
                          handleQuantityChange(index, getQuantity(index) + 1)
                        }
                      >
                        +
                      </button>
                      <span className="product-modal-qty-unit">
                        {product.unit || "ud"}
                      </span>
                    </div>
                    <button
                      className={`product-modal-add-btn ${addedIndex === index ? "added" : ""}`}
                      style={{
                        width: "auto",
                        padding: "0.5rem 1rem",
                        fontSize: "0.8rem",
                        minHeight: "56px",
                      }}
                      onClick={() => handleAddToCart(row, index)}
                    >
                      {addedIndex === index ? "✓ Agregado" : "🛒 Agregar"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {ofertasEnFeria.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  flex: 1,
                  minWidth: "8rem",
                  background: "#f0fdf4",
                  borderRadius: "0.75rem",
                  padding: "1rem",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#64748b",
                    fontWeight: 600,
                    marginBottom: "0.25rem",
                  }}
                >
                  Mejor precio
                </div>
                <div
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 800,
                    color: "#3B9C3A",
                  }}
                >
                  ₡{lowestPrice.toLocaleString()}
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minWidth: "8rem",
                  background: "#fafbfc",
                  borderRadius: "0.75rem",
                  padding: "1rem",
                  textAlign: "center",
                  border: "1px solid #f1f5f9",
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#64748b",
                    fontWeight: 600,
                    marginBottom: "0.25rem",
                  }}
                >
                  Productores
                </div>
                <div
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 800,
                    color: "#1e293b",
                  }}
                >
                  {ofertasEnFeria.length}
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minWidth: "8rem",
                  background: "#fafbfc",
                  borderRadius: "0.75rem",
                  padding: "1rem",
                  textAlign: "center",
                  border: "1px solid #f1f5f9",
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#64748b",
                    fontWeight: 600,
                    marginBottom: "0.25rem",
                  }}
                >
                  Unidad
                </div>
                <div
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 800,
                    color: "#1e293b",
                  }}
                >
                  {product.unit}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
