import { createContext, useState, useContext } from 'react';

// Create the context
const CartContext = createContext();

// Custom hook to use the cart easily in any component
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (food) => {
        if (food.isAvailable === false) {
            alert("Sorry, this item is currently unavailable. ❌");
            return;
        }

        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item._id === food._id);
            const currentQuantity = existingItem ? existingItem.quantity : 0;

            if (currentQuantity + 1 > food.stock) {
                alert(`you can not order more that ${food.stock}`);
                return prevItems;
            }

            if (existingItem) {
                return prevItems.map((item) =>
                    item._id === food._id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevItems, { ...food, quantity: 1 }];
            }
        });
    };

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(id);
            return;
        }

        setCartItems((prevItems) =>
            prevItems.map((item) => {
                if (item._id === id) {
                    if (newQuantity > item.stock) {
                        alert(`maximum stock is ${item.stock} for this food`);
                        return item;
                    }
                    return { ...item, quantity: newQuantity };
                }
                return item;
            })
        );
    };

    // Remove item completely
    const removeFromCart = (id) => {
        setCartItems((prevItems) => prevItems.filter((item) => item._id !== id));
    };


    // Calculate total price and total items
    const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{ cartItems, addToCart, removeFromCart, updateQuantity, cartTotal, cartCount }}
        >
            {children}
        </CartContext.Provider>
    );
};