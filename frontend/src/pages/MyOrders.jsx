import { useState, useEffect } from 'react';

// کامپوننت جدید برای محاسبه و نمایش تایمر معکوس
const CountdownTimer = ({ updatedAt, estimatedPrepTime }) => {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        if (!updatedAt || !estimatedPrepTime) return;

        const targetTime = new Date(updatedAt).getTime() + (estimatedPrepTime * 60000);

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const difference = targetTime - now;

            if (difference <= 0) {
                setTimeLeft("00:00");
                clearInterval(interval);
            } else {
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                // فرمت‌بندی به شکل MM:SS
                setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [updatedAt, estimatedPrepTime]);

    if (!timeLeft) return null;

    return <span className="font-mono text-lg ml-1 bg-indigo-100 px-2 py-0.5 rounded text-indigo-800">{timeLeft}</span>;
};

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchMyOrders = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://127.0.0.1:5000/api/orders/me", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();

            if (response.ok) {
                setOrders(data);
            } else {
                setError(data.message || "Failed to load your orders.");
            }
        } catch (err) {
            setError("Connection error. Server might be down.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyOrders();
        const interval = setInterval(fetchMyOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const cancelOrder = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://127.0.0.1:5000/api/orders/${id}/cancel`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order._id === id ? { ...order, status: 'Cancelled' } : order
                    )
                );
            } else {
                const data = await response.json();
                alert(data.message || "Failed to cancel order.");
            }
        } catch (error) {
            alert("Network error while canceling order.");
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'registered': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'ready for delivery': return 'bg-green-100 text-green-800 border-green-200';
            case 'delivered': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading && orders.length === 0) return <div className="text-center mt-20 text-xl font-bold">Loading Your Orders... ⏳</div>;
    if (error) return <div className="text-center mt-20 text-red-500 font-bold">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex justify-between items-center">
                    <span>My Orders 🛍️</span>
                    <button onClick={fetchMyOrders} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded-lg">
                        🔄 Refresh
                    </button>
                </h1>

                {orders.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
                        <p className="text-gray-500 text-lg">You haven't placed any orders yet!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map(order => (
                            <div key={order._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center">
                                <div className="mb-4 md:mb-0">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <span className="font-extrabold text-gray-900 text-lg">Order #{order._id.slice(-6)}</span>
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>

                                    {/* نمایش تایمر فقط در صورت Preparing بودن */}
                                    {order.status === 'Preparing' && order.estimatedPrepTime && (
                                        <div className="text-sm font-bold text-indigo-600 mb-2 flex items-center">
                                            ⏱️ Time Remaining:
                                            <CountdownTimer updatedAt={order.updatedAt} estimatedPrepTime={order.estimatedPrepTime} />
                                        </div>
                                    )}

                                    <p className="text-sm text-gray-500 mb-3">
                                        Placed on: {new Date(order.createdAt).toLocaleString()}
                                    </p>

                                    <ul className="text-sm text-gray-700 space-y-1">
                                        {order.items.map((item, index) => (
                                            <li key={index} className="flex items-center">
                                                <span className="font-bold mr-2 text-indigo-600">{item.quantity}x</span>
                                                {item.menuItem?.title || item.menuItem?.name || "Food Item"}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-3 font-bold text-gray-900">
                                        Total: ${order.totalPrice?.toFixed(2) || "0.00"}
                                    </div>
                                </div>

                                {order.status?.toLowerCase() === 'registered' && (
                                    <button
                                        onClick={() => cancelOrder(order._id)}
                                        className="w-full md:w-auto px-6 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg shadow-sm transition-colors"
                                    >
                                        Cancel Order ❌
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}