export async function obtenerProductos() {
    let respuesta;
    try {
        respuesta = await fetch("data/products.json");
    } catch {
        throw new Error(
            "No se pudo conectar con el catálogo. Comprueba que la aplicación esté abierta desde un servidor HTTP local."
        );
    }

    if (!respuesta.ok) {
        throw new Error(
            `Error HTTP ${respuesta.status}: no se pudo cargar el catálogo.`
        );
    }

    let productos;

    try {
        productos = await respuesta.json();
    } catch {
        throw new Error("El archivo del catálogo no contiene JSON válido.");
    }

    if (!Array.isArray(productos)) {
        throw new Error("Los datos del catálogo deben ser una lista de productos.");
    }

    const ids = new Set();
    const productoValido = producto =>
        producto !== null
        && typeof producto === "object"
        && Number.isInteger(producto.id)
        && producto.id > 0
        && typeof producto.name === "string"
        && producto.name.trim() !== ""
        && typeof producto.category === "string"
        && producto.category.trim() !== ""
        && Number.isFinite(producto.price)
        && producto.price > 0
        && Number.isInteger(producto.stock)
        && producto.stock >= 0
        && typeof producto.description === "string"
        && typeof producto.active === "boolean";

    for (const producto of productos) {
        if (!productoValido(producto)) {
            throw new Error("El catálogo contiene un producto con datos inválidos.");
        }

        if (ids.has(producto.id)) {
            throw new Error("El catálogo contiene identificadores duplicados.");
        }

        ids.add(producto.id);
    }

    return productos;
}