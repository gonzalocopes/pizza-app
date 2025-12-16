// src/components/Menu.jsx
import { useState, useRef } from "react";
import {
  pizzas,
  empanadas,
  postres,
  milanesas,
  promos, // 👈 IMPORTANTE: importamos promos
} from "../data/pizzeriaProducts";

export default function Menu({ onAddToCart, isClosed }) {
  const categories = [
    { id: "pizzas", label: "Pizzas 🍕", products: pizzas },
    { id: "empanadas", label: "Empanadas 🥟", products: empanadas },
    { id: "milanesas", label: "Milanesas 🥩🍟", products: milanesas },
    { id: "promos", label: "Promos 💸💸", products: promos },
    { id: "postres", label: "Postres 🍦", products: postres },
  ];

  // categoría abierta en MOBILE
  const [openCategory, setOpenCategory] = useState(null);

  // refs para hacer scroll suave a la categoría abierta
  const categoryRefs = useRef({});

  const handleToggleCategory = (id) => {
    setOpenCategory((prev) => {
      // si ya está abierta → la cierro, si no → la abro
      const next = prev === id ? null : id;

      // solo hacemos scroll en mobile y si la estamos abriendo
      if (next && typeof window !== "undefined" && window.innerWidth < 768) {
        // esperamos a que termine la animación de abrir/cerrar
        setTimeout(() => {
          const el = categoryRefs.current[next];
          if (el) {
            // posición absoluta del contenedor en la página
            const offset = el.offsetTop - 120; // ajustá 120 si querés más arriba/abajo
            window.scrollTo({ top: offset, behavior: "smooth" });
          }
        }, 350); // tiempo para que se acomode el layout
      }

      return next;
    });
  };

  // 🪄 Animación de volar al carrito
  const triggerFlyAnimation = (e, imgUrl) => {
    // Solo animar si existe el widget mobile (si no está, no animamos)
    const cartWidget = document.getElementById("mobile-cart-widget");
    if (!cartWidget) return;

    // Coordenadas inicio (botón clickeado o el mismo evento)
    const startRect = e.target.getBoundingClientRect();
    const startX = startRect.left + startRect.width / 2;
    const startY = startRect.top + startRect.height / 2;

    // Coordenadas fin (widget carrito mobile)
    const endRect = cartWidget.getBoundingClientRect();
    const endX = endRect.left + endRect.width / 2;
    const endY = endRect.top + endRect.height / 2;

    // Crear elemento volador (clon visual)
    const flyer = document.createElement("img");
    flyer.src = imgUrl;
    flyer.style.position = "fixed";
    flyer.style.left = `${startX}px`;
    flyer.style.top = `${startY}px`;
    flyer.style.width = "50px";
    flyer.style.height = "50px";
    flyer.style.borderRadius = "50%";
    flyer.style.objectFit = "cover";
    flyer.style.zIndex = "9999";
    flyer.style.pointerEvents = "none";
    flyer.style.transition = "all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)"; // Efecto "rápido al inicio, suave al final"
    flyer.style.transform = "translate(-50%, -50%) scale(1)";
    flyer.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)";

    document.body.appendChild(flyer);

    // Forzar reflow y activar la transición
    requestAnimationFrame(() => {
      flyer.style.left = `${endX}px`;
      flyer.style.top = `${endY}px`;
      flyer.style.transform = "translate(-50%, -50%) scale(0.2)"; // Se achica al llegar
      flyer.style.opacity = "0.7";
    });

    // Limpieza al terminar
    setTimeout(() => {
      if (flyer.parentNode) flyer.parentNode.removeChild(flyer);
    }, 600);
  };

  const renderProductCard = (item) => (
    <div key={item.id} className="card mb-3 menu-product-card shadow-sm">
      <div className="row g-0 align-items-center">
        {/* FOTO */}
        <div className="col-3">
          <img
            src={item.img}
            alt={item.name}
            className="img-fluid rounded-start"
            style={{
              objectFit: "cover",
              width: "100%",
              height: "80px",
            }}
          />
        </div>

        {/* CONTENIDO */}
        <div className="col-9">
          <div className="card-body py-2 d-flex justify-content-between align-items-start gap-2">
            <div>
              <h6 className="card-title mb-1 fw-semibold">{item.name}</h6>
              {item.description && (
                <p className="card-text mb-1 small text-muted">
                  {item.description}
                </p>
              )}
              <div className="fw-bold">${item.price}</div>
            </div>

            <div className="text-end">
              <button
                className="btn btn-success btn-sm"
                disabled={isClosed}
                onClick={(e) => {
                  triggerFlyAnimation(e, item.img);
                  onAddToCart(item);
                }}
              >
                {isClosed ? "Cerrado" : "Agregar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section id="menu" className="py-4 bg-light">
      <div className="container-fluid px-3 px-lg-4">
        <h2 className="mb-3 text-center text-dark">Menú</h2>

        {/* === LISTA DE CATEGORÍAS (ESTILO APP) – SOLO MOBILE === */}
        <div className="d-md-none mb-3 menu-category-strip">
          {categories.map((cat) => {
            const isActive = openCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleToggleCategory(cat.id)}
                className={`menu-category-pill ${isActive ? "menu-category-pill-active" : ""
                  }`}
              >
                <span className="flex-grow-1 text-start">
                  <span className="d-block fw-semibold text-dark">{cat.label}</span>
                  <small className="text-muted">
                    {cat.products.length} producto
                    {cat.products.length !== 1 ? "s" : ""}
                  </small>
                </span>
                <span className="menu-cat-icon text-dark">
                  {isActive ? "−" : "+"}
                </span>
              </button>
            );
          })}
        </div>

        {/* === PRODUCTOS POR CATEGORÍA === */}
        {categories.map((cat) => {
          const isOpenMobile = openCategory === cat.id;

          return (
            <div
              key={cat.id}
              className="mb-4"
              ref={(el) => (categoryRefs.current[cat.id] = el)} // ref en el contenedor de la categoría
            >
              {/* Título de categoría (solo desktop) */}
              <div className="d-none d-md-flex align-items-baseline mb-2">
                <h4 className="me-2 mb-0 text-dark">{cat.label}</h4>
                <small className="text-muted">
                  {cat.products.length} producto
                  {cat.products.length !== 1 ? "s" : ""}
                </small>
              </div>

              {/* MOBILE: contenedor con animación de apertura/cierre */}
              <div
                className={`d-md-none menu-category-collapse ${isOpenMobile ? "show" : ""
                  }`}
              >
                {cat.products.map((item) => renderProductCard(item))}
              </div>

              {/* DESKTOP: siempre visibles todas las categorías */}
              <div className="d-none d-md-block">
                {cat.products.map((item) => renderProductCard(item))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
