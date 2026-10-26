class ShoppingCart extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this._items = [];
    }

    set items(items) {
        this._items = Array.isArray(items) ? items : [];
        this.render();
    }

    render() {
        const styles = document.createElement("style");
        styles.textContent = `
            .empty { padding: 18px 10px; border: 1px dashed #d8d5ce; border-radius: 10px; color: #777b7e; text-align: center; font-size: 13px; }
            .item { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; align-items: center; padding: 13px 0; border-bottom: 1px solid #eeece7; }
            .item p { margin: 4px 0; }
            .item p:first-child { color: #303234; font-size: 13px; font-weight: 700; }
            .item p:not(:first-child) { color: #777b7e; font-size: 11px; }
            .item p:last-child { color: #987440; font-weight: 700; }
            .actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 4px; }
            .quantity { min-width: 20px; color: #353739; text-align: center; font-size: 12px; font-weight: 700; }
            button { min-width: 30px; min-height: 30px; padding: 5px 8px; border: 1px solid #dedbd4; border-radius: 7px; background: #f4f3f0; color: #54575a; font: inherit; font-size: 12px; cursor: pointer; }
            button:hover:not(:disabled) { border-color: #c3a36a; background: #f0e5d0; color: #604d2d; }
            button:disabled { opacity: .45; cursor: not-allowed; }
            button:focus-visible { outline: 3px solid #d7b978; outline-offset: 2px; }
            button.remove { padding: 6px 8px; border-color: transparent; background: transparent; color: #777; font-size: 11px; }
            button.remove:hover:not(:disabled) { background: #f3ece8; color: #8b5140; }
        `;
        const lista = document.createElement("div");
        if (!this._items.length) {
            lista.className = "empty";
            lista.textContent = "El carrito está vacío.";
            this.shadowRoot.replaceChildren(styles, lista);
            return;
        }

        const formatoPrecio = new Intl.NumberFormat("es-CO", {
            style: "currency", currency: "COP", maximumFractionDigits: 0
        });
        for (const item of this._items) {
            const fila = document.createElement("div");
            fila.className = "item";
            const informacion = document.createElement("div");
            const nombre = document.createElement("p");
            const precio = document.createElement("p");
            const subtotal = document.createElement("p");
            nombre.textContent = item.name;
            precio.textContent = `${formatoPrecio.format(item.price)} por unidad`;
            subtotal.textContent = `Subtotal: ${formatoPrecio.format(item.subtotal)}`;
            informacion.append(nombre, precio, subtotal);

            const acciones = document.createElement("div");
            acciones.className = "actions";
            const cantidad = document.createElement("span");
            cantidad.className = "quantity";
            cantidad.textContent = String(item.quantity);
            cantidad.setAttribute("aria-label", "Cantidad");
            const disminuir = this.crearBoton("−", `Disminuir ${item.name}`,
                () => this.solicitarCambioCantidad(item, item.quantity - 1));
            disminuir.disabled = item.quantity <= 1;
            const aumentar = this.crearBoton("+", `Aumentar ${item.name}`,
                () => this.solicitarCambioCantidad(item, item.quantity + 1));
            aumentar.disabled = item.quantity >= item.stock;
            const eliminar = this.crearBoton("Eliminar", null, () =>
                this.dispatchEvent(new CustomEvent("remove-from-cart", {
                    detail: { productId: item.id }, bubbles: true, composed: true
                })));
            eliminar.className = "remove";

            acciones.append(disminuir, cantidad, aumentar, eliminar);
            fila.append(informacion, acciones);
            lista.append(fila);
        }
        this.shadowRoot.replaceChildren(styles, lista);
    }

    crearBoton(texto, etiqueta, accion) {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.textContent = texto;
        if (etiqueta) boton.setAttribute("aria-label", etiqueta);
        boton.addEventListener("click", accion);
        return boton;
    }

    solicitarCambioCantidad(item, quantity) {
        this.dispatchEvent(new CustomEvent("change-cart-quantity", {
            detail: { productId: item.id, quantity }, bubbles: true, composed: true
        }));
    }
}

customElements.define("shopping-cart", ShoppingCart);
