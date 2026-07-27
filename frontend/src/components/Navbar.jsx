import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Navbar() {
    const { cartCount } = useCart();

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="text-2xl font-extrabold text-blue-600 tracking-tight">
                            FoodOps
                        </Link>
                        <div className="hidden md:flex space-x-4">
                            <Link to="/" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md font-medium transition-colors">
                                Home
                            </Link>
                            <Link to="/menu" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md font-medium transition-colors">
                                Menu
                            </Link>
                            <Link to="/kitchen" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md font-medium transition-colors">
                                Kitchen
                            </Link>
                            <Link to="/cashier" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md font-medium transition-colors">
                                Cashier
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <Link to="/cart" className="relative text-gray-600 hover:text-blue-600 font-medium transition-colors flex items-center gap-1">
                            <span>Cart</span>
                            {cartCount > 0 && (
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                            Login
                        </Link>
                        <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
                            Register
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}