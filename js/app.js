import { obtenerProductos } from "./api.js";
import { Cart } from "./cart.js";
import { guardarCarrito, obtenerCarritoGuardado } from "./storage.js";
import "./components/product-card.js";
import "./components/product-list.js";
import "./components/shopping-cart.js";

const catalogo = document.querySelector("product-list");
const estadoCatalogo = document.querySelector("#catalog-status");
const busqueda = document.querySelector("#search");
const categoria = document.querySelector("#category");
const soloDisponibles = document.querySelector("#availability");
const orden = document.querySelector("#sort");
const limpiarFiltros = document.querySelector("#clear-filters");
const listaCarrito = document.querySelector("shopping-cart");
const mensajeCarrito = document.querySelector("#cart-message");
const mensajePedido = document.querySelector("#order-message");
const botonVaciar = document.querySelector("#clear-cart");
const botonConfirmar = document.querySelector("#confirm-order");
const contadorCarrito = document.querySelector("#cart-count");
const contadorCarritoMovil = document.querySelector("#mobile-cart-count");
const botonAbrirCarrito = document.querySelector("#mobile-cart-toggle");
const botonCerrarCarrito = document.querySelector("#close-cart");
const fondoCarrito = document.querySelector("#cart-backdrop");
const panelCarrito = document.querySelector("#cart-sidebar");
const subtotalPedido = document.querySelector("#subtotal");
const descuentoPedido = document.querySelector("#discount");
const totalPedido = document.querySelector("#total");
const dialogoCheckout = document.querySelector("#checkout-dialog");
const formularioCheckout = document.querySelector("#checkout-form");
const listaCheckout = document.querySelector("#checkout-items");
const mensajeCheckout = document.querySelector("#checkout-message");

let productosOriginales = [];
let carrito;

const formatoPrecio = new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", maximumFractionDigits: 0
});

function mostrarProductosFiltrados() {
    const texto = busqueda.value.trim().toLocaleLowerCase();
    const categoriaSeleccionada = categoria.value;
    const disponibles = soloDisponibles.checked;
    const ordenSeleccionado = orden.value;
    const productosFiltrados = productosOriginales.filter(producto => {
        const coincideTexto = producto.name.toLocaleLowerCase().includes(texto)
            || producto.description.toLocaleLowerCase().includes(texto);
        const coincideCategoria = !categoriaSeleccionada
            || producto.category === categoriaSeleccionada;
        const coincideDisponibilidad = !disponibles || (producto.active && producto.stock > 0);
        return coincideTexto && coincideCategoria && coincideDisponibilidad;
    });

    if (ordenSeleccionado === "asc") productosFiltrados.sort((a, b) => a.price - b.price);
    else if (ordenSeleccionado === "desc") productosFiltrados.sort((a, b) => b.price - a.price);
    catalogo.productos = productosFiltrados;

    if (productosOriginales.length === 0)
        estadoCatalogo.textContent = "El catálogo está vacío: no hay productos para mostrar.";
    else if (productosFiltrados.length === 0)
        estadoCatalogo.textContent = "No se encontraron productos con los filtros seleccionados.";
    else estadoCatalogo.textContent = `Se muestran ${productosFiltrados.length} de ${productosOriginales.length} productos.`;
}

function cargarCategorias() {
    const categorias = [...new Set(productosOriginales.map(producto => producto.category))]
        .sort((a, b) => a.localeCompare(b, "es"));
    for (const nombreCategoria of categorias) {
        const opcion = document.createElement("option");
        opcion.value = nombreCategoria;
        opcion.textContent = nombreCategoria;
        categoria.append(opcion);
    }
}

function actualizarVistaCarrito() {
    if (!carrito) return;
    const lineas = carrito.obtenerLineas();
    listaCarrito.items = lineas;
    contadorCarrito.textContent = String(carrito.totalUnidades);
    contadorCarritoMovil.textContent = String(carrito.totalUnidades);
    subtotalPedido.textContent = formatoPrecio.format(carrito.calcularSubtotal());
    descuentoPedido.textContent = formatoPrecio.format(carrito.calcularDescuento());
    totalPedido.textContent = formatoPrecio.format(carrito.calcularTotal());
    botonVaciar.disabled = lineas.length === 0;
    botonConfirmar.disabled = lineas.length === 0;
}

