import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("menu");
    const [loading, setLoading] = useState(false);

    const [menuItems, setMenuItems] = useState([]);
    const [newItem, setNewItem] = useState({ title: '', description: '', price: '', category: 'General', isAvailable: true });
    const [imageFile, setImageFile] = useState(null);

    const [users, setUsers] = useState([]);
    const [analytics, setAnalytics] = useState({ totalOrders: 0, totalRevenue: 0, chartData: [] });

    const fetchMenu = async () => {
        try {
            const res = await fetch("http://127.0.0.1:5000/api/menu/menu-items");
            if (res.ok) setMenuItems(await res.json());
        } catch (err) { console.error(err); }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://127.0.0.1:5000/api/users", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) setUsers(await res.json());
        } catch (err) { console.error(err); }
    };

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://127.0.0.1:5000/api/orders/analytics", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAnalytics(data);
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        setLoading(true);
        if (activeTab === "menu") fetchMenu();
        if (activeTab === "users") fetchUsers();
        if (activeTab === "analytics") fetchAnalytics();
        setLoading(false);
    }, [activeTab]);

    const handleMenuSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append('title', newItem.title);
        formData.append('description', newItem.description);
        formData.append('price', newItem.price);
        formData.append('category', newItem.category);
        if (imageFile) formData.append('image', imageFile);

        try {
            const res = await fetch("http://127.0.0.1:5000/api/menu/menu-items", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });
            if (res.ok) {
                alert("Item added!");
                fetchMenu();
                e.target.reset();
            }
        } catch (err) { alert("Error adding item"); }
    };

    const handleDeleteMenu = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        const token = localStorage.getItem("token");
        await fetch(`http://127.0.0.1:5000/api/menu/menu-items/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        fetchMenu();
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Admin Control Panel ⚙️</h1>

                {/* Tabs Navigation */}
                <div className="flex space-x-4 mb-8 border-b pb-4">
                    <button onClick={() => setActiveTab("menu")} className={`px-6 py-2 rounded-lg font-bold transition-colors ${activeTab === 'menu' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Menu Management</button>
                    <button onClick={() => setActiveTab("analytics")} className={`px-6 py-2 rounded-lg font-bold transition-colors ${activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Sales Analytics</button>
                    <button onClick={() => setActiveTab("users")} className={`px-6 py-2 rounded-lg font-bold transition-colors ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>User Management</button>
                </div>

                {loading ? <p className="text-center font-bold text-xl">Loading Data...</p> : (
                    <>
                        {/* TAB 1: MENU MANAGEMENT */}
                        {activeTab === "menu" && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
                                    <h2 className="text-xl font-bold mb-4">Add New Item</h2>
                                    <form onSubmit={handleMenuSubmit} className="space-y-4">
                                        <input type="text" name="title" placeholder="Title" onChange={e => setNewItem({...newItem, title: e.target.value})} required className="w-full px-4 py-2 border rounded-lg" />
                                        <textarea name="description" placeholder="Description" onChange={e => setNewItem({...newItem, description: e.target.value})} required className="w-full px-4 py-2 border rounded-lg"></textarea>
                                        <input type="number" name="price" placeholder="Price ($)" step="0.01" onChange={e => setNewItem({...newItem, price: e.target.value})} required className="w-full px-4 py-2 border rounded-lg" />
                                        <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="w-full" />
                                        <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 rounded-lg">Save Item</button>
                                    </form>
                                </div>
                                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                                    <h2 className="text-xl font-bold mb-4">Current Menu ({menuItems.length})</h2>
                                    <div className="space-y-3">
                                        {menuItems.map(item => (
                                            <div key={item._id} className="flex justify-between items-center p-3 bg-gray-50 border rounded-lg">
                                                <div className="font-bold">{item.title} <span className="text-gray-500 font-normal">(${item.price})</span></div>
                                                <button onClick={() => handleDeleteMenu(item._id)} className="text-red-500 font-bold px-3 py-1 bg-red-100 rounded-md">Delete</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: ANALYTICS (Charts) */}
                        {activeTab === "analytics" && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center">
                                        <h3 className="text-lg font-bold text-blue-800">Total Revenue</h3>
                                        <p className="text-4xl font-extrabold text-blue-600">${analytics.totalRevenue?.toFixed(2) || "0.00"}</p>
                                    </div>
                                    <div className="bg-green-50 p-6 rounded-xl border border-green-100 text-center">
                                        <h3 className="text-lg font-bold text-green-800">Total Orders</h3>
                                        <p className="text-4xl font-extrabold text-green-600">{analytics.totalOrders || 0}</p>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold mb-4">Revenue Chart (Last 7 Days)</h3>
                                <div className="h-80 w-full">
                                    {analytics.chartData?.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={analytics.chartData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-500 font-bold bg-gray-50 rounded-xl">
                                            No chart data available (Make sure API is connected)
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB 3: USER MANAGEMENT */}
                        {activeTab === "users" && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                                <h2 className="text-xl font-bold mb-6">Registered Users ({users.length})</h2>
                                {users.length === 0 ? <p className="text-gray-500">No users found or API not connected.</p> : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Email</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Role</th>
                                            </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                            {users.map(user => (
                                                <tr key={user._id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{user._id.slice(-4)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-bold text-xs">
                                                                {user.role?.name || "Customer"}
                                                            </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}