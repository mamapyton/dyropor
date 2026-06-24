const whatsappNumber = "5491123456789";
const productsDataUrl = "data/productos.json";
const productsPerPage = 12;
const cartStorageKey = "dyrCart";

const categoryLabels = {
    todos: "Todos",
    moda: "Moda",
    accesorios: "Accesorios",
    hogar: "Hogar",
    regalos: "Regalos",
    oportunidades: "Oportunidades"
};

let products = [];
let cart = [];
let currentFilter = "todos";
let visibleProducts = productsPerPage;
let currentProductQuantity = 1;

function normalizeCategory(value = "") {
    return value
        .toString()
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function normalizeProduct(product) {
    const category = normalizeCategory(product.categoria || product.category);
    const mainImage = product.imagenPrincipal || product.imagen || product.image || "";

    return {
        id: Number(product.id),
        name: product.nombre || product.name,
        category,
        categoryLabel: product.categoria || categoryLabels[category] || category,
        price: Number(product.precio ?? product.price ?? 0),
        oldPrice: product.precioAnterior ?? product.oldPrice ?? null,
        image: mainImage,
        secondaryImages: Array.isArray(product.imagenesSecundarias) ? product.imagenesSecundarias : [],
        imageAlt: product.imagenAlt || product.nombre || product.name,
        icon: product.icono || product.icon || "fa-solid fa-tag",
        shortDescription: product.descripcionCorta || product.descripcion || product.description || "",
        longDescription: product.descripcionLarga || product.descripcion || product.description || "",
        featured: Boolean(product.destacado ?? product.featured),
        showInWall: product.mostrarEnMuro !== false,
        stock: product.stock,
        variants: product.variantes || { talles: [], colores: [] }
    };
}

async function loadProducts() {
    loadCart();

    try {
        const response = await fetch(productsDataUrl, { cache: "no-store" });

        if (!response.ok) {
            throw new Error(`No se pudo cargar ${productsDataUrl}`);
        }

        const data = await response.json();
        products = data.map(normalizeProduct);

        if (document.getElementById("productPage")) {
            renderProductPage();
        } else {
            renderProducts();
        }

        updateCart();
    } catch (error) {
        console.error(error);
        showProductsError();
    }
}

function loadCart() {
    try {
        cart = JSON.parse(localStorage.getItem(cartStorageKey)) || [];
    } catch {
        cart = [];
    }
}

function saveCart() {
    localStorage.setItem(cartStorageKey, JSON.stringify(cart));
}

function showProductsError() {
    const grid = document.getElementById("productsGrid");
    const productPage = document.getElementById("productPage");
    const loadMoreBtn = document.getElementById("loadMoreBtn");

    if (grid) {
        grid.innerHTML = '<p class="empty-products">No pudimos cargar los productos. Revisá el archivo data/productos.json.</p>';
    }

    if (productPage) {
        productPage.innerHTML = '<p class="empty-products">No pudimos cargar el producto. Revisá el archivo data/productos.json.</p>';
    }

    if (loadMoreBtn) {
        loadMoreBtn.hidden = true;
    }
}

function escapeHtml(value = "") {
    return value
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatPrice(value) {
    return Number(value).toLocaleString("es-AR");
}

function getProductsByFilter(filter) {
    if (filter === "todos") {
        return products.filter((product) => product.showInWall);
    }

    return products.filter((product) => product.category === filter);
}

function updateCategoryState(filter, trigger) {
    document.querySelectorAll(".category-card").forEach((btn) => btn.classList.remove("active"));

    if (trigger && trigger.classList.contains("category-card")) {
        trigger.classList.add("active");
        return;
    }

    const categoryButton = document.querySelector(`[data-category="${filter}"]`);
    if (categoryButton) {
        categoryButton.classList.add("active");
    }
}

function createProductImage(product) {
    if (!product.image) {
        return `<div class="product-placeholder"><i class="${product.icon}"></i></div>`;
    }

    return `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.imageAlt || product.name)}" loading="lazy" onerror="showImageFallback(this, '${escapeHtml(product.icon)}')">`;
}

function showImageFallback(image, icon) {
    image.parentElement.classList.remove("has-photo");
    image.parentElement.innerHTML = `<div class="product-placeholder"><i class="${icon}"></i></div>`;
}

function renderProducts(filter = currentFilter) {
    const grid = document.getElementById("productsGrid");
    const loadMoreBtn = document.getElementById("loadMoreBtn");

    if (!grid) return;

    const filtered = getProductsByFilter(filter);
    const visible = filtered.slice(0, visibleProducts);

    if (visible.length === 0) {
        grid.innerHTML = '<p class="empty-products">No hay productos para esta categoria por ahora.</p>';
    } else {
        grid.innerHTML = visible.map((product) => `
        <article class="product-card" onclick="openProduct(${product.id})" tabindex="0" role="link" aria-label="Ver ${escapeHtml(product.name)}">
            <div class="product-image ${product.image ? "has-photo" : ""}">
                ${product.featured ? '<span class="product-tag">Destacado</span>' : ""}
                ${createProductImage(product)}
            </div>
            <div class="product-info">
                <div class="product-category">${escapeHtml(product.categoryLabel)}</div>
                <h3 class="product-name">${escapeHtml(product.name)}</h3>
                <div class="product-price-row">
                    <span class="product-price">$${formatPrice(product.price)}</span>
                    ${product.oldPrice ? `<span class="product-old-price">$${formatPrice(product.oldPrice)}</span>` : ""}
                </div>
                <button class="product-btn" type="button" onclick="event.stopPropagation(); addToCart(${product.id})">
                    <i class="fas fa-cart-plus"></i> Agregar
                </button>
            </div>
        </article>
        `).join("");
    }

    if (loadMoreBtn) {
        loadMoreBtn.hidden = visibleProducts >= filtered.length;
    }
}

function openProduct(id) {
    window.location.href = `product.html?id=${encodeURIComponent(id)}`;
}

function filterProducts(category, trigger) {
    currentFilter = category;
    visibleProducts = productsPerPage;
    updateCategoryState(category, trigger);
    renderProducts(category);
}

function loadMoreProducts() {
    visibleProducts += productsPerPage;
    renderProducts(currentFilter);
}

function getProductFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));
    return products.find((product) => product.id === id);
}

