// src/App.jsx
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import HeroCarousel from "./components/HeroCarousel";
import Menu from "./components/Menu";
import Cart from "./components/Cart";
import CheckoutForm from "./components/CheckoutForm";
import WhatsAppButton from "./components/WhatsAppButton";
import UpsellModal from "./components/UpsellModal";
// 👉 Usamos solo extrasPizza para el upsell
import { extrasPizza } from "./data/pizzeriaProducts";

import { clientConfig } from "./config/clientConfig";

function App() {
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({
    name: "",
    address: "",
    address2:"",
    phone: "",
    deliveryMethod: "Delivery",
    paymentMethod: "Efectivo",
    comments: "",
  });

  const [showUpsell, setShowUpsell] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [lastProduct, setLastProduct] = useState(null);

  // ⬇️ Ahora las sugerencias del modal son los extras de pizza
  const upsellItems = extrasPizza;

  // 🔔 Horario
  useEffect(() => {
    if (!clientConfig.horario?.enabled) return;

    const checkClosed = () => {
      const now = new Date();
      const [openH, openM] = clientConfig.horario.apertura
        .split(":")
        .map(Number);
      const [closeH, closeM] = clientConfig.horario.cierre
        .split(":")
        .map(Number);

      const minutesNow = now.getHours() * 60 + now.getMinutes();
      const minutesOpen = openH * 60 + openM;
      const minutesClose = closeH * 60 + closeM;

      let closedNow;

      if (minutesClose > minutesOpen) {
        closedNow =
          minutesNow < minutesOpen || minutesNow >= minutesClose;
      } else {
        closedNow =
          minutesNow < minutesOpen && minutesNow >= minutesClose;
      }

      setIsClosed(closedNow);
    };

    checkClosed();
    const id = setInterval(checkClosed, 60000);
    return () => clearInterval(id);
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const addToCart = (product, { fromUpsell = false } = {}) => {
    if (isClosed && clientConfig.horario?.enabled) {
      alert(
        clientConfig.horario.mensajeCerrado ||
          "En este momento el local está cerrado."
      );
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });

    const mainCategories = [
      "Pizzas",
      "Hamburguesas",
      "Sándwiches",
      "Sandwiches",
      "Milanesas",
      "Combos",
    ];

      const shouldOpenUpsell =
    !fromUpsell &&
    (mainCategories.includes(product.category) || product.upsell === true);

  if (shouldOpenUpsell) {
    setLastProduct(product);
    setShowUpsell(true);
  }

  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const changeQty = (id, newQty) => {
    if (newQty <= 0) return;
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: newQty } : item
      )
    );
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const handleAddFromUpsell = (product) => {
    addToCart(product, { fromUpsell: true });
  };

  return (
    <div className="bg-body-tertiary min-vh-100">
      <Navbar cartCount={cartCount} />

      {clientConfig.horario?.enabled && isClosed && (
        <div className="bg-dark text-light text-center py-2">
          <small>{clientConfig.horario.mensajeCerrado}</small>
        </div>
      )}

      <HeroCarousel />

      {/* margen top + algo de espacio por la barra flotante */}
      <main
        className="py-5"
        id="pedido"
        style={{ marginTop: "0px", paddingBottom: "60px" }}
      >
        <div className="container-fluid px-4 px-lg-5">
          <div className="row">
            {/* Menú */}
            <div className="col-12 col-lg-7 mb-4 mb-lg-0">
              <Menu onAddToCart={addToCart} isClosed={isClosed} />
            </div>

            {/* Carrito + datos + botón verde WhatsApp */}
            <section id="cart" className="col-12 col-lg-5">
              <Cart
                cart={cart}
                total={total}
                onRemove={removeFromCart}
                onChangeQty={changeQty}
              />
              <CheckoutForm
                customer={customer}
                onChange={setCustomer}
              />
              <WhatsAppButton
                cart={cart}
                total={total}
                customer={customer}
                isClosed={isClosed}
              />
            </section>
          </div>
        </div>
      </main>

      {/* Footer normal */}
      <footer className="bg-dark text-light text-center py-3 mt-auto">
        <small>
          © {new Date().getFullYear()}{" "}
          Desarrollado por{" "}
          <a
            href="https://gopedidos-psi.vercel.app/#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-decoration-none text-info"
          >
            GoPedidos
          </a>
        </small>
      </footer>

      {/* 🧱 Separador solo mobile para que la barra roja no tape el footer */}
      <div className="d-md-none" style={{ height: "64px" }} />

      {/* Modal de sugerencias */}
      <UpsellModal
        show={showUpsell}
        onClose={() => setShowUpsell(false)}
        upsellItems={upsellItems}
        onAdd={handleAddFromUpsell}
        lastProduct={lastProduct}
      />
    </div>
  );
}

export default App;
