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
                setError(data.message || "Failed to load orders. Are you logged in as Cashier?");
            }
        } catch (err) {
            setError("Connection error. Server might be down.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const deliverOrder = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://127.0.0.1:5000/api/orders/${id}/deliver`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                setOrders(prevOrders => prevOrders.filter(order => order._id !== id));
            } else {
                const data = await response.json();
                alert(data.message || "Failed to update status");
            }
        } catch (error) {
            alert("Network error while delivering order.");
        }
    };

    if (loading && orders.length === 0) return <div className="text-center mt-20 text-xl font-bold">Loading Orders... ⏳</div>;
    if (error) return <div className="text-center mt-20 text-red-500 font-bold">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex justify-between items-center">
                    <span>Cashier Dashboard 💵</span>
                    <button onClick={fetchOrders} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded-lg">
                        🔄 Refresh
                    </button>
                </h1>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-between border-b pb-4">
                        <span>Ready for Delivery</span>
                        <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                            {orders.length} Orders
                        </span>
                    </h2>

                    {orders.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No orders ready for delivery at the moment.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {orders.map(order => (
                                <div key={order._id} className="bg-gray-50 p-5 rounded-xl border border-gray-200 flex flex-col">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="font-extrabold text-gray-900 text-lg">#{order._id.slice(-6)}</span>
                                        <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200">
                                            {new Date(order.createdAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <ul className="mb-6 text-sm text-gray-700 flex-grow space-y-2">
                                        {order.items.map((item, index) => (
                                            <li key={index} className="flex items-start">
                                                <span className="font-bold mr-2 text-indigo-600">{item.quantity}x</span>
                                                {item.menuItem?.title || "Food Item"}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-auto pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => deliverOrder(order._id)}
                                            className="w-full py-3 rounded-lg text-white font-bold transition-colors shadow-sm bg-green-500 hover:bg-green-600"
                                        >
                                            Deliver Order ✔️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}