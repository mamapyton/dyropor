// PRODUCTOS DE EJEMPLO
const products = [
    { id: 1, name: "Camiseta Estampada", category: "ropa", price: 299, oldPrice: 450, emoji: "👕" },
    { id: 2, name: "Audífonos Bluetooth", category: "electronica", price: 899, oldPrice: 1200, emoji: "🎧" },
    { id: 3, name: "Lámpara LED Moderna", category: "hogar", price: 599, oldPrice: 800, emoji: "💡" },
    { id: 4, name: "Set de Maquillaje", category: "belleza", price: 450, oldPrice: 650, emoji: "💄" },
    { id: 5, name: "Jeans Slim Fit", category: "ropa", price: 699, oldPrice: 950, emoji: "👖" },
    { id: 6, name: "Smartwatch Pro", category: "electronica", price: 2499, oldPrice: 3200, emoji: "⌚" },
    { id: 7, name: "Jarrón Decorativo", category: "hogar", price: 350, oldPrice: 500, emoji: "🏺" },
    { id: 8, name: "Perfume Floral", category: "belleza", price: 1200, oldPrice: 1500, emoji: "🌸" },
    { id: 9, name: "Sudadera Hoodie", category: "ropa", price: 549, oldPrice: 750, emoji: "🧥" },
    { id: 10, name: "Bocina Portátil", category: "electronica", price: 799, oldPrice: 1100, emoji: "🔊" },
    { id: 11, name: "Almohada Ortopédica", category: "hogar", price: 399, oldPrice: 600, emoji: "🛏️" },
    { id: 12, name: "Crema Hidratante", category: "belleza", price: 280, oldPrice: 400, emoji: "✨" }
];

let cart = [];

// CARGAR PRODUCTOS
function renderProducts(filter = 'todos') {
    const grid = document.getElementById('productsGrid');
    const filtered = filter === 'todos' ? products : products.filter(p => p.category === filter);
    
    grid.innerHTML = filtered.map(product => `
        <div class="product-card">
            <div class="product-image">${product.emoji}</div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <div>
                    <span class="product-price">$${product.price}</span>
                    <span class="product-old-price">$${product.oldPrice}</span>
                </div>
                <button class="product-btn" onclick="addToCart(${product.id})">
                    <i class="fas fa-cart-plus"></i> Agregar al Carrito
                </button>
            </div>
        </div>
    `).join('');
}

// FILTRAR PRODUCTOS
function filterProducts(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderProducts(category);
}

// AGREGAR AL CARRITO
function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);
    
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCart();
    showNotification(`✅ ${product.name} agregado al carrito`);
}

// ACTUALIZAR CARRITO
function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío 🛒</p>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-img">${item.emoji}</div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div>Cantidad: ${item.quantity}</div>
                    <div class="cart-item-price">$${item.price * item.quantity}</div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">🗑️</button>
            </div>
        `).join('');
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2);
}

// ELIMINAR DEL CARRITO
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
}

// ABRIR/CERRAR CARRITO
function toggleCart() {
    document.getElementById('cartSidebar').classList.toggle('open');
    document.getElementById('cartOverlay').classList.toggle('open');
}

// CHECKOUT
function checkout() {
    if (cart.length === 0) {
        showNotification('❌ Tu carrito está vacío');
        return;
    }
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    showNotification(`🎉 ¡Compra realizada! Total: $${total.toFixed(2)}`);
    cart = [];
    updateCart();
    toggleCart();
}

// NOTIFICACIÓN
function showNotification(message) {
    const notif = document.getElementById('notification');
    notif.textContent = message;
    notif.classList.add('show');
    setTimeout(() => notif.classList.remove('show'), 3000);
}

// SCROLL
function scrollToProducts() {
    document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
}

// INICIAR
renderProducts();
