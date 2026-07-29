import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Cart() {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, setCartItems } = useCart();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const navigate = useNavigate();

    const [discountInput, setDiscountInput] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [discountMsg, setDiscountMsg] = useState({ type: "", text: "" });

    const handleApplyDiscount = async () => {
        if (!discountInput.trim()) return;

        setDiscountMsg({ type: "", text: "Checking..." });

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://127.0.0.1:5000/api/discounts/validate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ code: discountInput.toUpperCase() })
            });

            const data = await response.json();

            if (response.ok) {
                setAppliedDiscount({
                    code: discountInput.toUpperCase(),
                    percent: data.discountPercentage || (data.discount && data.discount.discountPercentage) || 0
                });
                setDiscountMsg({ type: "success", text: `Success! ${data.discountPercentage || (data.discount && data.discount.discountPercentage)}% discount applied.` });
            } else {
                setAppliedDiscount(null);
                setDiscountMsg({ type: "error", text: data.message || "Invalid or expired code." });
            }
        } catch (error) {
            setDiscountMsg({ type: "error", text: "Network error. Server might be down." });
        }
    };

    const finalTotal = appliedDiscount
        ? cartTotal - (cartTotal * (appliedDiscount.percent / 100))
        : cartTotal;

    const handleCheckout = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            return alert("You are not logged in");
        }

        if (cartItems.length === 0) {
            return alert("Your cart is empty");
        }

        console.log("دیتای خام سبد خرید:", cartItems);

        const payload = {
            items: cartItems.map(item => ({
                menuItemId: item._id,
                quantity: item.quantity
            })),
            discountCode: appliedDiscount ? appliedDiscount.code : null
        };

        console.log("دیتای آماده ارسال به بک‌اند:", payload);

        try {
            const res = await fetch("http://127.0.0.1:5000/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("your order saved successfully 🛍️");

                if (typeof setCartItems === 'function') {
                    setCartItems([]);
                }

                window.location.href = "/my-orders";
            } else {
                const data = await res.json();
                alert(`خطای بک‌اند در ثبت سفارش: ${data.message || "اطلاعات ارسالی نامعتبر است"}`);
            }
        } catch (err) {
            alert("خطای شبکه: امکان اتصال به سرور وجود ندارد.");
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

                {/* لیست آیتم‌های سبد خرید */}
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
                                    <div className="font-bold text-lg w-20 text-right text-gray-800">${(item.price * item.quantity).toFixed(2)}</div>
                                    <button onClick={() => removeFromCart(item._id)} className="text-red-500 hover:text-red-700 font-semibold p-2 text-sm">Remove</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* بخش وارد کردن کد تخفیف */}
                    <div className="bg-white shadow-md rounded-xl p-6">
                        <label className="block text-sm font-bold text-gray-700 mb-3">Have a Discount Code?</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={discountInput}
                                onChange={(e) => setDiscountInput(e.target.value)}
                                placeholder="e.g. SUMMER20"
                                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono"
                            />
                            <button
                                onClick={handleApplyDiscount}
                                className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                            >
                                Apply
                            </button>
                        </div>
                        {discountMsg.text && (
                            <p className={`mt-3 text-sm font-semibold ${discountMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                {discountMsg.text}
                            </p>
                        )}
                    </div>

                    <div className="bg-white shadow-md rounded-xl p-6 flex flex-col justify-between">
                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-gray-500 font-medium">
                                <span>Subtotal</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            {appliedDiscount && (
                                <div className="flex justify-between text-green-600 font-bold">
                                    <span>Discount ({appliedDiscount.percent}%)</span>
                                    <span>-${(cartTotal * (appliedDiscount.percent / 100)).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="border-t pt-2 mt-2 flex justify-between items-end">
                                <span className="text-gray-800 font-bold uppercase tracking-wider text-sm">Total</span>
                                <span className="text-3xl font-extrabold text-blue-600">${finalTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={loading}
                            className={`w-full text-white text-lg font-bold py-3 rounded-xl transition-colors shadow-sm ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {loading ? "Processing..." : "Confirm & Pay"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}