function cerrarCarritoMovil(devolverFoco = false) {
    panelCarrito.classList.remove("is-open");
    document.body.classList.remove("cart-open");
    botonAbrirCarrito.setAttribute("aria-expanded", "false");
    panelCarrito.setAttribute("aria-hidden", "true");
    panelCarrito.inert = true;
    if (devolverFoco) botonAbrirCarrito.focus();
}

const vistaMovil = window.matchMedia("(max-width: 760px)");
function actualizarModoCarrito({ matches: esMovil }) {
    if (esMovil) {
        panelCarrito.setAttribute("role", "dialog");
        panelCarrito.setAttribute("aria-modal", "true");
        panelCarrito.setAttribute("aria-labelledby", "cart-title");
        cerrarCarritoMovil();
        return;
    }

    panelCarrito.classList.remove("is-open");
    document.body.classList.remove("cart-open");
    panelCarrito.removeAttribute("role");
    panelCarrito.removeAttribute("aria-modal");
    panelCarrito.removeAttribute("aria-labelledby");
    panelCarrito.removeAttribute("aria-hidden");
    panelCarrito.inert = false;
    botonAbrirCarrito.setAttribute("aria-expanded", "false");
}

vistaMovil.addEventListener("change", actualizarModoCarrito);
actualizarModoCarrito(vistaMovil);

botonAbrirCarrito.addEventListener("click", () => {
    if (!vistaMovil.matches) return;
    panelCarrito.classList.add("is-open");
    document.body.classList.add("cart-open");
    botonAbrirCarrito.setAttribute("aria-expanded", "true");
    panelCarrito.removeAttribute("aria-hidden");
    panelCarrito.inert = false;
    botonCerrarCarrito.focus();
});
botonCerrarCarrito.addEventListener("click", () => cerrarCarritoMovil(true));
fondoCarrito.addEventListener("click", () => cerrarCarritoMovil(true));
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && panelCarrito.classList.contains("is-open")) {
        cerrarCarritoMovil(true);
    }
});

function guardarYActualizarCarrito() {
    actualizarVistaCarrito();
    const resultado = guardarCarrito(carrito.serializar());
    if (!resultado.ok) {
        mensajeCarrito.textContent = "El carrito se actualizó, pero no se pudo guardar en este navegador.";
        return false;
    }
    mensajeCarrito.textContent = "";
    return true;
}

function habilitarFiltros(habilitados) {
    [busqueda, categoria, soloDisponibles, orden, limpiarFiltros]
        .forEach(control => control.disabled = !habilitados);
}

busqueda.addEventListener("input", mostrarProductosFiltrados);
categoria.addEventListener("change", mostrarProductosFiltrados);
soloDisponibles.addEventListener("change", mostrarProductosFiltrados);
orden.addEventListener("change", mostrarProductosFiltrados);

limpiarFiltros.addEventListener("click", () => {
    busqueda.value = "";
    categoria.value = "";
    soloDisponibles.checked = false;
    orden.value = "";
    mostrarProductosFiltrados();
});

catalogo.addEventListener("add-to-cart", event => {
    if (!carrito) {
        mensajeCarrito.textContent = "El catálogo todavía no está disponible.";
        return;
    }

    try {
        carrito.agregarProducto(event.detail?.productId);
        mensajePedido.textContent = "";
        if (guardarYActualizarCarrito()) mensajeCarrito.textContent = "Producto agregado al carrito.";
    } catch (error) {
        mensajeCarrito.textContent = error.message;
    }
});

listaCarrito.addEventListener("change-cart-quantity", event => {
    try {
        carrito.cambiarCantidad(event.detail?.productId, event.detail?.quantity);
        mensajePedido.textContent = "";
        guardarYActualizarCarrito();
    } catch (error) {
        mensajeCarrito.textContent = error.message;
    }
});

