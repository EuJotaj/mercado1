document.addEventListener('DOMContentLoaded', () => {
    const sideOptions = document.querySelectorAll('.sideOption');
    const pages = document.querySelectorAll('.page');

    sideOptions.forEach(button => {
        button.addEventListener('click', () => {
            const targetPageId = button.dataset.page;
            pages.forEach(page => {
                page.classList.remove('active');
                page.classList.add('hide');
            });
            sideOptions.forEach(btn => {
                btn.classList.remove('active');
            });
            const targetPage = document.getElementById(targetPageId);
            if (targetPage) {
                targetPage.classList.remove('hide');
                targetPage.classList.add('active');
            }
            button.classList.add('active');
        });
    });

    let cartItems = [];
    const cartListContainer = document.getElementById('cart-items-list');
    const cartSummaryContainer = document.getElementById('cart-summary');
    const allAddToCartButtons = document.querySelectorAll('.add-to-cart-btn');

    allAddToCartButtons.forEach(button => {
        button.addEventListener('click', handleAddToCartClick);
    });

    function showNotification(message, duration = 2000) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, duration);
    }

    function handleAddToCartClick(event) {
        const button = event.currentTarget;
        const productCard = button.closest('.product-card, .product-card-home');
        if (!productCard) return;
        const id = button.dataset.productId;
        const name = productCard.querySelector('h2, h3').textContent;
        const priceString = productCard.querySelector('p').textContent;
        const imageSrc = productCard.querySelector('img').src;
        const price = parseFloat(priceString.replace('R$', '').replace('.', '').replace(',', '.').trim());
        addItemToCart({ id, name, price, imageSrc });
        showNotification(`"${name}" Foi adicionado ao Carrinho!`);
    }

    function addItemToCart(product) {
        const existingItem = cartItems.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cartItems.push({ ...product, quantity: 1 });
        }
        renderCart();
    }
    
    cartListContainer.addEventListener('click', (event) => {
        const target = event.target;
        const productId = target.dataset.id;
        if (!productId) return;
        if (target.classList.contains('increase-btn')) {
            updateQuantity(productId, 'increase');
        } else if (target.classList.contains('decrease-btn')) {
            updateQuantity(productId, 'decrease');
        } else if (target.classList.contains('remove-btn')) {
            removeItem(productId);
        }
    });

    function updateQuantity(productId, action) {
        const item = cartItems.find(i => i.id === productId);
        if (!item) return;
        if (action === 'increase') {
            item.quantity++;
        } else if (action === 'decrease') {
            item.quantity--;
            if (item.quantity === 0) {
                removeItem(productId);
                return;
            }
        }
        renderCart();
    }

    function removeItem(productId) {
        cartItems = cartItems.filter(i => i.id !== productId);
        renderCart();
    }

    function renderCart() {
        cartListContainer.innerHTML = '';
        if (cartItems.length === 0) {
            cartListContainer.innerHTML = '<li>Seu carrinho está vazio.</li>';
            cartSummaryContainer.innerHTML = '';
            return;
        }
        let total = 0;
        cartItems.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            const cartItemElement = document.createElement('li');
            cartItemElement.classList.add('cart-item');
            cartItemElement.innerHTML = `
                <img src="${item.imageSrc}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')} / un.</span>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn decrease-btn" data-id="${item.id}">-</button>
                    <span class="quantity-text">${item.quantity}</span>
                    <button class="quantity-btn increase-btn" data-id="${item.id}">+</button>
                    <button class="remove-btn" data-id="${item.id}">×</button>
                </div>
            `;
            cartListContainer.appendChild(cartItemElement);
        });
        cartSummaryContainer.innerHTML = `<h3>Total: R$ ${total.toFixed(2).replace('.', ',')}</h3>`;
    }

    renderCart();
});