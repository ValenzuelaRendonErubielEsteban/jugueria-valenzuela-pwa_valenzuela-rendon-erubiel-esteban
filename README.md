# Juguería Valenzuela — PWA de ventas

PWA de ventas de la Unidad 2 (Aplicaciones Web Progresivas): catálogo de jugos, licuados y smoothies cargado con fetch() desde catalogo.json, carrito con localStorage, funcionamiento sin conexión, notificaciones y ruta hasta la sucursal.

## Identificación
- Alumno: VALENZUELA RENDON ERUBIEL ESTEBAN
- Grupo: ING10-1
- Negocio: Juguería Valenzuela
- Giro: Juguería
- URL del repositorio: https://github.com/ValenzuelaRendonErubielEsteban/jugueria-valenzuela-pwa_valenzuela-rendon-erubiel-esteban
- URL de GitHub Pages: https://valenzuelarendonerubielesteban.github.io/jugueria-valenzuela-pwa_valenzuela-rendon-erubiel-esteban/

## Historial de avances
| Avance | Hash del commit entregado | Fecha |
|---|---|---|
| 1 | be5e7c1 | 11/10/2026 |
| 2 | d66d2b7 | 16/10/2026 |
| 3 | 10aaef3 | 25/10/2026 |
| 4 | (se escribe en el reporte PDF) | 01/11/2026 |

## Comparación SSR vs CSR

### SSR (Django): los productos llegan escritos en el HTML
![Código fuente SSR](docs/captura-ssr.png)

### CSR (JavaScript): el div del catálogo llega vacío
![Código fuente CSR](docs/captura-csr.png)

## Funciones PWA (avance 3)

### index.html: manifest y registro del Service Worker activos
![Código fuente index.html](docs/captura-index-pwa.png)

### sw.js: Workbox precachea el catálogo y las fotos
![Código fuente sw.js](docs/captura-sw.png)

## Guía de instalación

La app se abre desde cualquier navegador y también se puede instalar como si fuera una app normal.

### Abrirla
1. Entra a https://valenzuelarendonerubielesteban.github.io/jugueria-valenzuela-pwa_valenzuela-rendon-erubiel-esteban/
2. Espera a que aparezca el catálogo. La primera vez necesita internet para guardar todo en el teléfono.

### Instalarla en Android (Chrome)
1. Toca el menú ⋮ de Chrome.
2. Elige **Instalar app** (o **Agregar a la pantalla principal**) y toca **Instalar**.
3. Busca el ícono de la juguería en tu pantalla de inicio y ábrelo: se ve en pantalla completa, sin barra de direcciones.

### Instalarla en iPhone (Safari)
1. Toca el botón **Compartir**.
2. Elige **Agregar a inicio** y toca **Agregar**.

### Instalarla en computadora (Chrome o Edge)
1. Haz clic en el ícono de instalar que aparece al final de la barra de direcciones.
2. Confirma con **Instalar**.

### Usarla
1. Filtra el catálogo por categoría y toca la foto de un producto para verla en grande.
2. Pulsa **Agregar** (o **Agregar al carrito** en el producto estrella) y ajusta cantidades con **+** y **−** en el carrito.
3. Activa las notificaciones con el botón del carrito para recibir avisos de tu pedido.
4. Pulsa **Ver mi distancia a la sucursal** para ver la ruta y el tiempo en auto.
5. Sin internet la app sigue abriendo: el catálogo y tu carrito se guardan y se sincronizan al volver la conexión.

### Si no aparece la opción de instalar
- Entra por la dirección https:// de GitHub Pages (no por Live Server).
- Recarga la página una vez con internet y vuelve a abrir el menú.

## Cómo probarla
1. Abre la carpeta en VS Code y usa **Open with Live Server** sobre `index.html`.
2. En DevTools → Application → Service Workers debe aparecer `sw.js` como *activated and is running*.
3. Marca **Offline** y recarga: el catálogo y las fotos siguen apareciendo.
4. Instálala desde el ícono de instalar de la barra de direcciones (computadora) o desde el menú ⋮ → *Instalar aplicación* (Android).

## Qué incluye
- Catálogo con filtro por categoría y producto estrella.
- Carrito con cantidades, total y fotos, guardado en `localStorage`; se sincroniza al volver la conexión.
- Notificaciones del navegador (botón que pide permiso).
- Ubicación del cliente con ruta por calles hasta la sucursal (Leaflet + OSRM).
- Service Worker generado con Workbox y `manifest.json` con íconos de 192 y 512 px.