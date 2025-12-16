// src/components/UpsellModal.jsx
import { useEffect, useMemo, useState } from "react";

export default function UpsellModal({
  show,
  onClose,
  mode = "extras", // "extras" | "mitad" | "pack"
  lastProduct,
  upsellItems = [],
  empanadaFlavors = [],
  requiredCount = 0,
  onToggleExtra,
  activeLine, // 👈 la pizza actual del carrito (con extras)
  onConfirmEmpanadaPack,
}) {
  // packs empanadas
  const [counts, setCounts] = useState({});

  useEffect(() => {
    if (show) setCounts({});
  }, [show, mode]);

  const totalSelected = useMemo(
    () => Object.values(counts).reduce((a, b) => a + (b || 0), 0),
    [counts]
  );

  const inc = (id) => {
    if (totalSelected >= requiredCount) return;
    setCounts((p) => ({ ...p, [id]: (p[id] || 0) + 1 }));
  };

  const dec = (id) => {
    setCounts((p) => ({
      ...p,
      [id]: Math.max((p[id] || 0) - 1, 0),
    }));
  };

  if (!show) return null;

  const selectedExtras = new Set((activeLine?.extras || []).map((e) => e.id));

  return (
    <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,.6)" }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">

          <div className="modal-header">
            <h5 className="modal-title">
              {mode === "pack" ? `Elegí ${requiredCount} empanadas` : "Extras / Preparación"}
            </h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">

            {/* PACK EMPANADAS */}
            {mode === "pack" && (
              <>
                <p className="fw-semibold mb-1">{lastProduct?.name}</p>
                <small className="text-muted">
                  Seleccionadas: {totalSelected}/{requiredCount}
                </small>

                <div className="mt-3">
                  {empanadaFlavors.map((e) => {
                    const qty = counts[e.id] || 0;
                    return (
                      <div
                        key={e.id}
                        className="d-flex justify-content-between align-items-center border rounded p-2 mb-2"
                      >
                        <div>
                          <strong>{e.name}</strong>
                          <div className="text-muted small">{e.description}</div>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => dec(e.id)}
                            disabled={qty === 0}
                          >
                            −
                          </button>
                          <span className="fw-bold">{qty}</span>
                          <button
                            className="btn btn-outline-success btn-sm"
                            onClick={() => inc(e.id)}
                            disabled={totalSelected >= requiredCount}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* EXTRAS / MITAD */}
            {mode !== "pack" && (
              <>
                <p className="fw-semibold mb-2">Para: {lastProduct?.name}</p>

                {upsellItems.map((item) => {
                  const isSelected = selectedExtras.has(item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onToggleExtra(item)}
                      className={`w-100 d-flex justify-content-between align-items-center border rounded p-2 mb-2 ${isSelected ? "btn btn-success" : "btn btn-outline-secondary"
                        }`}
                    >
                      <div className="text-start">
                        <strong>{item.name}</strong>
                        {item.price > 0 && (
                          <div className="small">+ ${item.price}</div>
                        )}
                      </div>

                      <div className="fw-bold">
                        {isSelected ? "✓ Seleccionado" : "Seleccionar"}
                      </div>
                    </button>
                  );
                })}
              </>
            )}
          </div>

          <div className="modal-footer">
            {mode === "pack" ? (
              <button
                className="btn btn-success w-100"
                disabled={totalSelected !== requiredCount}
                onClick={() => onConfirmEmpanadaPack(counts)}
              >
                Confirmar
              </button>
            ) : (
              // 🔔 Lógica para obligar a elegir Molde o Piedra
              (() => {
                const PREP_IDS = ["al-molde", "ala-piedra", "al-molde-mitad", "ala-piedra-mitad"];
                const hasPrep = PREP_IDS.some((id) => selectedExtras.has(id));

                return (
                  <button
                    className={`btn w-100 ${hasPrep ? "btn-success" : "btn-secondary"}`}
                    onClick={onClose}
                    disabled={!hasPrep}
                  >
                    {hasPrep ? "Listo" : "Seleccioná: Al Molde o A la Piedra"}
                  </button>
                );
              })()
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
