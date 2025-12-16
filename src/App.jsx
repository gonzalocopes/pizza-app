import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async"; // 👈 Importamos Helmet
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./index.css";

import Navbar from "./components/Navbar";
import HeroCarousel from "./components/HeroCarousel";
import Menu from "./components/Menu";
import Cart from "./components/Cart";
import CheckoutForm from "./components/CheckoutForm";
import WhatsAppButton from "./components/WhatsAppButton";
import UpsellModal from "./components/UpsellModal";

import {
  empanadas,
  extrasPizza,
  extrasMitad,
} from "./data/pizzeriaProducts";

import { clientConfig } from "./config/clientConfig";

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function App() {
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({
    name: "",
    address: "",
    address2: "",
    phone: "",
    deliveryMethod: "Delivery",
    paymentMethod: "Efectivo",
    comments: "",
  });

  const [showUpsell, setShowUpsell] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  // para saber a qué producto estamos agregando extras
  const [activeLineId, setActiveLineId] = useState(null);
  const [lastProduct, setLastProduct] = useState(null);

  // modal modes: "extras" | "mitad" | "pack"
  const [upsellMode, setUpsellMode] = useState("extras");
  const [upsellItems, setUpsellItems] = useState(extrasPizza);

  // packs empanadas
  const [requiredPackCount, setRequiredPackCount] = useState(0);

  const empanadaFlavors = useMemo(() => {
    return empanadas.filter((e) => !e.upsell); // sabores individuales (sin docena/media)
  }, []);

  // 🔔 FORZAR CAMBIO DE FAVICON (Solución "bruta" para ganarle al index.html)
  useEffect(() => {
    // 1. Buscamos el link existente
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      // Si no existe, lo creamos
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    // 2. Lo forzamos al nuevo
    link.href = clientConfig.logo; // Usamos el logo de la config
  }, []);

  // 🔔 Horario
  useEffect(() => {
    if (!clientConfig.horario?.enabled) return;

    const checkClosed = () => {
      const now = new Date();
      const days = [
        "domingo",
        "lunes",
        "martes",
        "miercoles",
        "jueves",
        "viernes",
        "sabado",
      ];
      const dayName = days[now.getDay()];
      const configDia = clientConfig.horario.dias[dayName];

      if (!configDia || !configDia.abierto) {
        setIsClosed(true);
        return;
      }

      const [openH, openM] = configDia.apertura.split(":").map(Number);
      const [closeH, closeM] = configDia.cierre.split(":").map(Number);

      const minutesNow = now.getHours() * 60 + now.getMinutes();
      const minutesOpen = openH * 60 + openM;
      const minutesClose = closeH * 60 + closeM;

      let closedNow;

      if (minutesClose > minutesOpen) {
        closedNow = minutesNow < minutesOpen || minutesNow >= minutesClose;
      } else {
        closedNow = minutesNow < minutesOpen && minutesNow >= minutesClose;
      }

      setIsClosed(closedNow);
    };

    checkClosed();
    const id = setInterval(checkClosed, 60000);
    return () => clearInterval(id);
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + (item.qty || 0), 0);

  // ✅ agregar producto normal
  const addToCart = (product) => {
    if (isClosed && clientConfig.horario?.enabled) {
      alert(
        clientConfig.horario.mensajeCerrado ||
        "En este momento el local está cerrado."
      );
      return;
    }

    // ✅ PACKS empanadas (docena / media)
    const isEmpanadaPack =
      product.id === "emp-docena" || product.id === "emp-media-docena";

    if (isEmpanadaPack) {
      const size = product.id === "emp-docena" ? 12 : 6;
      const lineId = uid();

      setCart((prev) => [
        ...prev,
        {
          ...product,
          lineId,
          qty: 1,
          pack: { size, items: {} },
        },
      ]);

      setLastProduct(product);
      setActiveLineId(lineId);
      setUpsellMode("pack");
      setRequiredPackCount(size);
      setShowUpsell(true);
      return;
    }

    // ✅ PIZZAS: se agregan como "línea única" para poder tener extras por pizza
    const isPizza = product.category === "Pizzas";

    if (isPizza && !product.noExtras) {
      const lineId = uid();
      setCart((prev) => [
        ...prev,
        { ...product, lineId, qty: 1, extras: [] }, // 👈 extras pegados a esta pizza
      ]);

      setLastProduct(product);
      setActiveLineId(lineId);

      if (product.id === "pizza-mitad") {
        setUpsellMode("mitad");
        setUpsellItems(extrasMitad);
      } else {
        setUpsellMode("extras");
        setUpsellItems(extrasPizza);
      }

      setShowUpsell(true);
      return;
    }

    // ✅ PROMOS CON PIZZAS (y la especial de empanadas)
    // Detectamos si es promo por ID o si le agregamos categoría "Promos" en el futuro
    const isPromo = product.id.startsWith("promo-");

    if (isPromo) {
      const lineId = uid();

      // Configuración especial para "1 Muzza + 6 Empanadas"
      const isMuzzaEmpanadas = product.id === "promo-1-emp";

      const newProduct = {
        ...product,
        lineId,
        qty: 1,
        // Todos los promos de pizzas llevan "extras" (molde/piedra)
        extras: [],
        // Si es la de empanadas, inicializamos el pack también
        pack: isMuzzaEmpanadas ? { size: 6, items: {} } : null,
      };

      setCart((prev) => [...prev, newProduct]);

      setLastProduct(product);
      setActiveLineId(lineId);

      // Paso 1: Siempre elegir preparación (Molde/Piedra)
      setUpsellMode("extras");
      setUpsellItems(extrasPizza); // Usamos los extras estándar de pizza

      setShowUpsell(true);
      return;
    }

    // ✅ otros productos: se acumulan por id (como venías)
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id && !item.lineId);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id && !item.lineId
            ? { ...item, qty: (item.qty || 1) + 1 }
            : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  // ✅ Gestor de cierre del modal (Maneja flujos de varios pasos)
  const handleModalClose = () => {
    // Verificamos si estamos editando "1 Muzza + 6 Empanadas" y estamos en el paso 1 ("extras")
    const activeItem = cart.find(i => i.lineId === activeLineId);

    if (activeItem && activeItem.id === "promo-1-emp" && upsellMode === "extras") {
      // PASO 2: Ir a elegir empanadas
      setUpsellMode("pack");
      setRequiredPackCount(6);
      // No cerramos el modal, solo cambiamos el modo
      return;
    }

    // Cierre normal
    setShowUpsell(false);
    setActiveLineId(null);
  };

  // ✅ Toggle extra sobre la pizza seleccionada (activeLineId)
  const toggleExtraOnActiveLine = (extraItem) => {
    if (!activeLineId) return;

    const PREP_IDS = new Set([
      "al-molde",
      "ala-piedra",
      "al-molde-mitad",
      "ala-piedra-mitad",
    ]);

    setCart((prev) =>
      prev.map((line) => {
        if (line.lineId !== activeLineId) return line;
        const extras = Array.isArray(line.extras) ? line.extras : [];

        const exists = extras.some((x) => x.id === extraItem.id);

        // si es preparación (molde/piedra) => solo puede haber 1 seleccionado
        if (PREP_IDS.has(extraItem.id)) {
          const withoutPrep = extras.filter((x) => !PREP_IDS.has(x.id));
          if (exists) {
            // si ya estaba, lo quito
            return { ...line, extras: withoutPrep };
          }
          // lo pongo como único de preparación
          return { ...line, extras: [...withoutPrep, extraItem] };
        }

        // extras comunes => toggle normal
        if (exists) {
          return { ...line, extras: extras.filter((x) => x.id !== extraItem.id) };
        }
        return { ...line, extras: [...extras, extraItem] };
      })
    );
  };

  // ✅ confirmar pack empanadas
  const handleConfirmEmpanadaPack = (itemsObj) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.lineId !== activeLineId) return item;
        return {
          ...item,
          pack: { ...item.pack, items: itemsObj },
        };
      })
    );

    setShowUpsell(false);
    setActiveLineId(null);
    setRequiredPackCount(0);
  };

  const removeFromCart = (idOrLineId) => {
    setCart((prev) =>
      prev.filter((item) => item.id !== idOrLineId && item.lineId !== idOrLineId)
    );
  };

  const changeQty = (idOrLineId, newQty) => {
    if (newQty <= 0) return;
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === idOrLineId || item.lineId === idOrLineId) {
          return { ...item, qty: newQty };
        }
        return item;
      })
    );
  };

  // ✅ Editar ítem (Reabrir modal con estado actual)
  const handleEdit = (item) => {
    setLastProduct(item);
    setActiveLineId(item.lineId);

    // 1. Identificar tipo de edición
    if (item.id === "promo-1-emp") {
      // Caso especial: Preguntar qué quiere editar? 
      // Simplificación: Abrir directo en Empanadas (lo más común) o Extras?
      // O abrir en Extras y dejar que el flujo siga?
      // Mejor: Abrir en Extras (Paso 1). El usuario puede dar "Listo" y pasar a Empanadas.
      setUpsellMode("extras");
      setUpsellItems(extrasPizza);
      setShowUpsell(true);
    } else if (item.id.includes("emp-")) {
      // Pack empanadas
      setUpsellMode("pack");
      setRequiredPackCount(item.pack.size);
      setShowUpsell(true);
    } else if (item.category === "Pizzas" || item.id.startsWith("promo-")) {
      // Pizzas o Promos de Pizza simples
      if (item.id === "pizza-mitad") {
        setUpsellMode("mitad");
        setUpsellItems(extrasMitad);
      } else {
        setUpsellMode("extras");
        setUpsellItems(extrasPizza);
      }
      setShowUpsell(true);
    }
  };

  // ✅ total incluye extras por línea
  const total = cart.reduce((sum, item) => {
    const qty = item.qty || 1;
    const extrasSum = (item.extras || []).reduce((a, e) => a + (e.price || 0), 0);
    return sum + (item.price + extrasSum) * qty;
  }, 0);

  return (
    <div className="bg-body-tertiary min-vh-100">
      <Helmet>
        <title>{clientConfig.nombre}</title>
        <link rel="icon" type="image/png" href={clientConfig.logo} sizes="16x16" />
      </Helmet>
      <Navbar cartCount={cartCount} />

      {clientConfig.horario?.enabled && isClosed && (
        <div className="bg-dark text-light text-center py-2">
          <small>{clientConfig.horario.mensajeCerrado}</small>
        </div>
      )}

      <HeroCarousel />

      <main className="py-5" id="pedido" style={{ paddingBottom: "60px" }}>
        <div className="container-fluid px-4 px-lg-5">
          <div className="row">
            <div className="col-12 col-lg-7 mb-4 mb-lg-0">
              <Menu onAddToCart={addToCart} isClosed={isClosed} />
            </div>

            <section id="cart" className="col-12 col-lg-5">
              <Cart
                cart={cart}
                total={total}
                onRemove={removeFromCart}
                onChangeQty={changeQty}
                onEdit={handleEdit}
              />
              <CheckoutForm customer={customer} onChange={setCustomer} />
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

      <footer className="bg-dark text-light text-center py-3 mt-auto">
        <small>
          © {new Date().getFullYear()}{" "}
          Desarrollado por{" "}
          <a
            href="https://magozitsolutions.com/gopedidos/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-decoration-none text-info"
          >
            GoPedidos
          </a>
        </small>
      </footer>

      <div className="d-md-none" style={{ height: "64px" }} />

      <UpsellModal
        show={showUpsell}
        onClose={handleModalClose}
        mode={upsellMode}
        lastProduct={lastProduct}
        upsellItems={upsellItems}
        empanadaFlavors={empanadaFlavors}
        requiredCount={requiredPackCount}
        // 👇 ahora NO “agrega al carrito”, sino que lo pega a la pizza activa
        onToggleExtra={toggleExtraOnActiveLine}
        // 👇 para pintar seleccionados
        activeLine={cart.find((x) => x.lineId === activeLineId) || null}
        onConfirmEmpanadaPack={handleConfirmEmpanadaPack}
      />
    </div>
  );
}

export default App;
