// src/components/CheckoutForm.jsx
export default function CheckoutForm({ customer, onChange }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...customer, [name]: value });
  };

  return (
    <div className="card mb-4">
      <div className="card-header bg-secondary text-white">
        Tus datos
      </div>

      <div className="card-body">

        {/* 1. Entrega (Primero, para definir qué campos mostrar) */}
        <div className="mb-3">
          <label className="form-label fw-bold">Entrega</label>
          <select
            className="form-select"
            name="deliveryMethod"
            value={customer.deliveryMethod}
            onChange={handleChange}
          >
            <option value="Delivery">Delivery (Envío a domicilio)</option>
            <option value="Retiro en local">Retiro en local</option>
          </select>
        </div>

        {/* 2. Nombre (Siempre obligatorio) */}
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={customer.name}
            onChange={handleChange}
            placeholder="Ingresa tu nombre"
          />
        </div>

        {/* 3. Dirección y Entre calles (Solo si es Delivery) */}
        {customer.deliveryMethod === "Delivery" && (
          <>
            <div className="mb-3">
              <label className="form-label">Dirección y Numeración</label>
              <input
                type="text"
                className="form-control"
                name="address"
                value={customer.address}
                onChange={handleChange}
                placeholder="Calle y altura"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Entre calles</label>
              <input
                type="text"
                className="form-control"
                name="address2"
                value={customer.address2}
                onChange={handleChange}
                placeholder="Ej: Av. San Martín y Belgrano"
              />
            </div>
          </>
        )}

        {/* 4. Teléfono (Siempre visible) */}
        <div className="mb-3">
          <label className="form-label">Teléfono</label>
          <input
            type="text"
            className="form-control"
            name="phone"
            value={customer.phone}
            onChange={handleChange}
            placeholder="Ej: 11 1234-5678"
          />
        </div>

        {/* 5. Medio de pago (Solo para Delivery) */}
        {customer.deliveryMethod === "Delivery" && (
          <>
            <div className="mb-3">
              <label className="form-label fw-bold">Medio de pago</label>
              <select
                className="form-select"
                name="paymentMethod"
                value={customer.paymentMethod}
                onChange={handleChange}
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Mercado Pago">Mercado Pago</option>
              </select>
            </div>

            {/* 5.1 ¿Con cuánto paga? (Solo si es Efectivo) */}
            {customer.paymentMethod === "Efectivo" && (
              <div className="mb-3">
                <label className="form-label">¿Con cuánto abonás?</label>
                <input
                  type="text"
                  className="form-control"
                  name="payWith"
                  value={customer.payWith || ""}
                  onChange={handleChange}
                  placeholder="Ej: $20.000 / Pago justo"
                />
              </div>
            )}
          </>
        )}

        {/* 6. Comentarios */}
        <div className="mb-3">
          <label className="form-label">Comentarios (opcional)</label>
          <textarea
            className="form-control"
            name="comments"
            rows="2"
            placeholder="Ej: Sin cebolla, mayonesa aparte..."
            value={customer.comments}
            onChange={handleChange}
          ></textarea>
        </div>

      </div>
    </div>
  );
}
