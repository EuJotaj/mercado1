document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.querySelector('.main');
    const sidebarLinks = document.querySelectorAll('.sidebar button');
    const searchBar = document.querySelector('.navbar .searchbar');
    const cartCountSpan = document.querySelectorAll('.navbardir .fa-heart + span');


    const products = [
        { id: 1, name: 'Produto Incrível 1', price: 99.90, image: '/src/img/produto1.jpg', description: 'Descrição do Produto 1.' },
        { id: 2, name: 'Produto Fantástico 2', price: 149.90, image: '/src/img/produto2.jpg', description: 'Descrição do Produto 2.' },
        { id: 3, name: 'Produto Excepcional 3', price: 79.90, image: '/src/img/produto3.jpg', description: 'Descrição do Produto 3.' },
    ];

    let cart = loadCart();
    updateCartDisplay();


    async function loadPage(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            const newDocument = new DOMParser().parseFromString(html, 'text/html');
            const newContent = newDocument.querySelector('.main');

            if (mainContent && newContent) {
                mainContent.classList.add('slide-out');

                setTimeout(() => {
                    mainContent.innerHTML = newContent.innerHTML;
                    document.title = newDocument.title;
                    mainContent.classList.remove('slide-out');
                    mainContent.classList.add('slide-in');
                    attachEventListenersToNewContent();
                    updateCartDisplayOnNewPage();
                }, 300);
            }
        } catch (error) {
            console.error('Falha ao carregar a página:', error);

        }
    }


    function attachEventListenersToNewContent() {
        // Esta parte já existia, mas é crucial para adicionar o evento aos botões carregados dinamicamente
        const newAddToCartButtons = document.querySelectorAll('.product-card button');
        newAddToCartButtons.forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.dataset.productId);
                const productToAdd = products.find(p => p.id === productId);
                if (productToAdd) {
                    addToCart(productToAdd);
                }
            });
        });

        const productGridElement = document.querySelector('.product-grid');
        if (productGridElement) {
            if (searchBar) {
                searchBar.addEventListener('input', function() {
                    const searchTerm = this.value.toLowerCase();
                    filterProducts(searchTerm);
                });
            }
            displayProducts(products);
        }

        const cartItemsContainerElement = document.querySelector('.cart-items');
        if (cartItemsContainerElement) {
            displayCartItems();
        }
    }

    window.goToPageWithTransition = function(url) {
        loadPage(url);
        // Remove a classe 'active' de todos os botões da sidebar e adiciona ao clicado (opcional)
        sidebarLinks.forEach(button => button.classList.remove('active'));
        const clickedButton = Array.from(sidebarLinks).find(button => button.getAttribute('onclick').includes(`'${url}'`));
        if (clickedButton) {
            clickedButton.classList.add('active');
        }
    };

    // Carrinho de compras
    function addToCart(product) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        saveCart();
        updateCartDisplay();
    }

    function loadCart() {
        const storedCart = localStorage.getItem('shoppingCart');
        return storedCart ? JSON.parse(storedCart) : [];
    }

    function saveCart() {
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
    }

    function updateCartDisplay() {
        cartCountSpan.forEach(span => span.textContent = cart.reduce((sum, item) => sum + item.quantity, 0));
    }

    function updateCartDisplayOnNewPage() {
        const newCartCountSpan = document.querySelectorAll('.navbardir .fa-heart + span'); // Ajuste o seletor se necessário
        newCartCountSpan.forEach(span => span.textContent = cart.reduce((sum, item) => sum + item.quantity, 0));
    }

    function displayCartItems() {
        const cartItemsContainer = document.querySelector('.cart-items');
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '';
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<p>O carrinho está vazio.</p>';
            } else {
                cart.forEach(item => {
                    const cartItemDiv = document.createElement('div');
                    cartItemDiv.classList.add('cart-item');
                    cartItemDiv.innerHTML = `
                        <img src="${item.image}" alt="${item.name}">
                        <div class="cart-item-details">
                            <h3>${item.name}</h3>
                            <p>Preço: R$ ${item.price.toFixed(2)}</p>
                            <p>Quantidade: ${item.quantity}</p>
                        </div>
                        <span class="cart-item-price">R$ ${(item.price * item.quantity).toFixed(2)}</span>
                        <button class="remove-from-cart" data-product-id="${item.id}">Remover</button>
                    `;
                    cartItemsContainer.appendChild(cartItemDiv);

                    const removeButton = cartItemDiv.querySelector('.remove-from-cart');
                    removeButton.addEventListener('click', function() {
                        const productIdToRemove = parseInt(this.dataset.productId);
                        removeFromCart(productIdToRemove);
                    });
                });
            }
        }
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        updateCartDisplay();
        displayCartItems();
    }

    // Barra de pesquisa (funcional na página de produtos)
    function displayProducts(productList) {
        const productGrid = document.querySelector('.product-grid');
        if (productGrid) {
            productGrid.innerHTML = '';
            if (productList.length === 0) {
                productGrid.innerHTML = '<p>Nenhum produto encontrado.</p>';
            } else {
                productList.forEach(product => {
                    const productCard = document.createElement('div');
                    productCard.classList.add('product-card');
                    productCard.innerHTML = `
                        <img src="${product.image}" alt="${product.name}">
                        <h2>${product.name}</h2>
                        <p>R$ ${product.price.toFixed(2)}</p>
                        <button data-product-id="${product.id}">Adicionar ao Carrinho</button>
                    `;
                    productGrid.appendChild(productCard);
                });
                
                const newAddToCartButtons = productGrid.querySelectorAll('.product-card button');
                newAddToCartButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const productId = parseInt(this.dataset.productId);
                        const productToAdd = products.find(p => p.id === productId);
                        if (productToAdd) {
                            addToCart(productToAdd);
                        }
                    });
                });
            }
        }
    }

    function filterProducts(searchTerm) {
        const filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm)
        );
        displayProducts(filteredProducts);
    }

})