listaCarrito.addEventListener("remove-from-cart", event => {
    carrito.eliminarProducto(event.detail?.productId);
    mensajePedido.textContent = "";
    guardarYActualizarCarrito();
});

botonVaciar.addEventListener("click", () => {
    carrito.vaciarCarrito();
    mensajePedido.textContent = "";
    if (guardarYActualizarCarrito()) mensajeCarrito.textContent = "Se vació el carrito.";
});

botonConfirmar.addEventListener("click", () => {
    try {
        carrito.validarPedido();
        mensajeCheckout.textContent = "";
        listaCheckout.replaceChildren();
        for (const linea of carrito.obtenerLineas()) {
            const elemento = document.createElement("li");
            elemento.textContent =
                `${linea.name} x ${linea.quantity} — ${formatoPrecio.format(linea.subtotal)}`;
            listaCheckout.append(elemento);
        }
        document.querySelector("#checkout-subtotal").textContent =
            formatoPrecio.format(carrito.calcularSubtotal());
        document.querySelector("#checkout-discount").textContent =
            formatoPrecio.format(carrito.calcularDescuento());
        document.querySelector("#checkout-total").textContent =
            formatoPrecio.format(carrito.calcularTotal());
        if (vistaMovil.matches) cerrarCarritoMovil();
        dialogoCheckout.showModal();
    } catch (error) {
        mensajePedido.textContent = error.message;
    }
});

function cerrarCheckout() {
    if (dialogoCheckout.open) dialogoCheckout.close();
}

document.querySelector("#close-checkout").addEventListener("click", cerrarCheckout);
document.querySelector("#cancel-checkout").addEventListener("click", cerrarCheckout);
dialogoCheckout.addEventListener("close", () => {
    if (vistaMovil.matches) botonAbrirCarrito.focus();
});

formularioCheckout.addEventListener("submit", event => {
    event.preventDefault();
    try {
        carrito.validarPedido();
        const subtotal = carrito.calcularSubtotal();
        const descuento = carrito.calcularDescuento();
        const total = carrito.calcularTotal();
        const identificador = globalThis.crypto?.randomUUID
            ? globalThis.crypto.randomUUID()
            : `pedido-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        mensajePedido.textContent =
            `Pedido simulado ${identificador}\n`
            + `Subtotal: ${formatoPrecio.format(subtotal)}\n`
            + `Descuento: ${formatoPrecio.format(descuento)}\n`
            + `Total: ${formatoPrecio.format(total)}\n`
            + "La compra es una simulación local; no se realizó ningún pago.";

        carrito.vaciarCarrito();
        guardarYActualizarCarrito();
        formularioCheckout.reset();
        cerrarCheckout();
    } catch (error) {
        mensajeCheckout.textContent = error.message;
    }
});

async function iniciarAplicacion() {
    estadoCatalogo.textContent = "Cargando catálogo...";
    try {
        productosOriginales = await obtenerProductos();
        carrito = new Cart(productosOriginales);
        const guardado = obtenerCarritoGuardado();
        const descartados = carrito.restaurar(guardado.items);
        habilitarFiltros(true);
        cargarCategorias();
        mostrarProductosFiltrados();
        actualizarVistaCarrito();

        const avisos = [guardado.warning];
        if (descartados > 0)
            avisos.push(`Se descartaron ${descartados} líneas que ya no son válidas según el catálogo.`);
        if (guardado.warning || descartados > 0) {
            const resultado = guardarCarrito(carrito.serializar());
            if (!resultado.ok) avisos.push("No se pudo actualizar el carrito guardado.");
        }
        mensajeCarrito.textContent = avisos.filter(Boolean).join(" ");
    } catch (error) {
        estadoCatalogo.textContent = error.message
            || "No se pudo cargar el catálogo. Comprueba el servidor local e inténtalo de nuevo.";
        catalogo.productos = [];
    }
}

iniciarAplicacion();
