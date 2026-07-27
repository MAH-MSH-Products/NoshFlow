import { useState } from 'react';
import { mockOrders } from '../data/mockOrders';

export default function KitchenDashboard() {
    // Load our mock data into state so we can manipulate it
    const [orders, setOrders] = useState(mockOrders);

    // Function to move an order to the next stage
    const updateStatus = (id, newStatus) => {
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.id === id ? { ...order, status: newStatus } : order
            )
        );
    };

    // A reusable UI component for individual order cards
    const renderOrderCard = (order, nextStatus, buttonText, buttonColor) => (
        <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4 flex flex-col">
            <div className="flex justify-between items-center mb-3">
                <span className="font-extrabold text-gray-800">#{order.id}</span>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{order.time}</span>
            </div>
            <ul className="mb-4 text-sm text-gray-700 flex-grow space-y-1">
                {order.items.map((item, index) => (
                    <li key={index} className="flex items-start">
                        <span className="font-bold mr-2">{item.quantity}x</span>
                        {item.name}
                    </li>
                ))}
            </ul>
            {nextStatus && (
                <button
                    onClick={() => updateStatus(order.id, nextStatus)}
                    className={`w-full py-2 mt-auto rounded-lg text-white font-bold transition-colors shadow-sm ${buttonColor}`}
                >
                    {buttonText}
                </button>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Kitchen Dashboard 👨‍🍳</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Column 1: Pending */}
                    <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                        <h2 className="text-lg font-bold text-red-800 mb-4 flex items-center justify-between border-b border-red-200 pb-2">
                            <span>Pending</span>
                            <span className="bg-red-200 text-red-800 text-xs px-2 py-1 rounded-full">
                                {orders.filter(o => o.status === 'Pending').length}
                            </span>
                        </h2>
                        {orders.filter(o => o.status === 'Pending').map(order =>
                            renderOrderCard(order, 'Preparing', 'Start Preparing', 'bg-blue-500 hover:bg-blue-600')
                        )}
                    </div>

                    {/* Column 2: Preparing */}
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                        <h2 className="text-lg font-bold text-blue-800 mb-4 flex items-center justify-between border-b border-blue-200 pb-2">
                            <span>Preparing</span>
                            <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full">
                                {orders.filter(o => o.status === 'Preparing').length}
                            </span>
                        </h2>
                        {orders.filter(o => o.status === 'Preparing').map(order =>
                            renderOrderCard(order, 'Ready', 'Mark as Ready', 'bg-green-500 hover:bg-green-600')
                        )}
                    </div>

                    {/* Column 3: Ready */}
                    <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                        <h2 className="text-lg font-bold text-green-800 mb-4 flex items-center justify-between border-b border-green-200 pb-2">
                            <span>Ready for Cashier</span>
                            <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">
                                {orders.filter(o => o.status === 'Ready').length}
                            </span>
                        </h2>
                        {orders.filter(o => o.status === 'Ready').map(order =>
                            renderOrderCard(order, null, '', '')
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}