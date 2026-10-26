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
            :host { display: block; min-width: 0; }
            article { display: flex; height: 100%; flex-direction: column; align-items: flex-start; padding: 18px; border: 1px solid #e8e5df; border-radius: 13px; background: linear-gradient(150deg, #fff, #faf9f6); text-align: left; transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; }
            article:hover { transform: translateY(-3px); border-color: #d7c49f; box-shadow: 0 12px 24px rgb(38 35 28 / 9%); }
            h3 { margin: 0 0 8px; color: #292a2a; font-family: Georgia, serif; font-size: 17px; }
            p { margin: 5px 0; color: #747779; font-size: 13px; line-height: 1.5; }
            p:nth-of-type(1) { color: #9b7740; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; }
            p:nth-of-type(3) { margin-top: 10px; color: #9b7740; font-size: 16px; font-weight: 750; }
            p:nth-of-type(4) { margin-bottom: 14px; font-size: 12px; }
            button { width: 100%; min-height: 40px; margin-top: auto; padding: 9px 12px; border: 1px solid #c5a366; border-radius: 8px; background: #f2e7d2; color: #594522; font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; transition: background .15s ease; }
            button:hover:not(:disabled) { background: #e7d3ae; }
            button:disabled { border-color: #dededb; background: #e9e9e6; color: #777; cursor: not-allowed; }
            button:focus-visible { outline: 3px solid #d7b978; outline-offset: 2px; }
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
