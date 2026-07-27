import { useState, useEffect } from 'react';
import FoodCard from '../components/FoodCard';
import { useCart } from '../context/CartContext';

export default function Menu() {
    const [menuItems, setMenuItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/menu");
                const data = await response.json();

                if (response.ok) {
                    const availableItems = data.filter(item => item.isAvailable !== false);
                    setMenuItems(availableItems);
                } else {
                    setError(data.message || "Failed to load menu");
                }
            } catch (err) {
                setError("Connection error. Is the backend server running?");
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
    }, []);

    const categories = ["All", ...new Set(menuItems.map(item => item.category?.name || item.category || "General"))];

    const filteredMenu = selectedCategory === "All"
        ? menuItems
        : menuItems.filter(item => (item.category?.name || item.category || "General") === selectedCategory);

    if (loading) return <div className="text-center mt-20 text-xl font-bold">Loading Menu... 🍕</div>;
    if (error) return <div className="text-center mt-20 text-red-500 font-bold">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">Our Menu</h1>
                </div>

                <div className="flex flex-wrap justify-center gap-3 mb-10">
                    {categories.map(category => (
                        <button key={category} onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full font-medium transition-colors ${selectedCategory === category ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm"}`}>
                            {category}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredMenu.map(food => (
                        <FoodCard key={food._id} food={food} onAddToCart={addToCart} />
                    ))}
                </div>
            </div>
        </div>
    );
}