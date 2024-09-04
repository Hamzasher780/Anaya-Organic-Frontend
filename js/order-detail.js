document.addEventListener('DOMContentLoaded', function () {
    const orderId = localStorage.getItem('orderId');

    fetch(`http://localhost:3000/api/orders/${orderId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        }
    })
    .then(response => response.json())
    .then(order => {
        document.getElementById('order-id').textContent = order._id;
        document.getElementById('order-status').textContent = order.status;
        document.getElementById('shipping-address').textContent = order.shippingAddress;
        document.getElementById('total-amount').textContent = order.totalAmount.toFixed(2);

        const orderItemsElement = document.getElementById('order-items');
        order.items.forEach(item => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';
            listItem.innerHTML = `
                <img src="${item.product.image}" alt="${item.product.name}">
                <span>${item.product.name} x ${item.quantity}</span>
                <span>PKR ${item.price}</span>
            `;
            orderItemsElement.appendChild(listItem);
        });
    })
    .catch(error => console.error('Error fetching order details:', error));
});
