import { useState, useEffect, useCallback } from 'react';
import FoodCard from '../components/FoodCard';
import { useCart } from '../context/CartContext';

export default function Menu() {
    const [menuItems, setMenuItems] = useState([]);

    const [categories, setCategories] = useState([{ _id: "All", name: "All" }]);
    const [selectedCategory, setSelectedCategory] = useState("All"); // اینجا حالا _id ذخیره میشه

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
                    const catMap = new Map();
                    data.forEach(item => {
                        if (item.category && item.category._id) {
                            catMap.set(item.category._id, item.category.name);
                        }
                    });

                    const uniqueCategories = [{ _id: "All", name: "All" }];
                    catMap.forEach((name, _id) => {
                        uniqueCategories.push({ _id, name });
                    });

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


                <div className="flex flex-wrap justify-center gap-3 mb-10">
                    {categories.map(cat => (
                        <button
                            key={cat._id}
                            onClick={() => setSelectedCategory(cat._id)}
                            className={`px-5 py-2 rounded-full font-bold text-sm transition-all shadow-sm ${
                                selectedCategory === cat._id
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            {cat.name}
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