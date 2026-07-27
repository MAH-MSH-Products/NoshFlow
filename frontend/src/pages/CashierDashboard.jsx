import { useState } from 'react';
import { mockOrders } from '../data/mockOrders';

export default function CashierDashboard() {
    // In a real app, this will be fetched from the Backend (HamidiFard)
    const [orders, setOrders] = useState(mockOrders);

    const completeOrder = (id) => {
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.id === id ? { ...order, status: 'Completed' } : order
            )
        );
    };

    const readyOrders = orders.filter(o => o.status === 'Ready');
    const completedOrders = orders.filter(o => o.status === 'Completed');

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Cashier Dashboard 💵</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Orders Ready for Pickup */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-200">
                        <h2 className="text-xl font-bold text-green-700 mb-6 border-b border-green-100 pb-2">
                            Ready for Delivery ({readyOrders.length})
                        </h2>
                        {readyOrders.length === 0 && <p className="text-gray-500">No orders waiting.</p>}

                        <div className="space-y-4">
                            {readyOrders.map(order => (
                                <div key={order.id} className="bg-green-50 p-4 rounded-xl border border-green-100 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-extrabold text-gray-900">#{order.id}</h3>
                                        <p className="text-sm font-semibold text-gray-700">{order.customerName}</p>
                                        <p className="text-xs text-gray-500 mt-1">Total: <span className="font-bold text-green-700">${order.totalPrice.toFixed(2)}</span></p>
                                    </div>
                                    <button
                                        onClick={() => completeOrder(order.id)}
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
                                <div key={order.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center text-gray-600">
                                    <span className="font-bold">#{order.id}</span>
                                    <span>{order.customerName}</span>
                                    <span className="text-green-600 font-bold">Paid</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}