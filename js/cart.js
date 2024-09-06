document.addEventListener('DOMContentLoaded', function () {
    const cartCountElement = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const totalPriceElement = document.getElementById('total-price');
    const subtotalPriceElement = document.getElementById('subtotal-price');
    const userId = localStorage.getItem('userId');

    if (!userId) {
        console.error('User ID not found in localStorage. Please ensure the user is logged in.');
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '<p>Please log in to view your cart.</p>';
        }
        return;
    }

    fetchCartItems();

    function fetchCartItems() {
        console.log('Fetching cart items for user:', userId);
        fetch(`${config.API_URL}/api/cart/${userId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            }
        })
        .then(response => response.json())
        .then(cart => {
            console.log('Cart fetched successfully:', cart);
            if (cart.items && cart.items.length > 0) {
                displayCartItems(cart.items);
                updateTotalPrice(cart.items);
                updateCartCount(cart.items.length);
            } else {
                console.log('Cart is empty.');
                if (cartItemsContainer) {
                    cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
                }
                updateCartCount(0);
            }
        })
        .catch(error => console.error('Error fetching cart items:', error));
    }

    function displayCartItems(items) {
        console.log('Displaying cart items:', items);
        cartItemsContainer.innerHTML = ''; // Clear previous items
    
        items.forEach(item => {
            if (!item.product || typeof item.product.price !== 'number' || isNaN(item.product.price)) {
                console.error('Invalid product data detected:', item);
                return; // Skip rendering this item
            }

            const productPrice = item.product.price;
            console.log('Rendering product with valid price:', productPrice);

            const cartItemHTML = `
                <div class="cart-item d-flex align-items-center mb-4 p-3 border rounded shadow-sm">
                    <div class="cart-item-image-wrapper">
                        <img src="${config.API_URL}${item.product.image}" alt="${item.product.name}" class="cart-item-image rounded">
                    </div>
                    <div class="item-details flex-grow-1 ml-3">
                        <h5 class="cart-item-title">${item.product.name}</h5>
                        <p class="cart-item-price text-muted">PKR ${productPrice}</p>
                    </div>
                    <div class="cart-item-quantity-wrapper">
                        <div class="cart-item-quantity d-flex align-items-center">
                            <button class="quantity-decrease custom-btn" data-product-id="${item.product._id}">-</button>
                            <input type="number" class="form-control text-center mx-2 quantity-input" value="${item.quantity}" min="1" data-product-id="${item.product._id}">
                            <button class="quantity-increase custom-btn" data-product-id="${item.product._id}">+</button>
                        </div>
                    </div>
                    <div class="item-price text-right ml-3">
                        <p class="mb-0 font-weight-bold">PKR ${(productPrice * item.quantity).toFixed(2)}</p>
                    </div>
                    <button class="remove-from-cart" data-product-id="${item.product._id}">
                        <i class="custom-trash-icon fa fa-trash"></i>
                    </button>
                </div>
            `;
            cartItemsContainer.insertAdjacentHTML('beforeend', cartItemHTML);
        });
    
        attachEventListeners();
    }
    
    function updateTotalPrice(items) {
        let total = 0;
        items.forEach(item => {
            const productPrice = item.product.price;
            if (isNaN(productPrice)) {
                console.error('Invalid product price found, skipping this item in total calculation:', item);
                return; // Skip this item in calculation
            }
            total += productPrice * item.quantity;
        });

        if (isNaN(total)) {
            console.error('Total price calculated as NaN. Check item data:', items);
            total = 0; // Set a fallback value
        }

        console.log('Updating total price. Subtotal:', total);
        subtotalPriceElement.textContent = `PKR ${total}`;
        totalPriceElement.textContent = `PKR ${total}`;
    }

    function attachEventListeners() {
        const decreaseButtons = document.querySelectorAll('.quantity-decrease');
        const increaseButtons = document.querySelectorAll('.quantity-increase');
        const quantityInputs = document.querySelectorAll('.quantity-input');
        const removeButtons = document.querySelectorAll('.remove-from-cart');

        decreaseButtons.forEach(button => {
            button.addEventListener('click', function () {
                const productId = this.getAttribute('data-product-id');
                console.log('Decrease button clicked for product:', productId);
                changeQuantity(productId, -1);
            });
        });

        increaseButtons.forEach(button => {
            button.addEventListener('click', function () {
                const productId = this.getAttribute('data-product-id');
                console.log('Increase button clicked for product:', productId);
                changeQuantity(productId, 1);
            });
        });

        quantityInputs.forEach(input => {
            input.addEventListener('change', function () {
                const productId = this.getAttribute('data-product-id');
                let newQuantity = parseInt(this.value);
                console.log('Quantity input changed for product:', productId, 'New quantity:', newQuantity);
                if (isNaN(newQuantity) || newQuantity < 1) {
                    newQuantity = 1;
                    this.value = newQuantity;
                }
                updateCartItem(productId, newQuantity);
            });
        });

        removeButtons.forEach(button => {
            button.addEventListener('click', function () {
                const productId = this.getAttribute('data-product-id');
                console.log('Remove button clicked for product:', productId);
                removeFromCart(productId);
            });
        });
    }

    function changeQuantity(productId, delta) {
        const input = document.querySelector(`.quantity-input[data-product-id="${productId}"]`);
        let newQuantity = parseInt(input.value) + delta;
        console.log('Changing quantity for product:', productId, 'New quantity:', newQuantity);
        if (isNaN(newQuantity) || newQuantity < 1) newQuantity = 1;
        input.value = newQuantity;

        updateCartItem(productId, newQuantity);
    }

    function updateCartItem(productId, quantity) {
        console.log('Updating cart item:', productId, 'New quantity:', quantity);
        fetch(`${config.API_URL}/api/cart/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify({ userId: localStorage.getItem('userId'), productId, quantity }),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message); });
            }
            return response.json();
        })
        .then(cart => {
            console.log('Cart updated successfully:', cart);
            displayCartItems(cart.items);
            updateTotalPrice(cart.items);
        })
        .catch(error => {
            console.error('Error updating cart item:', error);
            fetchCartItems();
        });
    }

    function removeFromCart(productId) {
        console.log('Removing item from cart:', productId);
        fetch(`${config.API_URL}/api/cart/remove`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify({ userId: localStorage.getItem('userId'), productId }),
        })
        .then(response => response.json())
        .then(cart => {
            console.log('Item removed successfully:', cart);
            displayCartItems(cart.items);
            updateTotalPrice(cart.items);
            updateCartCount(cart.items.length);
        })
        .catch(error => console.error('Error removing item from cart:', error));
    }

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function () {
            console.log('Checkout button clicked.');
            window.location.href = 'checkout.html';
        });
    }
});
