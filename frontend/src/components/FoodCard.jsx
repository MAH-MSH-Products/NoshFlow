import React from 'react';

export default function FoodCard({ food, onAddToCart }) {
    const isOutOfStock = food.isAvailable === false;

    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col relative ${isOutOfStock ? 'opacity-75 grayscale-[50%]' : ''}`}>

            {isOutOfStock && (
                <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider z-10 shadow-md">
                    Sold Out
                </div>
            )}

            <img
                src={food.image ? `http://127.0.0.1:5000${food.image}` : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=60"}
                alt={food.title}
                className="w-full h-48 object-cover"
            />
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-extrabold text-gray-800">{food.title}</h3>
                    <span className="text-lg font-black text-blue-600">${food.price?.toFixed(2)}</span>
                </div>
                <span className="inline-block px-2.5 py-1 text-xs font-bold text-gray-500 bg-gray-100 rounded-md mb-3 w-max">
                    {food.category?.name || food.category || "General"}
                </span>
                <p className="text-gray-600 text-sm flex-grow mb-6 leading-relaxed">
                    {food.description}
                </p>
                <button
                    onClick={() => !isOutOfStock && onAddToCart(food)}
                    disabled={isOutOfStock}
                    className={`w-full font-bold py-2.5 px-4 rounded-xl transition-colors shadow-sm ${
                        isOutOfStock
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                    {isOutOfStock ? 'Unavailable' : 'Add to Cart'}
                </button>
            </div>
        </div>
    );
}