// notificaciones.js — Paso 15: pedir permiso y mostrar notificaciones

// Muestra en pantalla el estado actual del permiso
function actualizarEstadoNotificaciones() {
  const estado = document.getElementById("notif-estado");
  const boton = document.getElementById("btn-notificaciones");
  if (!estado || !boton) return;

  if (!("Notification" in window)) {
    estado.textContent = "Tu navegador no soporta notificaciones.";
    boton.disabled = true;
  } else if (Notification.permission === "granted") {
    estado.textContent = "Notificaciones activadas ✓";
    boton.disabled = true;
  } else if (Notification.permission === "denied") {
    estado.textContent = "Bloqueaste las notificaciones. Actívalas desde el candado de la barra de direcciones.";
    boton.disabled = true;
  } else {
    estado.textContent = "Activa las notificaciones para enterarte de tus pedidos.";
  }
}

// Se llama SOLO desde el clic del botón (los navegadores exigen un gesto del usuario)
async function pedirPermisoNotificaciones() {
  if (!("Notification" in window)) return;
  const permiso = await Notification.requestPermission();
  actualizarEstadoNotificaciones();
  if (permiso === "granted") {
    mostrarNotificacion("¡Listo!", "Ahora te avisaremos de tus pedidos en Juguería Valenzuela.");
  }
}

// Muestra una notificación. Si ya hay Service Worker usa showNotification()
// (necesario en Android); si no, cae a new Notification() (escritorio).
async function mostrarNotificacion(titulo, cuerpo) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const opciones = {
    body: cuerpo,
    icon: "img/logo-icono.png",
    tag: "jugueria-valenzuela",
  };

  try {
    const registro = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : null;
    if (registro) {
      await registro.showNotification(titulo, opciones);
    } else {
      new Notification(titulo, opciones);
    }
  } catch (error) {
    console.warn("No se pudo mostrar la notificación:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  actualizarEstadoNotificaciones();
  const boton = document.getElementById("btn-notificaciones");
  if (boton) boton.addEventListener("click", pedirPermisoNotificaciones);
});