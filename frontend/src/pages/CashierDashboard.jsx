import { useState, useEffect } from 'react';

export default function CashierDashboard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://127.0.0.1:5000/api/delivery/orders", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();

            if (response.ok) {
                setOrders(data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Failed to fetch orders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // Auto-refresh every 15 seconds
        const interval = setInterval(fetchOrders, 15000);
        return () => clearInterval(interval);
    }, []);

    const handleDeliverOrder = async (orderId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://127.0.0.1:5000/api/orders/${orderId}/deliver`, {
                method: "PATCH",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                // Remove the order from the UI once it's delivered
                setOrders(prev => prev.filter(order => order._id !== orderId));
            } else {
                alert("Failed to deliver order.");
            }
        } catch (err) {
            alert("Network error.");
        }
    };

    if (loading) return <div className="text-center mt-20 font-bold">Loading Cashier View...</div>;
    if (error) return <div className="text-center mt-20 text-red-500 font-bold">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex justify-between items-center">
                    <span>Cashier Dashboard 💵</span>
                    <button onClick={fetchOrders} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded-lg">
                        🔄 Refresh
                    </button>
                </h1>

                <div className="bg-green-50 p-6 rounded-2xl border border-green-100 shadow-sm">
                    <h2 className="text-xl font-bold text-green-800 mb-6 flex items-center justify-between border-b border-green-200 pb-3">
                        <span>Ready for Delivery</span>
                        <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm">{orders.length} Orders</span>
                    </h2>

                    {orders.length === 0 ? (
                        <p className="text-gray-500 font-medium">No orders waiting for delivery.</p>
                    ) : (
                        <div className="space-y-4">
                            {orders.map(order => (
                                <div key={order._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-extrabold text-gray-800 text-lg">#{order._id.slice(-6)}</span>
                                            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                                {new Date(order.createdAt).toLocaleTimeString()}
                                            </span>
                                        </div>

                                        <ul className="mb-2 text-sm text-gray-700">
                                            {order.items.map((item, index) => (
                                                <li key={index} className="flex items-start">
                                                    <span className="font-bold mr-2">{item.quantity}x</span>
                                                    {item.menuItem?.title || 'Unknown Item'}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="font-black text-blue-600 text-lg">Total: ${order.totalPrice?.toFixed(2)}</div>
                                    </div>

                                    <button
                                        onClick={() => handleDeliverOrder(order._id)}
                                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm whitespace-nowrap"
                                    >
                                        Deliver & Complete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}