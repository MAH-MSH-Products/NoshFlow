import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import KitchenDashboard from "./pages/KitchenDashboard";
import CashierDashboard from "./pages/CashierDashboard";
import MyOrders from "./pages/MyOrders"; // <--- اضافه شده
import { CartProvider } from "./context/CartContext";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
    return (
        <CartProvider>
            <Router>
                <Navbar />
                <main>
                    <Routes>
                        <Route path="/" element={<div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 text-3xl font-bold text-gray-800">Welcome to FoodOps</div>} />

                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        <Route path="/menu" element={<Menu />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/my-orders" element={<MyOrders />} />

                        <Route path="/kitchen" element={<KitchenDashboard />} />
                        <Route path="/cashier" element={<CashierDashboard />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                    </Routes>
                </main>
            </Router>
        </CartProvider>
    );
}