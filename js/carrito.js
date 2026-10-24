// carrito.js — Almacenamiento local y "sincronización" offline/online
// Aquí usamos localStorage: una caja de guardado que vive DENTRO del navegador
// y sobrevive aunque cierres la pestaña o se vaya el internet.

const CLAVE_CARRITO = "jugueria-valenzuela-carrito";
let ultimoItemCarrito = null; // id del último producto que cambió (solo para la animación)
const CLAVE_PENDIENTE = "jugueria-valenzuela-pendiente"; // "1" si hay cambios sin sincronizar

// Lee el carrito guardado en localStorage (si no hay nada, regresa un array vacío)
function leerCarrito() {
  const guardado = localStorage.getItem(CLAVE_CARRITO); // localStorage solo guarda texto
  return guardado ? JSON.parse(guardado) : []; // JSON.parse convierte ese texto de vuelta a un array
}

// Guarda el array del carrito en localStorage (JSON.stringify lo convierte a texto)
function guardarCarrito(carrito) {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
  // Si no hay internet, marcamos que el carrito quedó pendiente de enviar
  if (!navigator.onLine) localStorage.setItem(CLAVE_PENDIENTE, "1");
}

// Agrega un producto al carrito (o le sube la cantidad si ya estaba)
function agregarAlCarrito(producto) {
  const carrito = leerCarrito();
  const existente = carrito.find((item) => item.id === producto.id);
  ultimoItemCarrito = producto.id; // para resaltarlo al dibujar el carrito

  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ id: producto.id, nombre: producto.nombre, precio: producto.precio, imagen: producto.imagen, cantidad: 1 });
  }

  guardarCarrito(carrito);
  pintarCarrito();

  // Notificación útil (solo se muestra si el cliente dio permiso)
  if (typeof mostrarNotificacion === "function") {
    mostrarNotificacion("Pedido agregado", `${producto.nombre} se agregó a tu carrito.`);
  }
}

// Sube o baja la cantidad de un producto con los botones +/-;
// si la cantidad llega a 0, el producto se quita solo.
function cambiarCantidad(id, delta) {
  const carrito = leerCarrito();
  const item = carrito.find((item) => item.id === id);
  if (!item) return;
  ultimoItemCarrito = id;

  item.cantidad += delta;
  const actualizado = item.cantidad <= 0 ? carrito.filter((item) => item.id !== id) : carrito;

  guardarCarrito(actualizado);
  pintarCarrito();
}

// Quita un producto del carrito sin importar su cantidad
function quitarDelCarrito(id) {
  const carrito = leerCarrito().filter((item) => item.id !== id);
  guardarCarrito(carrito);
  pintarCarrito();
}

// Dibuja el carrito en pantalla a partir de lo que hay en localStorage
function pintarCarrito() {
  const carrito = leerCarrito();
  const lista = document.getElementById("carrito-lista");
  const total = document.getElementById("carrito-total");
  const contador = document.getElementById("carrito-contador"); // número del botón del encabezado

  lista.innerHTML = "";
  let suma = 0;
  let unidades = 0;

  if (carrito.length === 0) {
    lista.innerHTML = '<li class="carrito__vacio">🌿 Tu carrito está vacío. Agrega una bebida del catálogo.</li>';
  }

  carrito.forEach((item) => {
    const subtotal = item.precio * item.cantidad;
    suma += subtotal;
    unidades += item.cantidad;

    // foto del producto: la guardada, o (carritos viejos) la del catálogo ya dibujado
    const foto = item.imagen ||
      document.querySelector(`#catalogo button[data-id="${item.id}"]`)?.closest(".producto")?.querySelector("img")?.getAttribute("src") || "";

    const li = document.createElement("li");
    if (item.id === ultimoItemCarrito) li.className = "carrito-item--nuevo";
    li.innerHTML = `
      <img class="carrito-foto" src="${foto}" alt="" width="56" height="56" onerror="this.style.visibility='hidden'">
      <span class="carrito-nombre">${item.nombre}</span>
      <span class="carrito-cantidad">
        <button type="button" data-accion="restar" data-id="${item.id}" aria-label="Quitar una unidad de ${item.nombre}">−</button>
        <span class="carrito-cantidad__valor">${item.cantidad}</span>
        <button type="button" data-accion="sumar" data-id="${item.id}" aria-label="Agregar una unidad de ${item.nombre}">+</button>
      </span>
      <span class="carrito-precio">$${subtotal}</span>
      <button type="button" class="carrito-quitar" data-accion="quitar" data-id="${item.id}">Quitar</button>
    `;
    lista.appendChild(li);
  });

  ultimoItemCarrito = null;
  total.textContent = suma;
  if (contador) contador.textContent = unidades;
}

// Un solo listener en <ul id="carrito-lista"> atiende los clics de TODOS los
// botones +/-/Quitar (delegación de eventos), incluso los que se crean después.
function manejarClicCarrito(evento) {
  const boton = evento.target.closest("button[data-accion]");
  if (!boton) return;

  const id = Number(boton.dataset.id);
  if (boton.dataset.accion === "sumar") cambiarCantidad(id, 1);
  if (boton.dataset.accion === "restar") cambiarCantidad(id, -1);
  if (boton.dataset.accion === "quitar") quitarDelCarrito(id);
}

// "Sincronizar": en una app real esto haría un fetch() con method: "POST" al
// servidor. Aquí lo simulamos para enseñar el patrón offline -> online:
// offline marcamos el carrito como pendiente; al volver la conexión se "envía" y se avisa.
function sincronizarCarrito() {
  const mensaje = document.getElementById("carrito-mensaje");

  if (leerCarrito().length === 0) {
    mensaje.textContent = "Tu carrito está vacío: no hay nada que sincronizar.";
    return;
  }

  if (!navigator.onLine) {
    localStorage.setItem(CLAVE_PENDIENTE, "1");
    mensaje.textContent = "Sin conexión: el carrito se sincronizará cuando vuelva el internet.";
    return;
  }

  // Simulamos el envío al servidor
  localStorage.removeItem(CLAVE_PENDIENTE);
  mensaje.textContent = "Carrito sincronizado con el servidor (simulado). ✓";
  if (typeof mostrarNotificacion === "function") {
    mostrarNotificacion("Carrito sincronizado", "Tu pedido se envió correctamente.");
  }
}

// Al volver la conexión, solo sincroniza si había cambios pendientes
function alVolverConexion() {
  if (localStorage.getItem(CLAVE_PENDIENTE) === "1") {
    sincronizarCarrito();
  } else {
    document.getElementById("carrito-mensaje").textContent = "Conexión restablecida.";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  pintarCarrito();
  document.getElementById("carrito-lista").addEventListener("click", manejarClicCarrito);
  document.getElementById("btn-sincronizar").addEventListener("click", sincronizarCarrito);

  window.addEventListener("online", alVolverConexion);
  window.addEventListener("offline", () => {
    document.getElementById("carrito-mensaje").textContent = "Se perdió la conexión. Tus cambios se guardan y se enviarán al volver.";
  });
});