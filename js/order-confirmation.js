document.addEventListener('DOMContentLoaded', function () {
    const orderId = localStorage.getItem('orderId');
    const shippingAddress = localStorage.getItem('shippingAddress');
    const totalAmount = localStorage.getItem('totalAmount');
    const orderItems = JSON.parse(localStorage.getItem('orderItems'));

    document.getElementById('order-id').textContent = orderId;
    document.getElementById('shipping-address').textContent = shippingAddress;
    document.getElementById('total-amount').textContent = totalAmount;

    const orderItemsElement = document.getElementById('order-items');
    orderItems.forEach(item => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <span>${item.name} x ${item.quantity}</span>
            <span>PKR ${item.price}</span>
        `;
        orderItemsElement.appendChild(listItem);
    });
});
