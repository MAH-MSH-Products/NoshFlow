import { useState, useEffect, useCallback } from 'react';
import FoodCard from '../components/FoodCard';
import { useCart } from '../context/CartContext';

export default function Menu() {
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState(["All"]);

    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { addToCart } = useCart();

    const fetchMenu = useCallback(async () => {
        setLoading(true);
        try {
            let url = new URL("http://127.0.0.1:5000/api/menu/menu-items");
            if (selectedCategory !== "All") url.searchParams.append("category", selectedCategory);
            if (searchTerm) url.searchParams.append("search", searchTerm);
            if (minPrice) url.searchParams.append("minPrice", minPrice);
            if (maxPrice) url.searchParams.append("maxPrice", maxPrice);

            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                setMenuItems(data);
                if (categories.length === 1 && data.length > 0) {
                    const uniqueCategories = ["All", ...new Set(data.map(item => item.category?.name || item.category || "General"))];
                    setCategories(uniqueCategories);
                }
            } else {
                setError(data.message || "Failed to load menu");
            }
        } catch (err) {
            setError("Connection error. Is the backend server running?");
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, searchTerm, minPrice, maxPrice]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchMenu();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [fetchMenu]);

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">Our Menu</h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">Find your favorite meals, filter by price, or explore our categories.</p>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="w-full md:w-1/3">
                        <input
                            type="text"
                            placeholder="🔍 Search for food..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="w-full md:w-auto flex gap-2 items-center">
                        <span className="text-sm font-bold text-gray-500">Price:</span>
                        <input
                            type="number"
                            placeholder="Min $"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="number"
                            placeholder="Max $"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3 mb-10">
                    {categories.map(category => (
                        <button key={category} onClick={() => setSelectedCategory(category)}
                                className={`px-5 py-2 rounded-full font-bold text-sm transition-all shadow-sm ${selectedCategory === category ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}>
                            {category}
                        </button>
                    ))}
                </div>

                {error && <div className="text-center mt-10 text-red-500 font-bold bg-red-50 p-4 rounded-xl">{error}</div>}

                {loading ? (
                    <div className="text-center mt-20 text-xl font-bold text-gray-500">Searching... 🍕</div>
                ) : menuItems.length === 0 ? (
                    <div className="text-center mt-20 text-xl font-bold text-gray-500">No items found matching your criteria. 🕵️‍♂️</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {menuItems.map(food => (
                            <FoodCard key={food._id} food={food} onAddToCart={addToCart} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}