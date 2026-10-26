export async function obtenerProductos() {
    let response;
    try {
        response = await fetch("data/products.json");
    } catch {
        throw new Error("No se pudo conectar con el catálogo. Comprueba que la aplicación esté abierta desde un servidor HTTP local.");
    }

    if (!response.ok) throw new Error(`Error HTTP ${response.status}: no se pudo cargar el catálogo.`);

    let products;
    try {
        products = await response.json();
    } catch {
        throw new Error("El archivo del catálogo no contiene JSON válido.");
    }

    if (!Array.isArray(products)) throw new Error("Los datos del catálogo deben ser una lista de productos.");

    const ids = new Set();
    for (const product of products) {
        const valid = product && typeof product === "object"
            && Number.isInteger(product.id) && product.id > 0
            && typeof product.name === "string" && product.name.trim()
            && typeof product.category === "string" && product.category.trim()
            && Number.isFinite(product.price) && product.price > 0
            && Number.isInteger(product.stock) && product.stock >= 0
            && typeof product.description === "string"
            && typeof product.active === "boolean";

        if (!valid) throw new Error("El catálogo contiene un producto con datos inválidos.");
        if (ids.has(product.id)) throw new Error("El catálogo contiene identificadores duplicados.");
        ids.add(product.id);
    }

    return products;
}