function getProductImages(product) {
    return [product.image, ...product.secondaryImages].filter(Boolean);
}

function renderProductPage() {
    const productPage = document.getElementById("productPage");
    const product = getProductFromUrl();

    if (!productPage) return;

    if (!product) {
        productPage.innerHTML = `
            <section class="product-not-found">
                <p class="empty-products">No encontramos este producto.</p>
                <a class="btn-secondary" href="index.html">Volver al inicio</a>
            </section>
        `;
        return;
    }

    document.title = `${product.name} | DYR Oportunidades`;
    currentProductQuantity = 1;

    const images = getProductImages(product);
    const related = products
        .filter((item) => item.id !== product.id && item.category === product.category)
        .slice(0, 4);

    productPage.innerHTML = `
        <section class="product-detail">
            <div class="product-gallery">
                <div class="product-main-image ${product.image ? "has-photo" : ""}" id="productMainImage">
                    ${product.image
                        ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.imageAlt || product.name)}" onerror="showImageFallback(this, '${escapeHtml(product.icon)}')">`
                        : `<div class="product-placeholder"><i class="${product.icon}"></i></div>`
                    }
                </div>
                <div class="product-thumbs">
                    ${images.map((image, index) => `
                        <button class="${index === 0 ? "active" : ""}" type="button" data-src="${escapeHtml(image)}" data-alt="${escapeHtml(product.imageAlt || product.name)}" onclick="selectProductImage(this)">
                            <img src="${escapeHtml(image)}" alt="${escapeHtml(product.name)} ${index + 1}" onerror="this.parentElement.hidden = true">
                        </button>
                    `).join("")}
                </div>
            </div>

            <div class="product-detail-info">
                <a class="product-back" href="index.html"><i class="fas fa-arrow-left"></i> Volver</a>
                <div class="product-category">${escapeHtml(product.categoryLabel)}</div>
                <h1>${escapeHtml(product.name)}</h1>
                <div class="product-detail-price">
                    <span>$${formatPrice(product.price)}</span>
                    ${product.oldPrice ? `<small>$${formatPrice(product.oldPrice)}</small>` : ""}
                </div>
                <p>${escapeHtml(product.longDescription || product.shortDescription)}</p>
                <div class="product-detail-meta">
                    <span><i class="fas fa-box"></i> ${product.stock > 0 ? `Stock disponible: ${product.stock}` : "Consultar stock"}</span>
                    <span><i class="fas fa-layer-group"></i> Variantes preparadas para talles y colores</span>
                </div>

                <div class="quantity-control" aria-label="Cantidad">
                    <button type="button" onclick="changeProductQuantity(-1)">-</button>
                    <span id="productQuantity">1</span>
                    <button type="button" onclick="changeProductQuantity(1)">+</button>
                </div>

                <div class="product-detail-actions">
                    <button class="btn-whatsapp" type="button" onclick="sendProductToWhatsApp(${product.id})">
                        <i class="fab fa-whatsapp"></i> Consultar por WhatsApp
                    </button>
                    <button class="btn-primary" type="button" onclick="addProductDetailToCart(${product.id})">
                        <i class="fas fa-cart-plus"></i> Agregar al carrito
                    </button>
                </div>
            </div>
        </section>

        <section class="related-products">
            <h2>Más productos de ${escapeHtml(product.categoryLabel)}</h2>
            <div class="products-grid related-grid">
                ${related.map((item) => `
                    <article class="product-card" onclick="openProduct(${item.id})" tabindex="0" role="link" aria-label="Ver ${escapeHtml(item.name)}">
                        <div class="product-image ${item.image ? "has-photo" : ""}">
                            ${createProductImage(item)}
                        </div>
                        <div class="product-info">
                            <div class="product-category">${escapeHtml(item.categoryLabel)}</div>
                            <h3 class="product-name">${escapeHtml(item.name)}</h3>
                            <div class="product-price-row">
                                <span class="product-price">$${formatPrice(item.price)}</span>
                            </div>
                        </div>
                    </article>
                `).join("")}
            </div>
        </section>
    `;
}

function selectProductImage(button) {
    const main = document.getElementById("productMainImage");
    const src = button.dataset.src;
    const alt = button.dataset.alt || "";

    if (!main || !src) return;

    document.querySelectorAll(".product-thumbs button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    main.classList.add("has-photo");
    main.innerHTML = `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" onerror="showImageFallback(this, 'fa-solid fa-tag')">`;
}

