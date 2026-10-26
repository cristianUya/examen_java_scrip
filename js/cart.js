export class Cart {
    constructor(productos) {
        this.productos = productos;
        this.items = [];
    }

    buscarProducto(idProducto) {
        return this.productos.find(producto => producto.id === idProducto);
    }

    agregarProducto(idProducto) {
        const producto = this.buscarProducto(idProducto);

        if (!producto) {
            throw new Error("El producto no existe en el catálogo.");
        }
        if (!producto.active || producto.stock <= 0) {
            throw new Error("No se puede agregar un producto inactivo o agotado.");
        }

        const linea = this.items.find(item => item.id === idProducto);
        const cantidadNueva = (linea?.quantity || 0) + 1;

        if (cantidadNueva > producto.stock) {
            throw new Error("La cantidad solicitada supera las existencias disponibles.");
        }

        if (linea) {
            linea.quantity = cantidadNueva;
        } else {
            this.items.push({ id: idProducto, quantity: 1 });
        }
    }

    cambiarCantidad(idProducto, cantidad) {
        if (!Number.isInteger(cantidad) || cantidad < 1) {
            throw new Error("La cantidad debe ser un entero mayor o igual a 1.");
        }

        const linea = this.items.find(item => item.id === idProducto);
        const producto = this.buscarProducto(idProducto);

        if (!linea || !producto) {
            throw new Error("No se encontró el producto en el carrito.");
        }
        if (!producto.active) {
            throw new Error("No se puede cambiar la cantidad de un producto inactivo.");
        }
        if (cantidad > producto.stock) {
            throw new Error("La cantidad supera las existencias disponibles.");
        }

        linea.quantity = cantidad;
    }

    eliminarProducto(idProducto) {
        this.items = this.items.filter(item => item.id !== idProducto);
    }

    vaciarCarrito() {
        this.items = [];
    }

    restaurar(itemsGuardados) {
        let descartados = 0;
        const restaurados = [];
        const ids = new Set();

        for (const item of Array.isArray(itemsGuardados) ? itemsGuardados : []) {
            if (!item || typeof item !== "object") {
                descartados += 1;
                continue;
            }

            const producto = this.buscarProducto(item.id);
            const valido =
                Number.isInteger(item.id)
                && Number.isInteger(item.quantity)
                && item.quantity >= 1
                && producto
                && producto.active
                && item.quantity <= producto.stock
                && !ids.has(item.id);

            if (!valido) {
                descartados += 1;
                continue;
            }

            ids.add(item.id);
            restaurados.push({ id: item.id, quantity: item.quantity });
        }

        this.items = restaurados;
        return descartados;
    }

    obtenerLineas() {
        return this.items.map(item => {
            const producto = this.buscarProducto(item.id);
            return {
                id: producto.id,
                name: producto.name,
                price: producto.price,
                stock: producto.stock,
                quantity: item.quantity,
                subtotal: producto.price * item.quantity
            };
        });
    }

    calcularSubtotal() {
        return this.obtenerLineas().reduce(
            (total, item) => total + item.subtotal,
            0
        );
    }

    calcularDescuento() {
        const subtotal = this.calcularSubtotal();
        return subtotal >= 300000 ? Math.round(subtotal * 0.1) : 0;
    }

    calcularTotal() {
        return this.calcularSubtotal() - this.calcularDescuento();
    }

    get totalUnidades() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    validarPedido() {
        if (this.items.length === 0) {
            throw new Error("El carrito está vacío.");
        }

        for (const item of this.items) {
            const producto = this.buscarProducto(item.id);
            if (
                !producto
                || !producto.active
                || !Number.isInteger(item.quantity)
                || item.quantity < 1
                || item.quantity > producto.stock
            ) {
                throw new Error(
                    "El carrito contiene un producto inactivo o una cantidad no disponible."
                );
            }
        }
    }

    serializar() {
        return this.items.map(({ id, quantity }) => ({ id, quantity }));
    }
}
