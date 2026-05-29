// Constantes globales
const WA_NUMBER = '525548051103';
const PRODUCTOS = [
  { id: 1, nombre: 'Taladro percutor 750W', cat: 'herramientas', desc: 'Potente taladro para concreto.', precio: 2450, icon: 'ti-drill' },
  { id: 2, nombre: 'Nivel láser automático', cat: 'herramientas', desc: 'Proyección 30 metros.', precio: 3800, icon: 'ti-ruler' },
  { id: 4, nombre: 'Cemento Gris 50kg', cat: 'construccion', desc: 'Uso general CPC 30R.', precio: 185, icon: 'ti-building' },
  { id: 5, nombre: 'Varilla 3/8" corrugada', cat: 'construccion', desc: 'Grado 40, 12 metros.', precio: 145, icon: 'ti-line' },
  { id: 7, nombre: 'Cable THHN calibre 12', cat: 'electrico', desc: 'Rollo 100m cobre puro.', precio: 680, icon: 'ti-bolt' }
];

const CATEGORIAS = {
  herramientas: { label: 'Herramientas', icon: 'ti-tools' },
  construccion: { label: 'Construcción', icon: 'ti-building' },
  electrico: { label: 'Eléctrico', icon: 'ti-bolt' },
  plomeria: { label: 'Plomería', icon: 'ti-droplet' },
  seguridad: { label: 'Seguridad', icon: 'ti-hardhat' },
};

let wishlist = [];
let filtroActivo = 'todo';
let carruselIndex = 0;

// Inicialización de EmailJS
const EMAILJS_PUBLIC_KEY = '4zPup5_OhaKMJLCFw';
const EMAILJS_SERVICE_ID = 'service_qi46mff';
const EMAILJS_TEMPLATE_ID = 'template_0zofegf';