function changeProductQuantity(delta) {
    currentProductQuantity = Math.max(1, currentProductQuantity + delta);
    const quantity = document.getElementById("productQuantity");

    if (quantity) {
        quantity.textContent = currentProductQuantity;
    }
}

function addProductDetailToCart(id) {
    addToCart(id, currentProductQuantity);
}

function addToCart(id, quantity = 1) {
    const product = products.find((item) => item.id === id);

    if (!product) return;

    const existing = cart.find((item) => item.id === id);

    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ ...product, quantity });
    }

    saveCart();
    updateCart();
    showNotification(`${product.name} agregado al carrito.`);
}

function updateCart() {
    const cartItems = document.getElementById("cartItems");
    const cartCount = document.getElementById("cartCount");
    const cartTotal = document.getElementById("cartTotal");

    if (!cartItems || !cartCount || !cartTotal) return;

    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Tu carrito esta vacio.</p>';
    } else {
        cartItems.innerHTML = cart.map((item) => `
            <div class="cart-item">
                <div class="cart-item-img"><i class="${item.icon}"></i></div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${escapeHtml(item.name)}</div>
                    <div>Cantidad: ${item.quantity}</div>
                    <div class="cart-item-price">$${formatPrice(item.price * item.quantity)}</div>
                </div>
                <button class="cart-item-remove" type="button" onclick="removeFromCart(${item.id})" aria-label="Quitar ${escapeHtml(item.name)}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join("");
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotal.textContent = formatPrice(total);
}

function removeFromCart(id) {
    cart = cart.filter((item) => item.id !== id);
    saveCart();
    updateCart();
}

function toggleCart() {
    document.getElementById("cartSidebar").classList.toggle("open");
    document.getElementById("cartOverlay").classList.toggle("open");
}

function sendCartToWhatsApp() {
    if (cart.length === 0) {
        showNotification("Tu carrito esta vacio.");
        return;
    }

    const lines = cart.map((item) => `- ${item.quantity} x ${item.name}: $${formatPrice(item.price * item.quantity)}`);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const message = [
        "Hola DYR Oportunidades, quiero consultar por este carrito:",
        "",
        ...lines,
        "",
        `Total: $${formatPrice(total)}`
    ].join("\n");

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
}

function sendProductToWhatsApp(id) {
    const product = products.find((item) => item.id === id);

    if (!product) return;

    const message = [
        "Hola DYR Oportunidades, quiero consultar por este producto:",
        "",
        `${product.name}`,
        `Cantidad: ${currentProductQuantity}`,
        `Precio: $${formatPrice(product.price)}`,
        window.location.href
    ].join("\n");

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
}

function openWhatsAppChat() {
    const message = "Hola DYR Oportunidades, quiero consultar por sus productos.";
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
}

function checkout() {
    if (cart.length === 0) {
        showNotification("Tu carrito ya esta vacio.");
        return;
    }

    cart = [];
    saveCart();
    updateCart();
    showNotification("Carrito vaciado.");
}

function showNotification(message) {
    const notification = document.getElementById("notification");

    if (!notification) return;

    notification.textContent = message;
    notification.classList.add("show");
    setTimeout(() => notification.classList.remove("show"), 3000);
}

function scrollToProducts() {
    document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" });
}

document.addEventListener("keydown", (event) => {
    const card = event.target.closest(".product-card[role='link']");

    if (!card) return;

    if (event.key === "Enter") {
        card.click();
    }
});

loadProducts();
