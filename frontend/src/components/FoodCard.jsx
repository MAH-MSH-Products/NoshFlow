import React from 'react';

export default function FoodCard({ food, onAddToCart }) {
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
            <img
                src={food.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=60"}
                alt={food.title}
                className="w-full h-48 object-cover"
            />
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{food.title}</h3>
                    <span className="text-lg font-bold text-blue-600">${food.price.toFixed(2)}</span>
                </div>
                <span className="inline-block px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full mb-3 w-max">
                    {food.category?.name || food.category || "General"}
                </span>
                <p className="text-gray-600 text-sm flex-grow mb-4">
                    {food.description}
                </p>
                <button
                    onClick={() => onAddToCart(food)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
}