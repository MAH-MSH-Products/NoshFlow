import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import MyOrders from './pages/MyOrders';
import AdminDashboard from './pages/AdminDashboard';
import KitchenDashboard from './pages/KitchenDashboard';
import CashierDashboard from './pages/CashierDashboard';
import { CartProvider } from './context/CartContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    if (!token || !userString) {
        return <Navigate to="/login" replace />;
    }

    try {
        const user = JSON.parse(userString);

        let userRole = user?.role?.name || user?.role || '';

        const normalizedUserRole = String(userRole).toLowerCase().trim();

        const isAllowed = allowedRoles.some(role => {
            const normalizedAllowed = String(role).toLowerCase().trim();
            return normalizedUserRole === normalizedAllowed ||
                (normalizedAllowed.includes('kitchen') && normalizedUserRole.includes('kitchen'));
        });

        if (!isAllowed) {
            console.warn(`Access denied. User role: "${userRole}", Allowed roles:`, allowedRoles);
            return <Navigate to="/" replace />;
        }
    } catch (e) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

function App() {
    return (
        <CartProvider>
            <Router>
                <div className="min-h-screen bg-gray-50 flex flex-col">
                    <Navbar />
                    <main className="flex-grow">
                        <Routes>
                            <Route path="/" element={<Navigate to="/menu" />} />
                            <Route path="/menu" element={<Menu />} />
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            <Route
                                path="/my-orders"
                                element={
                                    <ProtectedRoute allowedRoles={['Customer']}>
                                        <MyOrders />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/admin"
                                element={
                                    <ProtectedRoute allowedRoles={['Admin']}>
                                        <AdminDashboard />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/kitchen"
                                element={
                                    <ProtectedRoute allowedRoles={['Kitchen Staff']}>
                                        <KitchenDashboard />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/cashier"
                                element={
                                    <ProtectedRoute allowedRoles={['Cashier']}>
                                        <CashierDashboard />
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </main>
                </div>
            </Router>
        </CartProvider>
    );
}

export default App;