if (typeof emailjs !== 'undefined') {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

// Control de vistas (Secciones)
function showSection(id) {
  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  
  const targetSection = document.getElementById(id);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  // Activa el link correspondiente en el nav de forma coherente
  const activeLink = document.getElementById(`link-${id}`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
  
  if (id === 'deseos') {
    renderWish();
  }
  window.scrollTo(0, 0);
}

// Enlaces directos globales
function abrirWhatsappDirecto() {
  window.open(`https://wa.me/${WA_NUMBER}`, '_blank');
}

function irACategoria(cat) {
  showSection('menu');
  const btn = Array.from(document.querySelectorAll('.filtro-btn'))
    .find(b => b.getAttribute('onclick') && b.getAttribute('onclick').includes(`'${cat}'`));
  if (btn) {
    setFiltro(cat, btn);
  }
}

// Filtros de Catálogo
function setFiltro(cat, btn) {
  filtroActivo = cat;
  document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('filtro-activo'));
  if (btn) {
    btn.classList.add('filtro-activo');
  }
  document.getElementById('buscador').value = '';
  filtrarCatalogo();
}

function limpiarBusqueda() {
  document.getElementById('buscador').value = '';
  filtroActivo = 'todo';
  document.querySelectorAll('.filtro-btn').forEach((b, i) => {
    b.classList.toggle('filtro-activo', i === 0);
  });
  filtrarCatalogo();
}

function filtrarCatalogo() {
  const busqueda = document.getElementById('buscador').value.toLowerCase().trim();
  const grid = document.getElementById('catalogoContenido');
  const sinRes = document.getElementById('sinResultados');
  const contador = document.getElementById('contadorResultados');

  if (!grid) return;

  let productosFiltrados = PRODUCTOS.filter(p => {
    const coincideCat = filtroActivo === 'todo' || p.cat === filtroActivo;
    const coincideBusq = !busqueda ||
      p.nombre.toLowerCase().includes(busqueda) ||
      p.desc.toLowerCase().includes(busqueda) ||
      p.cat.toLowerCase().includes(busqueda);
    return coincideCat && coincideBusq;
  });

  if (!productosFiltrados.length) {
    grid.innerHTML = '';
    if (sinRes) {
      sinRes.style.display = 'block';
      document.getElementById('terminoBusqueda').textContent = busqueda || filtroActivo;
    }
    if (contador) contador.textContent = '';
    return;
  }

  if (sinRes) sinRes.style.display = 'none';
  if (contador) {
    contador.textContent = `${productosFiltrados.length} producto${productosFiltrados.length !== 1 ? 's' : ''}`;
  }

  // Agrupar por categoría
  const agrupados = {};
  productosFiltrados.forEach(p => {
    if (!agrupados[p.cat]) agrupados[p.cat] = [];
    agrupados[p.cat].push(p);
  });

  const mostrarCats = filtroActivo === 'todo' && !busqueda;

  grid.innerHTML = Object.entries(agrupados).map(([cat, prods]) => {
    const info = CATEGORIAS[cat] || { label: cat, icon: 'ti-package' };
    return `
      <div class="cat-bloque">
        ${mostrarCats ? `
        <div class="cat-titulo">
          <i class="ti ${info.icon}"></i> ${info.label}
        </div>` : ''}
        <div class="products-grid" style="padding:0; margin-bottom:0;">
          ${prods.map(p => tarjetaProducto(p)).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function tarjetaProducto(p) {
  const inWish = wishlist.find(w => w.id === p.id);
  return `
    <div class="product-card">
      <div style="font-size:32px; color:var(--accent-orange); margin-bottom:10px"><i class="ti ${p.icon}"></i></div>
      <h3 style="font-family:'Barlow Condensed'; font-size:20px; font-weight:700">${p.nombre}</h3>
      <p style="color:var(--text-muted); font-size:13px; margin-bottom:15px">${p.desc}</p>
      <div style="font-family:'Bebas Neue'; font-size:28px">$${p.precio.toLocaleString()}<span class="iva-tag">+ IVA</span></div>
      <button class="nav-wish" style="width:100%; margin-top:15px; background:${inWish ? '#1e293b' : ''}" onclick="toggleWish(${p.id})">
        ${inWish ? '<i class="ti ti-check"></i> Añadido' : '<i class="ti ti-shopping-cart"></i> Añadir a Cotización'}
      </button>
    </div>
  `;
}

// Lógica de Wishlist / Cotización
function toggleWish(id) {
  const prod = PRODUCTOS.find(p => p.id === id);
  const index = wishlist.findIndex(w => w.id === id);
  if (index > -1) {
    wishlist.splice(index, 1);
    showToast('Eliminado de la lista');
  } else {
    wishlist.push({ ...prod, qty: 1 });
    showToast('¡Añadido!');
  }
  updateBadge();
  filtrarCatalogo();
  renderDestacados();
}

function updateQty(id, delta) {
  const item = wishlist.find(w => w.id === id);
  if (item) {
    item.qty = Math.max(1, item.qty + delta);
    renderWish();
    updateBadge();
  }
}

function updateBadge() {
  const badge = document.getElementById('badge');
  if (badge) {
    badge.textContent = wishlist.reduce((acc, curr) => acc + curr.qty, 0);
  }
}

function renderWish() {
  const cont = document.getElementById('wishContent');
  if (!cont) return;

  if (wishlist.length === 0) {
    cont.innerHTML = `
      <div style="text-align:center; padding:5rem; background:var(--bg-card); border-radius:12px; border:1px solid var(--border-color)">
        <p style="color:var(--text-muted)">Tu lista de cotización está vacía.</p>
        <button class="nav-wish" style="margin: 1rem auto" onclick="showSection('menu')">Ir al Catálogo</button>
      </div>`;
    return;
  }

  let subtotal = 0;
  const itemsHtml = wishlist.map(p => {
    const lineTotal = p.precio * p.qty;
    subtotal += lineTotal;
    return `
      <div class="wish-item">
        <div style="font-size:24px; color:var(--accent-orange)"><i class="ti ${p.icon}"></i></div>
        <div>
          <div style="font-weight:700">${p.nombre}</div>
          <div style="font-size:12px; color:var(--text-muted)">$${p.precio} + IVA</div>
        </div>
        <div class="qty-control">
          <button class="qty-btn" onclick="updateQty(${p.id}, -1)">-</button>
          <div style="font-family:'Bebas Neue'; font-size:18px; width:30px; text-align:center">${p.qty}</div>
          <button class="qty-btn" onclick="updateQty(${p.id}, 1)">+</button>
        </div>
        <div style="font-family:'Bebas Neue'; font-size:24px">$${lineTotal.toLocaleString()}</div>
        <button style="background:none; border:none; color:#ff4444; cursor:pointer" onclick="toggleWish(${p.id}); renderWish();"><i class="ti ti-trash"></i></button>
      </div>
    `;
  }).join('');

  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  cont.innerHTML = `
    ${itemsHtml}
    <div class="wish-summary-card">
      <div class="summary-row"><span>Subtotal:</span><span>$${subtotal.toLocaleString()}</span></div>
      <div class="summary-row-orange"><span>IVA (16%):</span><span>$${iva.toLocaleString()}</span></div>
      <div class="summary-total"><span>TOTAL:</span><span>$${total.toLocaleString()}</span></div>
      <button class="btn-whatsapp" onclick="sendWhatsApp(${subtotal}, ${iva}, ${total})"><i class="ti ti-brand-whatsapp"></i> Solicitar por WhatsApp</button>
    </div>`;
}

function sendWhatsApp(sub, iva, tot) {
  let msg = `*COTIZACIÓN - CITIOLD ...*\n\n`;
  wishlist.forEach(p => msg += `• ${p.qty}x ${p.nombre} ($${(p.precio * p.qty).toLocaleString()})\n`);
  msg += `\n*Subtotal:* $${sub.toLocaleString()}\n*IVA (16%):* $${iva.toLocaleString()}\n*TOTAL:* $${tot.toLocaleString()}`;
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
}

// Lógica de Carrusel Destacados
function renderDestacados() {
  const track = document.getElementById('carruselTrack');
  const dots = document.getElementById('carruselDots');
  if (!track) return;

  track.innerHTML = PRODUCTOS.map(p => {
    const inWish = wishlist.find(w => w.id === p.id);
    return `
      <div style="min-width:300px; max-width:300px; background:var(--bg-card); border:1px solid var(--border-color);
        border-radius:16px; padding:2.5rem; flex-shrink:0; transition:border-color 0.3s;"
        onmouseover="this.style.borderColor='var(--accent-orange)'"
        onmouseout="this.style.borderColor='var(--border-color)'">
        <div style="font-size:40px; color:var(--accent-orange); margin-bottom:14px"><i class="ti ${p.icon}"></i></div>
        <h3 style="font-family:'Barlow Condensed'; font-size:22px; font-weight:700; margin-bottom:8px">${p.nombre}</h3>
        <p style="color:var(--text-muted); font-size:14px; margin-bottom:18px; line-height:1.6">${p.desc}</p>
        <div style="font-family:'Bebas Neue'; font-size:32px; margin-bottom:16px">
          $${p.precio.toLocaleString()}<span class="iva-tag">+ IVA</span>
        </div>
        <button class="nav-wish" style="width:100%; background:${inWish ? '#1e293b' : ''}; justify-content:center;"
          onclick="event.stopPropagation(); toggleWish(${p.id})">
          ${inWish ? '<i class="ti ti-check"></i> Añadido' : '<i class="ti ti-shopping-cart"></i> Añadir a Cotización'}
        </button>
      </div>`;
  }).join('');

  if (dots) {
    dots.innerHTML = PRODUCTOS.map((_, i) =>
      `<div onclick="irASlide(${i})" style="width:8px; height:8px; border-radius:50%; cursor:pointer; transition:0.3s;
      background:${i === carruselIndex ? 'var(--accent-orange)' : 'var(--border-color)'}"></div>`
    ).join('');
  }
}

function moverCarrusel(dir) {
  carruselIndex = Math.max(0, Math.min(carruselIndex + dir, PRODUCTOS.length - 1));
  actualizarCarrusel();
}

function irASlide(i) {
  carruselIndex = i;
  actualizarCarrusel();
}

function actualizarCarrusel() {
  const track = document.getElementById('carruselTrack');
  if (track) track.style.transform = `translateX(-${carruselIndex * (300 + 24)}px)`;
  renderDestacados();
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (t) {
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }
}

// Envío del Formulario vía EmailJS
function enviarMensaje() {
  const nombre = document.getElementById('contact-nombre').value.trim();
  const correo = document.getElementById('contact-correo').value.trim();
  const telefono = document.getElementById('contact-telefono').value.trim();
  const mensaje = document.getElementById('contact-mensaje').value.trim();
  const status = document.getElementById('contact-status');
  const btn = document.getElementById('btn-enviar');

  if (!status || !btn) return;

  if (!nombre || !correo || !telefono || !mensaje) {
    status.style.color = '#ff6b00';
    status.textContent = 'Por favor completa todos los campos.';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Enviando...';
  status.textContent = '';

  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    nombre: nombre,
    correo: correo,
    telefono: telefono,
    mensaje: mensaje
  })
  .then(() => {
    status.style.color = '#4caf50';
    status.textContent = '✓ Mensaje enviado. ¡Nos pondremos en contacto pronto!';
    document.getElementById('contact-nombre').value = '';
    document.getElementById('contact-correo').value = '';
    document.getElementById('contact-telefono').value = '';
    document.getElementById('contact-mensaje').value = '';
    btn.textContent = 'Enviar Consulta';
    btn.disabled = false;
  })
  .catch(() => {
    status.style.color = '#ff4444';
    status.textContent = '✗ Ocurrió un error. Intenta de nuevo o escríbenos directamente.';
    btn.textContent = 'Enviar Consulta';
    btn.disabled = false;
  });
}

// Carga Inicial del Sitio
document.addEventListener('DOMContentLoaded', () => {
  filtrarCatalogo();
  renderDestacados();
});