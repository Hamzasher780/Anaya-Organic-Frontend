document.addEventListener('DOMContentLoaded', function () {
    const userId = localStorage.getItem('userId');

    fetch(`http://localhost:3000/api/orders/user/${userId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        }
    })
    .then(response => response.json())
    .then(orders => {
        const orderHistoryList = document.getElementById('order-history-list');
        orders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.className = 'order-history-item';
            orderElement.innerHTML = `
                <h5>Order ID: ${order._id}</h5>
                <p><strong>Status:</strong> ${order.status}</p>
                <p><strong>Total Amount:</strong> PKR ${order.totalAmount}</p>
                <button class="btn btn-primary" onclick="viewOrderDetails('${order._id}')">View Details</button>
            `;
            orderHistoryList.appendChild(orderElement);
        });
    })
    .catch(error => console.error('Error fetching order history:', error));
});

function viewOrderDetails(orderId) {
    localStorage.setItem('orderId', orderId);
    window.location.href = 'order-details.html';
}
