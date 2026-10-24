// geolocalizacion.js — Paso 16: ubicación del cliente y distancia a la sucursal

// ⚠️ CAMBIA estas coordenadas por las de TU sucursal
// (Google Maps → clic derecho sobre tu punto → copia las coordenadas)
const SUCURSAL = { nombre: "Juguería Valenzuela", lat: 29.0729, lng: -110.9559 };

let mapa = null;
let marcadorCliente = null;
let lineaRuta = null;

// Distancia en km entre dos puntos (fórmula de Haversine)
function distanciaKm(lat1, lng1, lat2, lng2) {
  const aRad = (grados) => (grados * Math.PI) / 180;
  const R = 6371; // radio de la Tierra en km
  const dLat = aRad(lat2 - lat1);
  const dLng = aRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRad(lat1)) * Math.cos(aRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Crea el mapa con Leaflet (si no cargó, por ejemplo sin internet, la app sigue funcionando)
function iniciarMapa() {
  const contenedor = document.getElementById("mapa");
  if (!contenedor) return;

  if (typeof L === "undefined") {
    contenedor.textContent = "El mapa no está disponible sin conexión.";
    return;
  }

  mapa = L.map("mapa").setView([SUCURSAL.lat, SUCURSAL.lng], 14);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap",
  }).addTo(mapa);

  L.marker([SUCURSAL.lat, SUCURSAL.lng]).addTo(mapa).bindPopup(`<strong>${SUCURSAL.nombre}</strong><br>Nuestra sucursal`);
}

function mostrarUbicacion(posicion) {
  const { latitude, longitude } = posicion.coords;
  const km = distanciaKm(latitude, longitude, SUCURSAL.lat, SUCURSAL.lng);
  const texto = document.getElementById("ubicacion-texto");

  const ruta = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${SUCURSAL.lat},${SUCURSAL.lng}`;
  texto.innerHTML = `Estás a <strong>${km.toFixed(1)} km</strong> de la sucursal (en línea recta). <a href="${ruta}" target="_blank" rel="noopener">Ver ruta en Google Maps</a>`;

  if (mapa) {
    if (marcadorCliente) mapa.removeLayer(marcadorCliente);
    if (lineaRuta) mapa.removeLayer(lineaRuta);
    marcadorCliente = L.marker([latitude, longitude]).addTo(mapa).bindPopup("Tú estás aquí").openPopup();
    lineaRuta = L.polyline([[latitude, longitude], [SUCURSAL.lat, SUCURSAL.lng]], { color: "#f07010" }).addTo(mapa);
    mapa.fitBounds(lineaRuta.getBounds(), { padding: [40, 40] });
  }
}

function errorUbicacion(error) {
  const mensajes = {
    1: "No diste permiso para usar tu ubicación.",
    2: "No se pudo determinar tu ubicación.",
    3: "Tardó demasiado en obtener tu ubicación. Intenta de nuevo.",
  };
  document.getElementById("ubicacion-texto").textContent = mensajes[error.code] || "No se pudo obtener tu ubicación.";
}

function ubicarCliente() {
  const texto = document.getElementById("ubicacion-texto");
  if (!("geolocation" in navigator)) {
    texto.textContent = "Tu navegador no soporta geolocalización.";
    return;
  }
  texto.textContent = "Buscando tu ubicación…";
  navigator.geolocation.getCurrentPosition(mostrarUbicacion, errorUbicacion, {
    enableHighAccuracy: true,
    timeout: 10000,
  });
}

document.addEventListener("DOMContentLoaded", () => {
  iniciarMapa();
  const boton = document.getElementById("btn-ubicacion");
  if (boton) boton.addEventListener("click", ubicarCliente);
});