import React from 'react';

export default function FoodCard({food, onAddToCart}) {
    const isOutOfStock = food.stock === 0 || food.isAvailable === false;

    return (
        <div
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
            {food.image ? (
                <img
                    src={`http://127.0.0.1:5000/${food.image}`}
                    alt={food.name}
                    className="w-full h-48 object-cover"
                />
            ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 font-bold">
                    No Image 📷
                </div>
            )}

            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-extrabold text-gray-900">{food.title}</h3>
                    <span className="text-indigo-600 font-bold text-base">${food.price}</span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">{food.description}</p>

                <div className="mt-auto">
                    {isOutOfStock ? (
                        <button
                            disabled
                            className="w-full py-2 px-4 bg-gray-300 text-gray-600 font-bold rounded-xl cursor-not-allowed text-center"
                        >
                            ناموجود 🚫
                        </button>
                    ) : (
                        <button
                            onClick={() => onAddToCart(food)}
                            disabled={food.stock <= 0}
                            className={`px-4 py-2 text-white font-bold rounded-lg transition-colors 
                                ${food.stock <= 0
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700' 
                            }`}
                        >
                            Add to Cart 🛒
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}