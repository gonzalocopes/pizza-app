// src/components/WhatsAppButton.jsx
import { clientConfig } from "../config/clientConfig";

function formatMoney(n) {
  return new Intl.NumberFormat("es-AR").format(n);
}

function getWhatsAppNumber() {
  const raw =
    clientConfig?.whatsappNumber ||
    clientConfig?.whatsapp?.number ||
    clientConfig?.whatsapp?.phone ||
    clientConfig?.whatsapp ||
    "";
  return String(raw).replace(/\D/g, "");
}

export default function WhatsAppButton({ cart, total, customer, isClosed }) {
  const cartCount = cart.reduce((sum, item) => sum + (item.qty || 0), 0);

  const getMessage = () => {
    const lines = [];
    lines.push("🟧 Nuevo pedido:");
    lines.push("");
    lines.push("🍕 *Detalle del pedido:*");
    lines.push("");

    cart.forEach((item) => {
      const qty = item.qty || 1;
      const extrasSum = (item.extras || []).reduce(
        (a, e) => a + (e.price || 0),
        0
      );
      // const unitTotal = item.price + extrasSum;

      // ✅ FORMATO CRUNCHY: Negrita en el ítem principal
      lines.push(`*• ${qty}x ${item.name}*`);

      // Extras
      if (item.extras && item.extras.length > 0) {
        item.extras.forEach((e) => {
          lines.push(
            `   + ${e.name}${e.price ? ` ($${formatMoney(e.price)})` : ""}`
          );
        });
      }

      // Packs (Empanadas)
      if (item.pack) {
        const title =
          item.pack.size === 12
            ? "   🥟 *Docena (detalle):*"
            : "   🥟 *Media docena (detalle):*";
        lines.push(title);

        const detail = Object.entries(item.pack.items || {})
          .filter(([, q]) => q > 0)
          .map(([id, q]) => `${q}x ${id}`)
          .join(", ");

        lines.push(`   _(${detail || "sin selección"})_`);
      }
    });

    lines.push("");
    lines.push(`💰 *Total: $${formatMoney(total)}*`);
    lines.push("");
    lines.push("👤 *Datos del cliente:*");
    lines.push(`Nombre: ${customer.name || "-"}`);
    lines.push(`Dirección: ${customer.address || "-"}`);
    if (customer.deliveryMethod === "Delivery") {
      lines.push(`Entre calles: ${customer.address2 || "-"}`);
    }
    lines.push(`Teléfono: ${customer.phone || "-"}`);
    lines.push(`Entrega: ${customer.deliveryMethod || "-"}`);

    if (customer.deliveryMethod === "Delivery") {
      lines.push(`Pago: ${customer.paymentMethod || "-"}`);
      if (customer.paymentMethod === "Efectivo" && customer.payWith) {
        lines.push(`Abona con: ${customer.payWith}`);
      }
    }

    if (customer.comments?.trim()) {
      lines.push("");
      lines.push(`📝 *Comentarios:*`);
      lines.push(`${customer.comments.trim()}`);
    }

    return lines.join("\n");
  };

  const handleSend = () => {
    const phone = getWhatsAppNumber();

    if (!phone) {
      alert("No encontré el número de WhatsApp en clientConfig.");
      return;
    }
    if (!cart.length) {
      alert("Agregá al menos un producto al pedido 🙂");
      return;
    }
    if (isClosed && clientConfig.horario?.enabled) {
      alert(
        clientConfig.horario.mensajeCerrado ||
        "En este momento el local está cerrado."
      );
      return;
    }

    // --- VALIDACIÓN DE CAMPOS ESTILO CRUNCHY ---
    if (!customer?.name) {
      alert("Por favor completá tu nombre.");
      return;
    }

    if (!customer?.phone) {
      alert("Por favor completá tu teléfono de contacto.");
      return;
    }

    const isDelivery = customer.deliveryMethod === "Delivery";

    if (isDelivery) {
      if (!customer.address) {
        alert("Para Delivery, es necesario completar la Dirección.");
        return;
      }
      if (!customer.address2) {
        alert("Para Delivery, por favor indicá las Entre calles.");
        return;
      }
    }

    const msg = encodeURIComponent(getMessage());
    const url = `https://wa.me/${phone}?text=${msg}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Logica "Modal" / Widget flotante de Crunchy
  const handleClickMobile = () => {
    if (isClosed && clientConfig.horario?.enabled) return;

    if (!cart || cart.length === 0) {
      const menu = document.getElementById("menu");
      if (menu) {
        menu.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    const cartSection = document.getElementById("cart");
    if (cartSection) {
      cartSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      {/* Botón verde desktop */}
      <button
        type="button"
        className="btn btn-success w-100 mt-3 d-none d-md-block"
        onClick={handleSend}
        disabled={isClosed}
      >
        {isClosed ? "Local cerrado" : "Enviar pedido por WhatsApp"}
      </button>

      {/* Botón Flotante Mobile (El "Modal") */}
      <button
        id="mobile-cart-widget"
        type="button"
        onClick={handleClickMobile}
        disabled={isClosed}
        className="floating-wpp border-0 d-md-none"
      >
        <span className="floating-wpp-label">
          {cartCount === 0 ? "Ver menú" : "Ver mi pedido"}
        </span>
        <span className="floating-wpp-chip">
          <span role="img" aria-label="carrito">
            🛒
          </span>
          <span>
            {cartCount} · ${formatMoney(total)}
          </span>
        </span>
      </button>

      {/* Botón verde para Mobile (dentro del flujo del carrito) */}
      <button
        type="button"
        className="btn btn-success w-100 mt-3 d-md-none"
        onClick={handleSend}
        disabled={isClosed}
      >
        {isClosed ? "Local cerrado" : "Enviar pedido por WhatsApp"}
      </button>
    </>
  );
}
