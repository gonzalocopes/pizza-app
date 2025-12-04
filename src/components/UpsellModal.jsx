// src/components/UpsellModal.jsx
import { useState, useEffect } from "react";
import { empanadas } from "../data/pizzeriaProducts";

export default function UpsellModal({
  show,
  onClose,
  upsellItems,
  onAdd,
  onRemoveOne,   // 👈 NUEVO: para restar 1 del carrito
  lastProduct,
}) {
  const [addedIds, setAddedIds] = useState([]); // para extras normales (pizzas)
  const [selectionCount, setSelectionCount] = useState(0); // total en pack
  const [flavorCounts, setFlavorCounts] = useState({}); // cantidad por sabor en pack

  useEffect(() => {
    if (show) {
      setAddedIds([]);
      setSelectionCount(0);
      setFlavorCounts({});
    }
  }, [show]);

  if (!show) return null;

  const productName = lastProduct?.name || "tu pedido";
  const category = lastProduct?.category || "";
  const nameLower = productName.toLowerCase();

  const isEmpanadaMedia =
    category === "Empanadas" && nameLower.includes("media docena");

  const isEmpanadaDocena =
    category === "Empanadas" &&
    nameLower.includes("docena") &&
    !nameLower.includes("media docena");

  const isEmpanadaPack = isEmpanadaMedia || isEmpanadaDocena;
  const maxSelection = isEmpanadaMedia ? 6 : isEmpanadaDocena ? 12 : null;

  const isPizza = category === "Pizzas";
  const icon = isEmpanadaPack ? "🥟" : isPizza ? "🍕" : "🥟";

  const currentCount = isEmpanadaPack ? selectionCount : addedIds.length;
  const reachedLimit =
    maxSelection !== null && currentCount >= maxSelection;

  // Para packs de empanadas mostramos las empanadas individuales (sin las de pack)
  const individualEmpanadas = empanadas.filter((e) => !e.upsell);
  const itemsToShow = isEmpanadaPack ? individualEmpanadas : upsellItems;

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
              {isEmpanadaPack
                ? "Elegí tus empanadas 🥟"
                : `¿Le sumamos algo a tu pedido? ${icon}`}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Cerrar"
            ></button>
          </div>

          {/* BODY */}
          <div className="modal-body upsell-scroll-area">
            {isEmpanadaPack ? (
              <>
                <p className="small text-muted mb-1">
                  Estás armando <strong>{productName}</strong>.
                </p>
                <p className="small text-muted mb-3">
                  Elegí hasta{" "}
                  <strong>{maxSelection} empanadas</strong>. No vas a poder
                  agregar más de ese número.
                  <br />
                  Seleccionaste{" "}
                  <strong>
                    {currentCount} de {maxSelection}
                  </strong>
                  .
                </p>
              </>
            ) : (
              <p className="small text-muted mb-3">
                Te dejamos algunas sugerencias para acompañar:
              </p>
            )}

            {itemsToShow.length === 0 ? (
              <p>No hay productos sugeridos.</p>
            ) : (
              <ul className="list-group">
                {itemsToShow.map((item) => {
                  if (isEmpanadaPack) {
                    // 🥟 LÓGICA PARA PACKS DE EMPANADAS (media/docena)
                    const packIdSuffix = isEmpanadaMedia
                      ? "-pack-media"
                      : "-pack-docena";
                    const flavorKey = item.id + packIdSuffix;
                    const flavorQty = flavorCounts[flavorKey] || 0;
                    const canDecrease = flavorQty > 0;
                    const canIncrease = !reachedLimit;

                    return (
                      <li
                        key={flavorKey}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <div className="fw-semibold">{item.name}</div>
                          <small className="text-muted">
                            Cantidad: {flavorQty}
                          </small>
                        </div>
                        <div className="d-flex gap-2">
                          {/* BOTÓN - */}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            disabled={!canDecrease}
                            onClick={() => {
                              if (!canDecrease) return;
                              // avisar al padre para sacar 1 del carrito
                              if (onRemoveOne) {
                                onRemoveOne(flavorKey);
                              }
                              setSelectionCount((prev) =>
                                prev > 0 ? prev - 1 : 0
                              );
                              setFlavorCounts((prev) => ({
                                ...prev,
                                [flavorKey]:
                                  (prev[flavorKey] || 0) > 0
                                    ? prev[flavorKey] - 1
                                    : 0,
                              }));
                            }}
                          >
                            −
                          </button>

                          {/* BOTÓN + */}
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            disabled={!canIncrease}
                            onClick={() => {
                              if (reachedLimit) return;

                              // Entra al carrito como item 0$ con ID especial
                              onAdd({
                                ...item,
                                id: flavorKey,
                                price: 0,
                              });

                              setSelectionCount((prev) => prev + 1);
                              setFlavorCounts((prev) => ({
                                ...prev,
                                [flavorKey]: (prev[flavorKey] || 0) + 1,
                              }));
                            }}
                          >
                            +
                          </button>
                        </div>
                      </li>
                    );
                  }

                  // 🍕 LÓGICA PARA EXTRAS DE PIZZA (una sola vez por ítem)
                  const isAdded = addedIds.includes(item.id);
                  const disabled = isAdded;

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
                        disabled={disabled}
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

          {/* FOOTER asd*/}
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
