// csr.js — Renderizado en el cliente (CSR)
const contenedorCatalogo = document.getElementById("catalogo");

fetch("catalogo.json")
  .then((respuesta) => respuesta.json())
  .then((productos) => {
    contenedorCatalogo.innerHTML = "";
    contenedorCatalogo.removeAttribute("aria-busy");
    contenedorCatalogo.removeAttribute("aria-label");

    productos.forEach((producto) => {
      const tarjeta = document.createElement("div");
      tarjeta.className = "producto";
      tarjeta.innerHTML = `
        <img class="producto__foto" src="${producto.imagen}" alt="${producto.nombre}" loading="lazy">
        <strong>${producto.nombre}</strong>
        <span class="precio">$${producto.precio}</span>
        <p>Stock: ${producto.stock}</p>
        <button type="button" data-id="${producto.id}">Agregar</button>
      `;
      contenedorCatalogo.appendChild(tarjeta);

      tarjeta.querySelector("button").addEventListener("click", () => {
        if (typeof agregarAlCarrito === "function") agregarAlCarrito(producto);
      });
    });
  })
  .catch((error) => {
    contenedorCatalogo.innerHTML = "<p>No se pudo cargar el catálogo. Intenta más tarde.</p>";
    console.error("Error al cargar catálogo:", error);
  });