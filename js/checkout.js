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

    console.log('Checking user ID from localStorage:', userId);
    console.log('Checking authToken from localStorage:', authToken);

    if (!userId || !authToken) {
        alert('User not authenticated. Please log in.');
        window.location.href = 'login.html';
        return;
    }

    bankDetailsSection.style.display = 'none';
    easypaisaDetailsSection.style.display = 'none';
    jazzcashDetailsSection.style.display = 'none';

    paymentMethodInputs.forEach(input => {
        input.addEventListener('change', handlePaymentMethodChange);
    });

    console.log('Fetching cart items for user:', userId);
    fetchCartItems();

    // Update cart count on page load
    updateCartCount();

    function fetchCartItems() {
        fetch(`http://localhost:3000/api/cart/${userId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch cart items');
            }
            return response.json();
        })
        .then(cart => {
            console.log('Cart fetched successfully:', cart);
            if (cart.items && cart.items.length > 0) {
                displayOrderItems(cart.items);
                updateTotalPrices(cart.items);
            } else {
                orderSummaryElement.innerHTML = '<p>Your cart is empty.</p>';
                updateTotalPrices([]);
            }
        })
        .catch(error => console.error('Error fetching cart items:', error));
    }

    function displayOrderItems(items) {
        console.log('Displaying order items:', items);
        let itemsHTML = '';

        items.forEach(item => {
            itemsHTML += `
                <div class="order-item d-flex justify-content-between align-items-center mb-3">
                    <div class="item-image">
                        <img src="http://localhost:3000${item.product.image}" alt="${item.product.name}" class="img-thumbnail">
                    </div>
                    <div class="item-details ml-3 flex-grow-1">
                        <p><strong>${item.product.name}</strong></p>
                        <p>Color: ${item.product.color || 'N/A'}</p>
                        <p>Size: ${item.product.size || 'N/A'}</p>
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
            </div>
            <button type="submit" id="place-order-button" class="btn btn-primary btn-block mt-3">
                Place Order
            </button>
        `;

        orderSummaryElement.innerHTML = itemsHTML;
        attachEventListeners();
    }

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

    function attachEventListeners() {
        const placeOrderButton = document.getElementById('place-order-button');
        if (placeOrderButton) {
            console.log('Adding event listener to Place Order button.');
            placeOrderButton.addEventListener('click', function (event) {
                event.preventDefault(); // Ensure form does not submit traditionally
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

                if (selectedPaymentMethod.value === 'COD') {
                    createOrder();
                } else {
                    alert('Redirecting to payment gateway...');
                    createOrder();
                }
            });
        } else {
            console.error('Place Order button not found in DOM.');
        }
    }

    function handlePaymentMethodChange(event) {
        const selectedPaymentMethod = event.target.value;
        console.log('Payment method changed:', selectedPaymentMethod);

        bankDetailsSection.style.display = selectedPaymentMethod === 'Bank' ? 'block' : 'none';
        easypaisaDetailsSection.style.display = selectedPaymentMethod === 'Easypaisa' ? 'block' : 'none';
        jazzcashDetailsSection.style.display = selectedPaymentMethod === 'JazzCash' ? 'block' : 'none';
    }

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

    function createOrder() {
        console.log('Creating order...');
        
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const email = document.getElementById('email-address').value;
        const phone = document.getElementById('telephone').value;
        const address = document.getElementById('billing-address').value;
        const city = document.getElementById('city').value;
        const postalCode = document.getElementById('postal-code').value;

        const orderDetails = {
            userId: userId,
            shippingAddress: {
                firstName,
                lastName,
                email,
                phone,
                address,
                city,
                postalCode,
            },
            paymentMethod: document.querySelector('input[name="payment-method"]:checked').value,
            totalAmount: parseFloat(grandTotalElement.textContent.replace('PKR ', ''))
        };

        console.log('Order details:', orderDetails);

        fetch('http://localhost:3000/api/orders/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(orderDetails)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message); });
            }
            return response.json();
        })
        .then(order => {
            console.log('Order created successfully:', order);
            alert('Order created successfully!');

            // Reset the cart count
            updateCartCount();

            window.location.href = 'order-confirmation.html';
        })
        .catch(error => {
            console.error('Error creating order:', error);
            alert('Failed to create order. Please try again.');
        });
    }

    // Function to update the cart count in the header
    function updateCartCount() {
        fetch(`http://localhost:3000/api/cart/${userId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            }
        })
        .then(response => response.json())
        .then(cart => {
            const cartCountElement = document.getElementById('cart-count');
            const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
            cartCountElement.textContent = itemCount;
        })
        .catch(error => console.error('Error fetching cart count:', error));
    }
});
