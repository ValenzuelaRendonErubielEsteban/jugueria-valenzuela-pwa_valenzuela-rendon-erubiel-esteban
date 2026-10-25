module.exports = {
	globDirectory: '.',
	globPatterns: [
		// jpg, jpeg y webp: las fotos de los productos
		'**/*.{js,html,json,svg,png,jpg,jpeg,webp,css}'
	],
	// Archivos que NO son parte de la app: no se precachean
	globIgnores: [
		'**/node_modules/**/*',
		'servidor-ssr*/**/*',
		'docs/**/*',
		'**/*.report.html',
		'reporte-lighthouse*.html',
		'workbox-config.js'
	],
	swDest: 'sw.js',
	// Activa el Service Worker nuevo de inmediato y toma control de las pestañas abiertas
	skipWaiting: true,
	clientsClaim: true,
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	],
	// Leaflet viene de un CDN: lo guardamos tras la primera visita para que el mapa también abra sin internet
	runtimeCaching: [
		{
			urlPattern: /^https:\/\/cdnjs\.cloudflare\.com\/.*/,
			handler: 'CacheFirst',
			options: {
				cacheName: 'cdn-leaflet',
				cacheableResponse: { statuses: [0, 200] },
				expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
			}
		}
	]
};