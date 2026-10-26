import "./product-card.js";

class ProductList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    set productos(productos) {
        this._productos = Array.isArray(productos) ? productos : [];
        this.render();
    }

    render() {
        const estilos = document.createElement("style");
        estilos.textContent = `
            .catalogo {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                gap: 20px;
            }
        `;

        const lista = document.createElement("div");
        lista.className = "catalogo";

        this._productos.forEach(producto => {
            const tarjeta = document.createElement("product-card");
            tarjeta.producto = producto;
            lista.appendChild(tarjeta);
        });

        this.shadowRoot.replaceChildren(estilos, lista);
    }
}

customElements.define("product-list", ProductList);