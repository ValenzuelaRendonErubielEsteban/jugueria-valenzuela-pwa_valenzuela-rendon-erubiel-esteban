// csr.js — Renderizado en el Cliente (CSR) + filtro por categoría
// El HTML llega sin productos; este archivo, ya en el navegador, los construye.

// 1) Buscamos el contenedor del catálogo que dejamos en index.html
const contenedorCatalogo = document.getElementById("catalogo");

// 2) fetch() le pide catalogo.json al servidor (aquí simula una API real)
fetch("catalogo.json")
  .then((respuesta) => respuesta.json()) // convierte el texto recibido en un array de objetos JS
  .then((productos) => {
    // 3) Ya tenemos los productos: borramos las tarjetas esqueleto y dibujamos las reales
    contenedorCatalogo.innerHTML = "";
    contenedorCatalogo.removeAttribute("aria-busy");
    contenedorCatalogo.removeAttribute("aria-label");

    productos.forEach((producto) => {
      const tarjeta = document.createElement("div");
      tarjeta.className = "producto";
      tarjeta.dataset.categoria = producto.categoria; // queda como data-categoria="..." en el HTML

      tarjeta.innerHTML = `
        <img class="producto__foto" src="${producto.imagen}" alt="${producto.nombre}" loading="lazy">
        <strong>${producto.nombre}</strong>
        <span class="precio">$${producto.precio}</span>
        <p>Stock: ${producto.stock}</p>
        <button type="button" data-id="${producto.id}">Agregar</button>
      `;

      contenedorCatalogo.appendChild(tarjeta);

      // conectamos el botón con la función agregarAlCarrito() de carrito.js
      const boton = tarjeta.querySelector("button");
      boton.addEventListener("click", () => {
        agregarAlCarrito(producto);
        boton.textContent = "Agregado";
        boton.classList.add("agregado");
        setTimeout(() => {
          boton.textContent = "Agregar";
          boton.classList.remove("agregado");
        }, 800);
      });
    });

    crearFiltros(productos);
  })
  .catch((error) => {
    contenedorCatalogo.innerHTML = "<p>No se pudo cargar el catálogo. Intenta más tarde.</p>";
    contenedorCatalogo.removeAttribute("aria-busy");
    contenedorCatalogo.removeAttribute("aria-label");
    console.error("Error al cargar catálogo:", error);
  });

// Crea los botones de categoría encima del catálogo y oculta las tarjetas que no coinciden
function crearFiltros(productos) {
  // Lista de categorías sin repetir, en el orden en que aparecen en catalogo.json
  const categorias = [...new Set(productos.map((p) => p.categoria))];

  const barra = document.createElement("div");
  barra.className = "filtros";
  barra.setAttribute("role", "group");
  barra.setAttribute("aria-label", "Filtrar por categoría");

  ["Todos", ...categorias].forEach((categoria) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "filtro";
    boton.textContent = categoria;
    boton.setAttribute("aria-pressed", categoria === "Todos" ? "true" : "false");

    boton.addEventListener("click", () => {
      // marcamos el botón activo
      barra.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", "false"));
      boton.setAttribute("aria-pressed", "true");
      // mostramos u ocultamos cada tarjeta según su data-categoria
      contenedorCatalogo.querySelectorAll(".producto").forEach((tarjeta) => {
        tarjeta.hidden = categoria !== "Todos" && tarjeta.dataset.categoria !== categoria;
      });
    });

    barra.appendChild(boton);
  });

  // la barra va justo antes del contenedor del catálogo
  contenedorCatalogo.before(barra);
}