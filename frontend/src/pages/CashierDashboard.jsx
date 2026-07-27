import { useState, useEffect } from 'react';

export default function CashierDashboard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/orders", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (err) {
            console.error("Failed to fetch orders", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const completeOrder = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5000/api/orders/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'completed' })
            });

            if (response.ok) {
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order._id === id ? { ...order, status: 'completed' } : order
                    )
                );
            } else {
                alert("Failed to complete order. Please check permissions.");
            }
        } catch (error) {
            alert("Network error.");
        }
    };

    const readyOrders = orders.filter(o => o.status.toLowerCase() === 'ready');
    const completedOrders = orders.filter(o => o.status.toLowerCase() === 'completed');

    if (loading && orders.length === 0) return <div className="text-center mt-20 text-xl font-bold">Loading Cashier... 💵</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex justify-between items-center">
                    <span>Cashier Dashboard 💵</span>
                    <button onClick={fetchOrders} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded-lg">
                        🔄 Refresh
                    </button>
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Orders Ready for Pickup */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-200">
                        <h2 className="text-xl font-bold text-green-700 mb-6 border-b border-green-100 pb-2">
                            Ready for Delivery ({readyOrders.length})
                        </h2>
                        {readyOrders.length === 0 && <p className="text-gray-500">No orders waiting.</p>}

                        <div className="space-y-4">
                            {readyOrders.map(order => (
                                <div key={order._id} className="bg-green-50 p-4 rounded-xl border border-green-100 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-extrabold text-gray-900">#{order._id.slice(-6)}</h3>
                                        <p className="text-sm font-semibold text-gray-700">
                                            User ID: {order.user?.slice(-4) || "Guest"}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Total: <span className="font-bold text-green-700">${order.totalPrice?.toFixed(2)}</span></p>
                                    </div>
                                    <button
                                        onClick={() => completeOrder(order._id)}
                                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-sm"
                                    >
                                        Deliver & Complete
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Completed Orders Log */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 opacity-80">
                        <h2 className="text-xl font-bold text-gray-700 mb-6 border-b border-gray-100 pb-2">
                            Completed Today ({completedOrders.length})
                        </h2>
                        <div className="space-y-3">
                            {completedOrders.map(order => (
                                <div key={order._id} className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center text-gray-600">
                                    <span className="font-bold">#{order._id.slice(-6)}</span>
                                    <span>${order.totalPrice?.toFixed(2)}</span>
                                    <span className="text-green-600 font-bold">Paid & Delivered ✅</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}