const CLAVE_CARRITO = "tecnostock-carrito";

export function guardarCarrito(items) {
    try {
        localStorage.setItem(CLAVE_CARRITO, JSON.stringify(items));
        return { ok: true };
    } catch (error) {
        console.error("No se pudo guardar el carrito:", error);
        return { ok: false };
    }
}

export function obtenerCarritoGuardado() {
    try {
        const datos = localStorage.getItem(CLAVE_CARRITO);

        if (datos === null) {
            return { items: [], warning: "" };
        }

        let carrito;
        try {
            carrito = JSON.parse(datos);
        } catch {
            return {
                items: [],
                warning: "El carrito guardado estaba dañado; se inició uno vacío."
            };
        }

        if (!Array.isArray(carrito)) {
            return {
                items: [],
                warning: "El carrito guardado tenía un formato inválido; se inició uno vacío."
            };
        }

        const items = carrito.filter(item =>
            item !== null
            && typeof item === "object"
            && Number.isInteger(item.id)
            && Number.isInteger(item.quantity)
            && item.quantity >= 1
        ).map(({ id, quantity }) => ({ id, quantity }));
        const descartados = carrito.length - items.length;

        return {
            items,
            warning: descartados
                ? "Se ignoraron líneas inválidas del carrito guardado."
                : ""
        };
    } catch (error) {
        console.error("No se pudo recuperar el carrito:", error);
        return {
            items: [],
            warning: "No se pudo acceder al almacenamiento local; se inició un carrito vacío."
        };
    }
}
