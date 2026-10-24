// interactivo.js — microinteracciones: producto estrella, fotos interactivas,
// visor de imagen, vuelo al carrito y avisos. Solo "observa" lo que ya hacen
// csr.js y carrito.js; no cambia la lógica de la tienda.
(() => {
  const $ = (selector) => document.querySelector(selector);
  const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ⭐ Cambia este número por el id (catalogo.json) de TU producto estrella
  const ESTRELLA_ID = 1;

  const catalogo = $("#catalogo");

  // ---------- 1) Sombra del encabezado al hacer scroll ----------
  const barra = $(".appbar");
  const alHacerScroll = () => barra && barra.classList.toggle("appbar--sombra", window.scrollY > 8);
  window.addEventListener("scroll", alHacerScroll, { passive: true });
  alHacerScroll();

  // ---------- 2) Hojas flotando en la portada (decorativas) ----------
  const portada = $(".portada");
  if (portada) {
    [["🍃", "47%", "10%", "0s"]].forEach(([hoja, x, y, d]) => {
      const span = document.createElement("span");
      span.className = "fruta-flota";
      span.setAttribute("aria-hidden", "true");
      span.textContent = hoja;
      span.style.cssText = `left:${x};top:${y};animation-delay:${d}`;
      portada.appendChild(span);
    });
  }

  // ---------- 3) Avisos (toasts) ----------
  const contenedorAvisos = document.createElement("div");
  contenedorAvisos.className = "toasts";
  contenedorAvisos.setAttribute("role", "status");
  contenedorAvisos.setAttribute("aria-live", "polite");
  document.body.appendChild(contenedorAvisos);

  function aviso(texto, icono = "🧃") {
    while (contenedorAvisos.children.length >= 3) contenedorAvisos.firstChild.remove();
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `<span aria-hidden="true">${icono}</span><span></span>`;
    el.lastChild.textContent = texto; // textContent: no inserta HTML del nombre
    contenedorAvisos.appendChild(el);
    setTimeout(() => {
      el.classList.add("toast--salir");
      el.addEventListener("animationend", () => el.remove(), { once: true });
    }, 2400);
  }

  // ---------- 4) La foto "vuela" hasta el botón del carrito ----------
  const visible = (el) => el && el.getBoundingClientRect().width > 0;

  function volarAlCarrito(imagen) {
    const destino = $(".carrito-btn");
    if (sinMovimiento || !visible(imagen) || !destino || !imagen.animate) return;
    const a = imagen.getBoundingClientRect();
    const b = destino.getBoundingClientRect();
    const copia = imagen.cloneNode();
    copia.className = "volando";
    copia.style.cssText = `left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${a.height}px`;
    document.body.appendChild(copia);
    copia.animate(
      [
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: `translate(${b.left + b.width / 2 - a.left - a.width / 2}px, ${b.top + b.height / 2 - a.top - a.height / 2}px) scale(.08)`, opacity: .3 },
      ],
      { duration: 700, easing: "cubic-bezier(.5,0,.75,0)" }
    ).onfinish = () => copia.remove();
  }

  // Un solo listener atiende "Agregar" de todas las tarjetas (y de la estrella, que las reutiliza)
  if (catalogo) {
    catalogo.addEventListener("click", (evento) => {
      const boton = evento.target.closest(".producto button");
      if (!boton) return;
      const tarjeta = boton.closest(".producto");
      aviso(`${tarjeta.querySelector("strong").textContent} agregado al carrito`, "🛒");
      const foto = tarjeta.querySelector(".producto__foto");
      volarAlCarrito(visible(foto) ? foto : $("#estrella-media img")); // si la tarjeta está oculta por el filtro, vuela la de la estrella
    });
  }

  // ---------- 5) Rebote del contador y del total ----------
  function rebotarAlCambiar(selector) {
    const el = $(selector);
    if (!el) return;
    let anterior = el.textContent;
    new MutationObserver(() => {
      if (el.textContent === anterior) return;
      anterior = el.textContent;
      const objetivo = el.closest(".carrito__total") || el;
      objetivo.classList.remove("bump");
      void objetivo.offsetWidth; // reinicia la animación
      objetivo.classList.add("bump");
    }).observe(el, { childList: true, characterData: true, subtree: true });
  }
  rebotarAlCambiar("#carrito-contador");
  rebotarAlCambiar("#carrito-total");

  // ---------- 6) Vaciar carrito ----------
  const btnVaciar = $("#btn-vaciar");
  if (btnVaciar) {
    btnVaciar.addEventListener("click", () => {
      if (leerCarrito().length === 0) return;
      guardarCarrito([]);
      pintarCarrito();
      aviso("Carrito vaciado", "🗑️");
    });
  }

  // ---------- 7) Visor de imagen (clic en cualquier foto) ----------
  const visor = document.createElement("dialog");
  visor.className = "visor";
  visor.innerHTML = `
    <button type="button" class="visor__cerrar" aria-label="Cerrar">✕</button>
    <img class="visor__foto" alt="">
    <div class="visor__info"><strong></strong><span class="visor__precio"></span>
      <button type="button" class="visor__agregar">Agregar al carrito</button></div>`;
  document.body.appendChild(visor);
  let botonDelVisor = null;

  function abrirVisor(foto, nombre, precio, boton) {
    visor.querySelector(".visor__foto").src = foto.currentSrc || foto.src;
    visor.querySelector(".visor__foto").alt = nombre;
    visor.querySelector("strong").textContent = nombre;
    visor.querySelector(".visor__precio").textContent = precio;
    botonDelVisor = boton;
    visor.showModal();
  }
  visor.addEventListener("click", (e) => { if (e.target === visor || e.target.closest(".visor__cerrar")) visor.close(); });
  visor.querySelector(".visor__agregar").addEventListener("click", () => { if (botonDelVisor) botonDelVisor.click(); visor.close(); });

  document.addEventListener("click", (e) => {
    const foto = e.target.closest(".producto__foto, .estrella__media img");
    if (!foto || foto.tagName !== "IMG") return;
    const tarjeta = foto.closest(".producto");
    const nombre = tarjeta ? tarjeta.querySelector("strong").textContent : $("#estrella-nombre").textContent;
    const precio = (tarjeta || $("#estrella")).querySelector(".precio").textContent;
    abrirVisor(foto, nombre, precio, tarjeta ? tarjeta.querySelector("button") : $("#estrella-agregar"));
  });

  // ---------- 8) Inclinación suave de las fotos con el mouse ----------
  document.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || sinMovimiento) return;
    const media = e.target.closest && e.target.closest(".producto__media, .estrella__media");
    if (!media) return;
    const r = media.getBoundingClientRect();
    media.style.setProperty("--rx", `${(-((e.clientY - r.top) / r.height - .5) * 9).toFixed(1)}deg`);
    media.style.setProperty("--ry", `${(((e.clientX - r.left) / r.width - .5) * 11).toFixed(1)}deg`);
  });
  document.addEventListener("pointerout", (e) => {
    const media = e.target.closest && e.target.closest(".producto__media, .estrella__media");
    if (media && !media.contains(e.relatedTarget)) { media.style.removeProperty("--rx"); media.style.removeProperty("--ry"); }
  });

  // ---------- 9) Tarjetas: foto con precio encima, insignias y entrada escalonada ----------
  function llenarEstrella(tarjeta) {
    const media = $("#estrella-media");
    if (!media || media.firstChild) return;
    const foto = tarjeta.querySelector(".producto__foto").cloneNode();
    foto.className = "estrella__foto";
    foto.removeAttribute("loading");
    media.append(foto);
    const precio = document.createElement("span");
    precio.className = "precio";
    precio.textContent = tarjeta.querySelector(".precio").textContent;
    media.append(precio);
    $("#estrella-nombre").textContent = tarjeta.querySelector("strong").textContent;
    const boton = $("#estrella-agregar");
    boton.disabled = false;
    boton.addEventListener("click", () => tarjeta.querySelector("button").click());
  }

  function mejorarTarjetas() {
    if (!catalogo) return;
    catalogo.querySelectorAll(".producto:not(.producto--cargando):not([data-mejorado])").forEach((tarjeta, i) => {
      tarjeta.dataset.mejorado = "1";
      tarjeta.style.setProperty("--i", i);

      // foto + precio dentro de un mismo contenedor: el precio queda sobre la imagen
      const foto = tarjeta.querySelector(".producto__foto");
      const precio = tarjeta.querySelector(".precio");
      const media = document.createElement("div");
      media.className = "producto__media";
      foto.replaceWith(media);
      media.append(foto);
      if (precio) media.append(precio);

      const stock = Number((tarjeta.querySelector("p")?.textContent.match(/(\d+)/) || [])[1]);
      if (stock <= 10) {
        const insignia = document.createElement("span");
        insignia.className = "insignia" + (stock === 0 ? " insignia--agotado" : "");
        insignia.textContent = stock === 0 ? "Agotado" : `¡Últimos ${stock}!`;
        media.prepend(insignia);
      }

      if (Number(tarjeta.querySelector("button").dataset.id) === ESTRELLA_ID) {
        tarjeta.classList.add("producto--estrella");
        llenarEstrella(tarjeta);
      }
    });
    if (typeof pintarCarrito === "function") pintarCarrito(); // ya hay fotos: actualiza las miniaturas del carrito
  }
  if (catalogo) {
    new MutationObserver(mejorarTarjetas).observe(catalogo, { childList: true });
    mejorarTarjetas();
  }

  // ---------- 10) Secciones de abajo aparecen suavemente ----------
  if ("IntersectionObserver" in window) {
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add("visible");
        observador.unobserve(entrada.target);
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".nosotros, .carrito, .ubicacion").forEach((seccion) => {
      seccion.classList.add("reveal");
      observador.observe(seccion);
    });
  }

  // ---------- 11) Portada: profundidad con el mouse ----------
  if (portada && !sinMovimiento) {
    portada.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const r = portada.getBoundingClientRect();
      portada.style.setProperty("--px", ((e.clientX - r.left) / r.width - .5).toFixed(2));
      portada.style.setProperty("--py", ((e.clientY - r.top) / r.height - .5).toFixed(2));
    });
    portada.addEventListener("pointerleave", () => {
      portada.style.setProperty("--px", 0);
      portada.style.setProperty("--py", 0);
    });
  }

  // ---------- 12) Números de la portada que "cuentan" al verse ----------
  document.querySelectorAll("[data-contar]").forEach((el) => {
    if (sinMovimiento || !("IntersectionObserver" in window)) return;
    const meta = Number(el.dataset.contar);
    const sufijo = el.dataset.sufijo || "";
    el.textContent = 0 + sufijo;
    const obs = new IntersectionObserver(([entrada]) => {
      if (!entrada.isIntersecting) return;
      obs.disconnect();
      const inicio = performance.now();
      const paso = (ahora) => {
        const k = Math.min((ahora - inicio) / 1200, 1);
        el.textContent = Math.round(meta * (1 - Math.pow(1 - k, 3))) + sufijo;
        if (k < 1) requestAnimationFrame(paso);
      };
      requestAnimationFrame(paso);
    });
    obs.observe(el);
  });

  // ---------- 13) Pestañas de "Sobre nosotros" (con teclado: ← →) ----------
  const pestanas = [...document.querySelectorAll('.pestanas [role="tab"]')];
  function elegirPestana(elegida) {
    pestanas.forEach((tab) => {
      const activa = tab === elegida;
      tab.setAttribute("aria-selected", activa);
      tab.tabIndex = activa ? 0 : -1;
      document.getElementById(tab.getAttribute("aria-controls")).hidden = !activa;
    });
  }
  pestanas.forEach((tab, i) => {
    tab.addEventListener("click", () => elegirPestana(tab));
    tab.addEventListener("keydown", (e) => {
      const salto = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!salto) return;
      const siguiente = pestanas[(i + salto + pestanas.length) % pestanas.length];
      siguiente.focus();
      elegirPestana(siguiente);
    });
  });
})();