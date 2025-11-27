// src/components/UpsellModal.jsx
import { useState, useEffect } from "react";

export default function UpsellModal({
  show,
  onClose,
  upsellItems,
  onAdd,
  lastProduct,
}) {
  const [addedIds, setAddedIds] = useState([]);

  // cuando se abre el modal, reseteamos los "agregados"
  useEffect(() => {
    if (show) {
      setAddedIds([]);
    }
  }, [show]);

  if (!show) return null;

  // pequeño texto según el producto principal
  const productName = lastProduct?.name || "tu pedido";
  const isPizza = lastProduct?.category === "Pizzas";
  const icon = isPizza ? "🍕" : "🍽️";

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          {/* HEADER */}
          <div className="modal-header">
            <h5 className="modal-title">
              ¿Le sumamos algo a tu pedido? {icon}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Cerrar"
            ></button>
          </div>

          {/* BODY */}
          <div className="modal-body">
            <p className="small text-muted mb-3">
              Ya agregaste <strong>{productName}</strong>. Te dejamos algunas
              sugerencias para acompañar:
            </p>

            {upsellItems.length === 0 ? (
              <p>No hay productos sugeridos.</p>
            ) : (
              <ul className="list-group">
                {upsellItems.slice(0, 4).map((item) => {
                  const isAdded = addedIds.includes(item.id);
                  return (
                    <li
                      key={item.id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <div className="fw-semibold">{item.name}</div>
                        <small className="text-muted">${item.price}</small>
                      </div>
                      <button
                        className={
                          "btn btn-sm " +
                          (isAdded ? "btn-outline-success" : "btn-success")
                        }
                        disabled={isAdded}
                        onClick={() => {
                          if (!isAdded) {
                            onAdd(item);
                            setAddedIds((prev) => [...prev, item.id]);
                          }
                        }}
                      >
                        {isAdded ? "Agregado ✓" : "Agregar"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* FOOTER */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Seguir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
