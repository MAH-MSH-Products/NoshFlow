import { useState, useEffect } from 'react';

export default function KitchenDashboard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://127.0.0.1:5000/api/kitchen/orders", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();

            if (response.ok) {
                setOrders(data);
            } else {
                setError(data.message || "Failed to load orders. Are you logged in as Kitchen Staff?");
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

    const updateStatus = async (id, newStatus) => {
        try {
            const token = localStorage.getItem("token");

            let endpoint = "";
            if (newStatus === 'preparing') {
                endpoint = `http://127.0.0.1:5000/api/orders/${id}/start`;
            } else if (newStatus === 'ready') {
                endpoint = `http://127.0.0.1:5000/api/orders/${id}/ready`;
            }

            const response = await fetch(endpoint, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order._id === id ? { ...order, status: newStatus } : order
                    )
                );
            } else {
                const data = await response.json();
                alert(data.message || "Failed to update status");
            }
        } catch (error) {
            alert("Network error while updating status.");
        }
    };

    const renderOrderCard = (order, nextStatus, buttonText, buttonColor) => (
        <div key={order._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4 flex flex-col">
            <div className="flex justify-between items-center mb-3">
                <span className="font-extrabold text-gray-800 text-sm">#{order._id.slice(-6)}</span>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                    {new Date(order.createdAt).toLocaleTimeString()}
                </span>
            </div>
            <ul className="mb-4 text-sm text-gray-700 flex-grow space-y-1">
                {order.items.map((item, index) => (
                    <li key={index} className="flex items-start">
                        <span className="font-bold mr-2">{item.quantity}x</span>
                        {item.menuItem?.title || "Food Item"}
                    </li>
                ))}
            </ul>
            {nextStatus && (
                <button
                    onClick={() => updateStatus(order._id, nextStatus)}
                    className={`w-full py-2 mt-auto rounded-lg text-white font-bold transition-colors shadow-sm ${buttonColor}`}
                >
                    {buttonText}
                </button>
            )}
        </div>
    );

    if (loading && orders.length === 0) return <div className="text-center mt-20 text-xl font-bold">Loading Orders... ⏳</div>;
    if (error) return <div className="text-center mt-20 text-red-500 font-bold">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex justify-between items-center">
                    <span>Kitchen Dashboard 👨‍🍳</span>
                    <button onClick={fetchOrders} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded-lg">
                        🔄 Refresh
                    </button>
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                        <h2 className="text-lg font-bold text-red-800 mb-4 flex items-center justify-between border-b border-red-200 pb-2">
                            <span>Pending</span>
                            <span className="bg-red-200 text-red-800 text-xs px-2 py-1 rounded-full">
                                {orders.filter(o => o.status.toLowerCase() === 'pending').length}
                            </span>
                        </h2>
                        {orders.filter(o => o.status.toLowerCase() === 'pending').map(order =>
                            renderOrderCard(order, 'preparing', 'Start Preparing', 'bg-blue-500 hover:bg-blue-600')
                        )}
                    </div>

                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                        <h2 className="text-lg font-bold text-blue-800 mb-4 flex items-center justify-between border-b border-blue-200 pb-2">
                            <span>Preparing</span>
                            <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full">
                                {orders.filter(o => o.status.toLowerCase() === 'preparing').length}
                            </span>
                        </h2>
                        {orders.filter(o => o.status.toLowerCase() === 'preparing').map(order =>
                            renderOrderCard(order, 'ready', 'Mark as Ready', 'bg-green-500 hover:bg-green-600')
                        )}
                    </div>

                    <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                        <h2 className="text-lg font-bold text-green-800 mb-4 flex items-center justify-between border-b border-green-200 pb-2">
                            <span>Ready for Cashier</span>
                            <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">
                                {orders.filter(o => o.status.toLowerCase() === 'ready').length}
                            </span>
                        </h2>
                        {orders.filter(o => o.status.toLowerCase() === 'ready').map(order =>
                            renderOrderCard(order, null, '', '')
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}