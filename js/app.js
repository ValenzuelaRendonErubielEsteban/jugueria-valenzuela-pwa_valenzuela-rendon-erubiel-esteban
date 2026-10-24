// app.js — indicador "conectado / sin conexión"

function actualizarEstadoConexion() {
  const indicador = document.getElementById("estado-conexion");
  if (!indicador) return;
  const enLinea = navigator.onLine;
  indicador.textContent = enLinea ? "● Conectado" : "● Sin conexión";
  indicador.classList.toggle("estado-conexion--offline", !enLinea);
}

window.addEventListener("online", actualizarEstadoConexion);
window.addEventListener("offline", actualizarEstadoConexion);
document.addEventListener("DOMContentLoaded", actualizarEstadoConexion);