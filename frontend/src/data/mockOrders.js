// NoshFlow/frontend/src/data/mockOrders.js

export const mockOrders = [
    {
        id: "ORD-1001",
        customerName: "Alice Smith",
        items: [
            { name: "Classic Cheeseburger", quantity: 2 },
            { name: "French Fries", quantity: 1 }
        ],
        totalPrice: 21.97,
        status: "Pending", // Statuses: Pending, Preparing, Ready, Completed
        time: "10:30 AM"
    },
    {
        id: "ORD-1002",
        customerName: "Bob Jones",
        items: [
            { name: "Margherita Pizza", quantity: 1 },
            { name: "Coca Cola", quantity: 2 }
        ],
        totalPrice: 16.48,
        status: "Preparing",
        time: "10:45 AM"
    },
    {
        id: "ORD-1003",
        customerName: "Charlie Brown",
        items: [
            { name: "Caesar Salad", quantity: 1 }
        ],
        totalPrice: 6.99,
        status: "Ready",
        time: "10:50 AM"
    }
];