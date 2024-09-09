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

    if (!userId || !authToken) {
        alert('User not authenticated. Please log in.');
        window.location.href = 'login.html';
        return;
    }

    // Hide bank, Easypaisa, and JazzCash details by default
    bankDetailsSection.style.display = 'none';
    easypaisaDetailsSection.style.display = 'none';
    jazzcashDetailsSection.style.display = 'none';

    // Attach change handler for payment methods
    paymentMethodInputs.forEach(input => {
        input.addEventListener('change', handlePaymentMethodChange);
    });

    // Prioritize Cart Checkout over Buy Now
    fetch(`${config.API_URL}/api/cart/${userId}`, {
        headers: {
            'Authorization': `Bearer ${authToken}`,
        }
    })
    .then(response => response.json())
    .then(cart => {
        if (cart.items && cart.items.length > 0) {
            // Clear Buy Now product if cart has items
            clearBuyNow();
            displayOrderItems(cart.items);
            updateTotalPrices(cart.items);
        } else if (buyNowProductId) {
            // If cart is empty but Buy Now product exists, fetch and display it
            fetchSingleProduct(buyNowProductId);
        } else {
            // Cart and Buy Now are both empty, display a message
            orderSummaryElement.innerHTML = '<p>Your cart is empty.</p>';
            updateTotalPrices([]);
        }
    })
    .catch(error => console.error('Error fetching cart items:', error));

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

            // *** Ensure the "Place Order" button is displayed for Buy Now flow ***
            ensurePlaceOrderButton();
        })
        .catch(error => console.error('Error fetching product:', error));
    }

    // Ensure the "Place Order" button is added to the DOM for Buy Now flow
    function ensurePlaceOrderButton() {
        const placeOrderButtonExists = document.getElementById('place-order-button');
        if (!placeOrderButtonExists) {
            const buttonHTML = `
                <button type="submit" id="place-order-button" class="btn btn-primary btn-block mt-3">
                    Place Order
                </button>
            `;
            orderSummaryElement.insertAdjacentHTML('beforeend', buttonHTML);
            attachEventListeners();
        }
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
            </div>
        `;

        orderSummaryElement.innerHTML = itemsHTML;
        ensurePlaceOrderButton();  // Ensure button is present for cart checkout flow
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

                if (selectedPaymentMethod.value === 'COD') {
                    createOrder();
                } else {
                    handleProofOfPayment(selectedPaymentMethod.value);
                }
            });
        } else {
            console.error('Place Order button not found in DOM.');
        }
    }

    // Handle changing the payment method
    function handlePaymentMethodChange(event) {
        const selectedPaymentMethod = event.target.value;
        console.log('Payment method changed:', selectedPaymentMethod);

        bankDetailsSection.style.display = selectedPaymentMethod === 'Bank' ? 'block' : 'none';
        easypaisaDetailsSection.style.display = selectedPaymentMethod === 'Easypaisa' ? 'block' : 'none';
        jazzcashDetailsSection.style.display = selectedPaymentMethod === 'JazzCash' ? 'block' : 'none';
    }

    // Handle proof of payment for non-COD methods
    function handleProofOfPayment(paymentMethod) {
        const proofInput = document.querySelector(`#${paymentMethod.toLowerCase()}-proof`);
        if (!proofInput || !proofInput.files.length) {
            alert(`Please upload proof of payment for ${paymentMethod}.`);
            return;
        }

        createOrder(paymentMethod, proofInput.files[0]);
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
    // Create an order by sending data as JSON to the backend
function createOrder(paymentMethod = 'COD', proofOfPaymentFile = null) {
    console.log('Creating order...');
    
    const firstName = document.getElementById('first-name').value || '';
    const lastName = document.getElementById('last-name').value || '';
    const email = document.getElementById('email-address').value || '';
    const phone = document.getElementById('telephone').value || '';
    const address = document.getElementById('billing-address').value || '';
    const city = document.getElementById('city').value || '';
    const postalCode = document.getElementById('postal-code').value || '';

    // Ensure none of the fields are undefined or null
    if (!firstName || !lastName || !email || !phone || !address || !city || !postalCode) {
        console.error('Some required fields are empty.');
        alert('Please fill out all fields.');
        return;
    }

    // Construct the shippingAddress object
    const shippingAddress = {
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        postalCode
    };

    // Construct the order data
    const orderData = {
        userId: userId,
        paymentMethod: paymentMethod,
        totalAmount: parseFloat(grandTotalElement.textContent.replace('PKR ', '')),
        shippingAddress: shippingAddress,  // Send as JSON object
        buyNowProductId: buyNowProductId ? buyNowProductId : null
    };

    console.log('Order details:', orderData);

    fetch(`${config.API_URL}/api/orders/create`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json' // Important: sending as JSON
        },
        body: JSON.stringify(orderData) // Convert the orderData object to a JSON string
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

        // Clear the Buy Now product and reset the cart count
        clearBuyNow();
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
        fetch(`${config.API_URL}/api/cart/${userId}`, {
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
