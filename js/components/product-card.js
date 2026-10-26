class ProductCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    set producto(producto) {
        this._producto = producto;
        this.render();
    }

    render() {
        if (!this._producto) return;
        const producto = this._producto;
        const disponible = producto.active && producto.stock > 0;
        const estilos = document.createElement("style");
        estilos.textContent = `
            article { border: 1px solid #ddd; border-radius: 10px; padding: 15px; background: white; text-align: center; }
            button { border: 0; border-radius: 5px; padding: 10px 15px; background: #1d4ed8; color: white; cursor: pointer; }
            button:disabled { background: #666; cursor: not-allowed; }
        `;
        const article = document.createElement("article");
        const [nombre, categoria, descripcion, precio, stock] = ["h3", "p", "p", "p", "p"]
            .map(tag => document.createElement(tag));

        nombre.textContent = producto.name;
        categoria.textContent = `Categoría: ${producto.category}`;
        descripcion.textContent = producto.description;
        precio.textContent = `Precio: ${new Intl.NumberFormat("es-CO", {
            style: "currency", currency: "COP", maximumFractionDigits: 0
        }).format(producto.price)}`;
        stock.textContent = disponible ? `Disponibles: ${producto.stock}`
            : producto.active ? "Agotado" : "No disponible";

        const boton = document.createElement("button");
        boton.type = "button";
        boton.textContent = "Agregar al carrito";
        boton.disabled = !disponible;
        boton.addEventListener("click", () => this.dispatchEvent(new CustomEvent("add-to-cart", {
            detail: { productId: producto.id }, bubbles: true, composed: true
        })));

        article.append(nombre, categoria, descripcion, precio, stock, boton);
        this.shadowRoot.replaceChildren(estilos, article);
    }
}

customElements.define("product-card", ProductCard);
