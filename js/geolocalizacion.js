const SUCURSAL = {
  nombre: "Juguería Valenzuela (sucursal UTH)",
  lat: 29.00921146687666,
  lon: -110.90377522502918,
};

let mapa = null;     
let capaRuta = null; 

function calcularDistanciaKm(lat1, lon1, lat2, lon2) {
  const aRadianes = (grados) => (grados * Math.PI) / 180;
  const R = 6371; 
  const dLat = aRadianes(lat2 - lat1);
  const dLon = aRadianes(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRadianes(lat1)) * Math.cos(aRadianes(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function obtenerRuta(origenLat, origenLon) {
  const url =
    "https://router.project-osrm.org/route/v1/driving/" +
    `${origenLon},${origenLat};${SUCURSAL.lon},${SUCURSAL.lat}` +
    "?overview=full&geometry=geojson";

  const control = new AbortController();
  const limite = setTimeout(() => control.abort(), 8000); 
  try {
    const respuesta = await fetch(url, { signal: control.signal });
    const datos = await respuesta.json();
    if (datos.code !== "Ok") return null;

    const ruta = datos.routes[0];
    return {
      coords: ruta.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
      distanciaKm: ruta.distance / 1000,
      duracionMin: ruta.duration / 60,
    };
  } catch (error) {
    console.warn("No se pudo calcular la ruta por calles:", error.message);
    return null;
  } finally {
    clearTimeout(limite);
  }
}

function iniciarMapa() {
  const contenedor = document.getElementById("mapa");
  if (!contenedor) return;

  if (typeof L === "undefined") {
    contenedor.textContent = "El mapa no está disponible sin conexión.";
    return;
  }

  mapa = L.map(contenedor).setView([SUCURSAL.lat, SUCURSAL.lon], 15);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; colaboradores de OpenStreetMap",
  }).addTo(mapa);
  capaRuta = L.layerGroup().addTo(mapa);

  L.marker([SUCURSAL.lat, SUCURSAL.lon]).addTo(mapa).bindPopup(`<strong>${SUCURSAL.nombre}</strong>`);
}

function dibujarRuta(lat, lon, coordsRuta) {
  if (!mapa) return;
  capaRuta.clearLayers();

  const hayRuta = Array.isArray(coordsRuta) && coordsRuta.length > 0;
  const punto = [lat, lon];
  const sucursal = [SUCURSAL.lat, SUCURSAL.lon];

  L.marker(punto).addTo(capaRuta).bindPopup("Tú estás aquí").openPopup();
  L.polyline(
    hayRuta ? coordsRuta : [punto, sucursal],
    hayRuta ? { color: "#34503a", weight: 5 } : { color: "#b4532a", weight: 3, dashArray: "6 6" }
  ).addTo(capaRuta);

  mapa.fitBounds(L.latLngBounds([punto, sucursal]), { padding: [30, 30] });
}

function ubicarCliente() {
  const texto = document.getElementById("ubicacion-texto");

  if (!("geolocation" in navigator)) {
    texto.textContent = "Este dispositivo no reporta ubicación.";
    return;
  }
  texto.textContent = "Buscando tu ubicación…";

  navigator.geolocation.getCurrentPosition(
    async (posicion) => {
      const { latitude, longitude } = posicion.coords;
      const enlace =
        `https://www.openstreetmap.org/directions?from=${latitude}%2C${longitude}` +
        `&to=${SUCURSAL.lat}%2C${SUCURSAL.lon}`;

      texto.textContent = "Calculando la ruta hasta la sucursal…";
      const ruta = await obtenerRuta(latitude, longitude);
      dibujarRuta(latitude, longitude, ruta ? ruta.coords : null);

      if (ruta) {
        texto.innerHTML =
          `Ruta hasta ${SUCURSAL.nombre}: <strong>${ruta.distanciaKm.toFixed(1)} km</strong> · ` +
          `~${Math.round(ruta.duracionMin)} min en auto. ` +
          `<a href="${enlace}" target="_blank" rel="noopener">Abrir en el mapa</a>`;
      } else {
        const km = calcularDistanciaKm(latitude, longitude, SUCURSAL.lat, SUCURSAL.lon);
        texto.innerHTML =
          `No se pudo calcular la ruta por calles; en línea recta estás a <strong>${km.toFixed(1)} km</strong> ` +
          `de ${SUCURSAL.nombre}. <a href="${enlace}" target="_blank" rel="noopener">Abrir en el mapa</a>`;
      }
    },
    (error) => {
      texto.textContent = "No se pudo obtener tu ubicación: " + error.message;
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

document.addEventListener("DOMContentLoaded", () => {
  iniciarMapa();
  const boton = document.getElementById("btn-ubicacion");
  if (boton) boton.addEventListener("click", ubicarCliente);
});