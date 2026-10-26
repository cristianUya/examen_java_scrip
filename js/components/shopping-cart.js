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
            .item {
                display: grid;
                grid-template-columns: minmax(0, 1fr) auto;
                gap: 8px 16px;
                align-items: center;
                padding: 12px 0;
                border-bottom: 1px solid #ddd;
            }
            .item p {
                margin: 4px 0;
            }
            .actions {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: 4px;
            }
            button {
                min-width: 38px;
                padding: 8px 10px;
                border: 0;
                border-radius: 5px;
                background: #1d4ed8;
                color: white;
                cursor: pointer;
            }
            button:disabled {
                background: #666;
                cursor: not-allowed;
            }
        `;
        const lista = document.createElement("div");

        if (this._items.length === 0) {
            lista.textContent = "El carrito está vacío.";
            this.shadowRoot.replaceChildren(styles, lista);
            return;
        }

        const formatoPrecio = new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0
        });

        for (const item of this._items) {
            const fila = document.createElement("div");
            fila.className = "item";

            const informacion = document.createElement("div");
            const nombre = document.createElement("p");
            nombre.textContent = item.name;
            const precio = document.createElement("p");
            precio.textContent = `${formatoPrecio.format(item.price)} por unidad`;
            const subtotal = document.createElement("p");
            subtotal.textContent = `Subtotal: ${formatoPrecio.format(item.subtotal)}`;
            informacion.append(nombre, precio, subtotal);

            const acciones = document.createElement("div");
            acciones.className = "actions";

            const disminuir = document.createElement("button");
            disminuir.type = "button";
            disminuir.textContent = "−";
            disminuir.setAttribute("aria-label", `Disminuir ${item.name}`);
            disminuir.disabled = item.quantity <= 1;
            disminuir.addEventListener("click", () => {
                this.solicitarCambioCantidad(item, item.quantity - 1);
            });

            const cantidad = document.createElement("span");
            cantidad.textContent = String(item.quantity);
            cantidad.setAttribute("aria-label", "Cantidad");

            const aumentar = document.createElement("button");
            aumentar.type = "button";
            aumentar.textContent = "+";
            aumentar.setAttribute("aria-label", `Aumentar ${item.name}`);
            aumentar.disabled = item.quantity >= item.stock;
            aumentar.addEventListener("click", () => {
                this.solicitarCambioCantidad(item, item.quantity + 1);
            });

            const eliminar = document.createElement("button");
            eliminar.type = "button";
            eliminar.textContent = "Eliminar";
            eliminar.addEventListener("click", () => {
                this.dispatchEvent(new CustomEvent("remove-from-cart", {
                    detail: { productId: item.id },
                    bubbles: true,
                    composed: true
                }));
            });

            acciones.append(disminuir, cantidad, aumentar, eliminar);
            fila.append(informacion, acciones);
            lista.appendChild(fila);
        }

        this.shadowRoot.replaceChildren(styles, lista);
    }

    solicitarCambioCantidad(item, quantity) {
        this.dispatchEvent(new CustomEvent("change-cart-quantity", {
            detail: { productId: item.id, quantity },
            bubbles: true,
            composed: true
        }));
    }
}

customElements.define("shopping-cart", ShoppingCart);
