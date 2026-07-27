import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export default function Cart() {
    const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();

    // If the cart is empty, show a friendly message and a link back to the menu
    if (cartItems.length === 0) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex flex-col items-center justify-center p-4">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty 🛒</h2>
                <p className="text-gray-500 mb-8">Looks like you haven't added any delicious food yet.</p>
                <Link to="/menu" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                    Go to Menu
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Shopping Cart</h1>

                <div className="bg-white shadow-md rounded-xl overflow-hidden mb-6">
                    <ul className="divide-y divide-gray-200">
                        {cartItems.map((item) => (
                            <li key={item.id} className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">

                                {/* Item Image and Name */}
                                <div className="flex items-center gap-4 flex-1 w-full">
                                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                                        <p className="text-gray-500 text-sm">${item.price.toFixed(2)} each</p>
                                    </div>
                                </div>

                                {/* Controls: Quantity, Price, and Remove */}
                                <div className="flex items-center gap-4 justify-between w-full sm:w-auto">
                                    <div className="flex items-center border rounded-lg">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="px-3 py-1 text-gray-600 hover:bg-gray-100 font-bold"
                                        >-</button>
                                        <span className="px-3 font-medium text-gray-800">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="px-3 py-1 text-gray-600 hover:bg-gray-100 font-bold"
                                        >+</button>
                                    </div>
                                    <div className="font-bold text-lg w-20 text-right text-blue-600">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-red-500 hover:text-red-700 font-semibold p-2 text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Cart Total & Checkout Button */}
                <div className="bg-white shadow-md rounded-xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Total Amount</p>
                        <p className="text-3xl font-extrabold text-gray-900">${cartTotal.toFixed(2)}</p>
                    </div>
                    <button
                        onClick={() => alert("Checkout flow will be implemented when backend Order APIs are ready!")}
                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-3 px-8 rounded-xl transition-colors shadow-sm"
                    >
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
    );
}