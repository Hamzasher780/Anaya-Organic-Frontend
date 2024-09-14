document.addEventListener('DOMContentLoaded', function () {
    console.log('Page loaded.');

    const orderSummaryElement = document.getElementById('order-summary');
    const subtotalElement = document.getElementById('subtotal-amount');
    const grandTotalElement = document.getElementById('grand-total-amount');
    const paymentMethodInputs = document.querySelectorAll('input[name="payment-method"]');
    const bankDetailsSection = document.getElementById('bank-details');
    const easypaisaDetailsSection = document.getElementById('easypaisa-details');
    const jazzcashDetailsSection = document.getElementById('jazzcash-details');
    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');
    let buyNowProductId = localStorage.getItem('buyNowProductId');

    console.log('Checking user ID from localStorage:', userId);
    console.log('Checking authToken from localStorage:', authToken);

    // If user is not authenticated, redirect to login
    if (!userId || !authToken) {
        alert('User not authenticated. Please log in.');
        window.location.href = 'login.html';
        return;
    }

    // Hide bank, Easypaisa, and JazzCash details by default
    bankDetailsSection.style.display = 'none';
    easypaisaDetailsSection.style.display = 'none';
    jazzcashDetailsSection.style.display = 'none';

    // Fetch cart or Buy Now product details
    if (buyNowProductId) {
        // Fetch and display Buy Now product
        fetchSingleProduct(buyNowProductId);
    } else {
        // Fetch cart details
        fetch(`${config.API_URL}/api/cart/${userId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            }
        })
        .then(response => response.json())
        .then(cart => {
            if (cart.items && cart.items.length > 0) {
                // If cart has items, clear Buy Now product
                clearBuyNow();
                displayOrderItems(cart.items);
                updateTotalPrices(cart.items);
            } else {
                // Cart and Buy Now are both empty
                orderSummaryElement.innerHTML = '<p>Your cart is empty.</p>';
                updateTotalPrices([]);
            }
        })
        .catch(error => {
            console.error('Error fetching cart items:', error);
            alert('Error fetching cart items. Please try again.');
        });
    }

    // Clear Buy Now product from localStorage
    function clearBuyNow() {
        localStorage.removeItem('buyNowProductId');
        buyNowProductId = null;
    }

    // Fetch single product for Buy Now functionality
    function fetchSingleProduct(productId) {
        fetch(`${config.API_URL}/api/products/${productId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch product');
            }
            return response.json();
        })
        .then(product => {
            console.log('Product fetched successfully:', product);
            displayBuyNowProduct(product);
            updateTotalPrices([{ product, quantity: 1 }]); // Single product with quantity 1
            ensurePlaceOrderButton();
        })
        .catch(error => {
            console.error('Error fetching product:', error);
            alert('Error fetching product. Please try again.');
        });
    }

    // Display Buy Now product in the checkout summary
    function displayBuyNowProduct(product) {
        console.log('Displaying Buy Now product:', product);

        const itemHTML = `
            <div class="order-item d-flex justify-content-between align-items-center mb-3">
                <div class="item-image">
                    <img src="${config.API_URL}${product.image}" alt="${product.name}" class="img-thumbnail">
                </div>
                <div class="item-details ml-3 flex-grow-1">
                    <p><strong>${product.name}</strong></p>
                </div>
                <div class="item-quantity">
                    Qty: 1
                </div>
                <div class="item-price">
                    <strong>PKR ${product.price.toFixed(2)}</strong>
                </div>
            </div>`;

        orderSummaryElement.innerHTML = itemHTML;
    }

    // Display items from the cart in the checkout summary
    function displayOrderItems(items) {
        console.log('Displaying order items:', items);
        let itemsHTML = '';

        items.forEach(item => {
            itemsHTML += `
                <div class="order-item d-flex justify-content-between align-items-center mb-3">
                    <div class="item-image">
                        <img src="${config.API_URL}${item.product.image}" alt="${item.product.name}" class="img-thumbnail">
                    </div>
                    <div class="item-details ml-3 flex-grow-1">
                        <p><strong>${item.product.name}</strong></p>
                    </div>
                    <div class="item-quantity">
                        Qty: ${item.quantity}
                    </div>
                    <div class="item-price">
                        <strong>PKR ${(item.product.price * item.quantity).toFixed(2)}</strong>
                    </div>
                </div>`;
        });

        itemsHTML += `
            <div class="summary-totals mt-4">
                <div class="d-flex justify-content-between">
                    <p>Subtotal</p>
                    <p><strong id="subtotal-amount">PKR 0</strong></p>
                </div>
                <div class="d-flex justify-content-between">
                    <p>Shipping Total</p>
                    <p><strong id="shipping-amount">Free</strong></p>
                </div>
                <div class="d-flex justify-content-between">
                    <p>Grand Total</p>
                    <p><strong id="grand-total-amount">PKR 0</strong></p>
                </div>
            </div>`;

        orderSummaryElement.innerHTML = itemsHTML;
        ensurePlaceOrderButton();
    }

    // Update the total prices (subtotal and grand total)
    function updateTotalPrices(items) {
        let subtotal = 0;
        items.forEach(item => {
            const itemTotal = item.product.price * item.quantity;
            subtotal += itemTotal;
        });
        console.log('Calculated subtotal:', subtotal);
        subtotalElement.textContent = `PKR ${subtotal.toFixed(2)}`;
        grandTotalElement.textContent = `PKR ${subtotal.toFixed(2)}`;
    }

    // Ensure the "Place Order" button is added to the DOM
    function ensurePlaceOrderButton() {
        const placeOrderButtonExists = document.getElementById('place-order-button');
        if (!placeOrderButtonExists) {
            const buttonHTML = `
                <button type="submit" id="place-order-button" class="btn btn-primary btn-block mt-3">
                    Place Order
                </button>`;
            orderSummaryElement.insertAdjacentHTML('beforeend', buttonHTML);
            attachEventListeners();
        }
    }

    // Attach event listeners to the "Place Order" button
    function attachEventListeners() {
        const placeOrderButton = document.getElementById('place-order-button');
        if (placeOrderButton) {
            console.log('Adding event listener to Place Order button.');
            placeOrderButton.addEventListener('click', function (event) {
                event.preventDefault(); // Prevent traditional form submission
                console.log('Place order button clicked.');

                if (!validateFormFields()) {
                    alert('Please fill in all required fields.');
                    return;
                }

                const selectedPaymentMethod = document.querySelector('input[name="payment-method"]:checked');
                if (!selectedPaymentMethod) {
                    alert('Please select a payment method.');
                    return;
                }

                createOrder();
            });
        } else {
            console.error('Place Order button not found in DOM.');
        }
    }

    // Validate form fields before placing the order
    function validateFormFields() {
        const firstName = document.getElementById('first-name').value.trim();
        const lastName = document.getElementById('last-name').value.trim();
        const email = document.getElementById('email-address').value.trim();
        const phone = document.getElementById('telephone').value.trim();
        const address = document.getElementById('billing-address').value.trim();
        const city = document.getElementById('city').value.trim();
        const postalCode = document.getElementById('postal-code').value.trim();

        if (!firstName || !lastName || !email || !phone || !address || !city || !postalCode) {
            console.error('Validation failed: some fields are empty.');
            return false;
        }

        return true;
    }

    // Create an order by sending data to the backend
    function createOrder() {
        console.log('Creating order with Buy Now Product ID:', buyNowProductId);
    
        const orderData = {
            userId,
            paymentMethod: getSelectedPaymentMethod(),
            totalAmount: parseFloat(grandTotalElement.textContent.replace('PKR ', '')),
            shippingAddress: {
                firstName: document.getElementById('first-name').value,
                lastName: document.getElementById('last-name').value,
                email: document.getElementById('email-address').value,
                phone: document.getElementById('telephone').value,
                address: document.getElementById('billing-address').value,
                city: document.getElementById('city').value,
                postalCode: document.getElementById('postal-code').value,
            },
            buyNowProductId,
        };
    
        console.log('Order data to be sent:', orderData);
    
        fetch(`${config.API_URL}/api/orders/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(orderData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text(); // Get response as text
        })
        .then(responseText => {
            try {
                const order = JSON.parse(responseText); // Try parsing response as JSON
                console.log('Order created successfully:', order);
                alert('Order placed successfully!');
                clearBuyNow();
                window.location.href = 'order-confirmation.html';
            } catch (e) {
                console.error('Error parsing response as JSON:', e);
                alert('Error placing order. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error placing order:', error);
            alert('Error placing order. Please try again.');
        });
    }
    

    // Get selected payment method
    function getSelectedPaymentMethod() {
        const selectedPaymentMethod = document.querySelector('input[name="payment-method"]:checked');
        return selectedPaymentMethod ? selectedPaymentMethod.value : '';
    }

    // Event listeners for payment method selection
    paymentMethodInputs.forEach(input => {
        input.addEventListener('change', function () {
            if (this.value === 'bank') {
                bankDetailsSection.style.display = 'block';
                easypaisaDetailsSection.style.display = 'none';
                jazzcashDetailsSection.style.display = 'none';
            } else if (this.value === 'easypaisa') {
                bankDetailsSection.style.display = 'none';
                easypaisaDetailsSection.style.display = 'block';
                jazzcashDetailsSection.style.display = 'none';
            } else if (this.value === 'jazzcash') {
                bankDetailsSection.style.display = 'none';
                easypaisaDetailsSection.style.display = 'none';
                jazzcashDetailsSection.style.display = 'block';
            }
        });
    });
});
