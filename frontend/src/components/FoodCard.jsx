import React from 'react';

export default function FoodCard({ food, onAddToCart }) {
    // ۱. استفاده از food.name (به همراه پشتیبانی رزرو از title جهت جلوگیری از خطای احتمالی)
    const displayName = food?.name || food?.title || "بدون نام";

    // ۲. مدیریت آدرس تصویر (چه آدرس کامل باشه چه مسیر نسبی uploads)
    const imageUrl = food?.image
        ? (food.image.startsWith('http') ? food.image : `http://127.0.0.1:5000${food.image}`)
        : '/placeholder-food.png';

    return (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col justify-between">
            {/* تصویر غذا */}
            <div className="relative h-48 w-full bg-gray-100">
                <img
                    src={imageUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'; }}
                />
            </div>

            <div className="p-5 flex flex-col flex-grow justify-between">
                <div>
                    {/* ۳. نمایش نام غذا با فیلد name */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {displayName}
                    </h3>

                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                        {food?.description || "بدون توضیحات"}
                    </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <span className="text-lg font-extrabold text-blue-600">
                        ${food?.price}
                    </span>

                    <button
                        onClick={() => onAddToCart(food)}
                        disabled={food?.stock === 0}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            food?.stock === 0
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                        }`}
                    >
                        {food?.stock === 0 ? "stock is 0" : "add to cart"}
                    </button>
                </div>
            </div>
        </div>
    );
}