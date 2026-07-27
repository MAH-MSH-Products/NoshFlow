import { useState } from 'react';
import { mockMenu } from '../data/mockMenu';
import FoodCard from '../components/FoodCard';
import { useCart } from '../context/CartContext'; // <-- Import the hook

export default function Menu() {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const { addToCart } = useCart(); // <-- Extract addToCart function

    const categories = ["All", ...new Set(mockMenu.map(item => item.category))];

    const filteredMenu = selectedCategory === "All"
        ? mockMenu
        : mockMenu.filter(item => item.category === selectedCategory);

    // Use the real addToCart function now!
    const handleAddToCart = (foodItem) => {
        addToCart(foodItem);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">Our Menu</h1>
                    <p className="mt-4 text-xl text-gray-500">Discover our delicious offerings.</p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 mb-10">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full font-medium transition-colors ${
                                selectedCategory === category
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm"
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredMenu.map(food => (
                        <FoodCard
                            key={food.id}
                            food={food}
                            onAddToCart={handleAddToCart}
                        />
                    ))}
                </div>

                {filteredMenu.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">No items found in this category.</div>
                )}
            </div>
        </div>
    );
}