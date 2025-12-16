// src/components/Cart.jsx
export default function Cart({ cart, total, onRemove, onChangeQty, onEdit }) {
  return (
    <div className="card mb-4">
      <div className="card-header bg-dark text-white">
        Mi pedido
      </div>
      <div className="card-body">
        {cart.length === 0 ? (
          <p className="text-muted mb-0">
            Todavía no agregaste pizzas 🍕
          </p>
        ) : (
          <>
            <ul className="list-group mb-3">
              {cart.map((item) => (
                <li
                  key={item.id} // En realidad debería ser item.lineId si existe, o un combo
                  className="list-group-item d-flex justify-content-between align-items-start"
                >
                  <div className="ms-2 me-auto">
                    <div className="fw-semibold">{item.name}</div>
                    <small className="text-muted">
                      ${item.price} c/u
                    </small>

                    {/* Mostrar extras seleccionados (Pizzas) */}
                    {item.extras && item.extras.length > 0 && (
                      <ul className="list-unstyled mt-1 mb-0 ms-2 border-start ps-2">
                        {item.extras.map((ex) => (
                          <li key={ex.id} className="small text-secondary">
                            + {ex.name} (${ex.price})
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Mostrar detalle del pack (Empanadas) */}
                    {item.pack && (
                      <div className="small text-secondary mt-1 border-start ps-2">
                        {Object.entries(item.pack.items || {})
                          .filter(([, qty]) => qty > 0)
                          .map(([id, qty]) => `${qty}x ${id}`) // mejora: mapear id->nombre si podés
                          .join(", ")}
                      </div>
                    )}
                  </div>

                  <div className="d-flex align-items-center">

                    {/* Botón EDITAR: Solo para Pizzas, Promos o Packs */}
                    {(item.category === "Pizzas" || item.id.startsWith("promo-") || item.id.includes("emp-")) && (
                      <button
                        className="btn btn-sm btn-outline-warning me-2"
                        onClick={() => onEdit && onEdit(item)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                    )}

                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() =>
                        onChangeQty(item.lineId || item.id, item.qty - 1)
                      }
                      disabled={item.qty <= 1}
                    >
                      -
                    </button>
                    <span>{item.qty}</span>
                    <button
                      className="btn btn-sm btn-outline-secondary ms-2"
                      onClick={() =>
                        onChangeQty(item.lineId || item.id, item.qty + 1)
                      }
                    >
                      +
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger ms-3"
                      onClick={() => onRemove(item.lineId || item.id)}
                    >
                      x
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="d-flex justify-content-between">
              <span className="fw-bold">Total</span>
              <span className="fw-bold">${total}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
