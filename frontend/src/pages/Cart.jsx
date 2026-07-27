import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Cart() {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, setCartItems } = useCart();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const navigate = useNavigate();

    const handleCheckout = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You need to login first to place an order!");
            navigate("/login");
            return;
        }

        setLoading(true);
        setMessage({ type: "", text: "" });

        const orderData = {
            items: cartItems.map(item => ({
                menuItem: item._id,
                quantity: item.quantity
            }))
        };

        try {
            const response = await fetch("http://127.0.0.1:5000/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: "success", text: "Order placed successfully! 🚀" });
                setTimeout(() => {
                    window.location.href = "/";
                }, 2000);
            } else {
                setMessage({ type: "error", text: data.message || "Failed to place order." });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Connection error. Server might be down." });
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0 && !message.text) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex flex-col items-center justify-center p-4">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty 🛒</h2>
                <Link to="/menu" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">Go to Menu</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Shopping Cart</h1>

                {message.text && (
                    <div className={`p-4 mb-6 rounded-lg text-center font-bold ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {message.text}
                    </div>
                )}

                <div className="bg-white shadow-md rounded-xl overflow-hidden mb-6">
                    <ul className="divide-y divide-gray-200">
                        {cartItems.map((item) => (
                            <li key={item._id} className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4 flex-1 w-full">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
                                        <p className="text-gray-500 text-sm">${item.price.toFixed(2)} each</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 justify-between w-full sm:w-auto">
                                    <div className="flex items-center border rounded-lg">
                                        <button onClick={() => updateQuantity(item._id, -1)} className="px-3 py-1 hover:bg-gray-100 font-bold">-</button>
                                        <span className="px-3 font-medium">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item._id, 1)} className="px-3 py-1 hover:bg-gray-100 font-bold">+</button>
                                    </div>
                                    <div className="font-bold text-lg w-20 text-right text-blue-600">${(item.price * item.quantity).toFixed(2)}</div>
                                    <button onClick={() => removeFromCart(item._id)} className="text-red-500 hover:text-red-700 font-semibold p-2 text-sm">Remove</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white shadow-md rounded-xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Total Amount</p>
                        <p className="text-3xl font-extrabold text-gray-900">${cartTotal.toFixed(2)}</p>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={loading}
                        className={`w-full sm:w-auto text-white text-lg font-bold py-3 px-8 rounded-xl transition-colors shadow-sm ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        {loading ? "Processing..." : "Proceed to Checkout"}
                    </button>
                </div>
            </div>
        </div>
    );
}