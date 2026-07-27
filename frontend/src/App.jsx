import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Menu from "./pages/Menu";
import { CartProvider } from "./context/CartContext"; // <-- Import Provider
import Cart from "./pages/Cart";

export default function App() {
    return (
        <CartProvider> {/* <-- Wrap everything */}
            <Router>
                <Navbar />
                <main>
                    <Routes>
                        <Route path="/" element={<div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 text-3xl font-bold text-gray-800">Welcome to FoodOps</div>} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/menu" element={<Menu />} />
                        <Route path="/cart" element={<Cart />} />
                    </Routes>
                </main>
            </Router>
        </CartProvider>
    );
}