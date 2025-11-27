// src/config/clientConfig.js
export const clientConfig = {
  nombre: "Pizzería Don Pepe",          // Nombre del local
  tipo: "pizzeria",                     // pizzeria | hamburgueseria | heladeria | etc.

  whatsapp: "+5491162123307",           // Teléfono del negocio (formato internacional)

  logo: "/images/logopizza.png",    // Ruta dentro de /public (ej: public/images/logo-pizzeria.png)

  colores: {
    primario: "#e63946",
    secundario: "#1d3557",
    textoClaro: "#ffffff",
  },

  hero: {
    fondo: "/images/fondopizza.png",   // Imagen de fondo (ponela en /public/images/)
  },
  // 🔔 NUEVO: configuración de horario
  //horario: {
    //enabled: true, // si lo ponés en false, se desactiva el modo cerrado
   // apertura: "14:00", // hora de apertura (24 hs)
    //cierre: "23:30",   // hora de cierre  (24 hs)
    //mensajeCerrado:
      //"Ahora estamos cerrados. Nuestro horario: de 19:00 a 23:30 hs.",
  //},
};
