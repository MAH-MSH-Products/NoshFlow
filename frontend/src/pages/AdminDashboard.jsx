import {useState, useEffect} from 'react';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("menu");
    const [loading, setLoading] = useState(false);

    // Menu & Categories
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        isAvailable: true
    });
    const [newCategoryName, setNewCategoryName] = useState('');
    const [imageFile, setImageFile] = useState(null);

    // Users & Roles
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);

    // Analytics & Restaurant Status
    const [analytics, setAnalytics] = useState({totalOrders: 0, totalRevenue: 0, chartData: []});
    const [isForceOpen, setIsForceOpen] = useState(false);

    // Discounts
    const [discounts, setDiscounts] = useState([]);
    const [newDiscount, setNewDiscount] = useState({code: '', discountPercentage: '', maxUses: '', expiresAt: ''});

    // --- Fetch Functions ---
    const fetchCategories = async () => {
        try {
            const res = await fetch("http://127.0.0.1:5000/api/menu/categories");
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
                if (data.length > 0 && !newItem.category) {
                    setNewItem(prev => ({...prev, category: data[0]._id}));
                }
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchMenuItems = async () => {
        try {
            const res = await fetch("http://127.0.0.1:5000/api/menu/menu-items");
            if (res.ok) {
                const data = await res.json();
                setMenuItems(data);
            }
        } catch (error) {
            console.error("Error fetching menu items:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://127.0.0.1:5000/api/admin/users", {
                headers: {"Authorization": `Bearer ${token}`}
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchRoles = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://127.0.0.1:5000/api/admin/roles", {
                headers: {"Authorization": `Bearer ${token}`}
            });
            if (res.ok) {
                const data = await res.json();
                setRoles(data);
            }
        } catch (error) {
            console.error("Error fetching roles:", error);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://127.0.0.1:5000/api/admin/stats", {
                headers: {"Authorization": `Bearer ${token}`}
            });
            if (res.ok) {
                const data = await res.json();
                setAnalytics(data);
            }
        } catch (error) {
            console.error("Error fetching analytics:", error);
        }
    };

    const fetchRestaurantStatus = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://127.0.0.1:5000/api/admin/status", {
                headers: {"Authorization": `Bearer ${token}`}
            });
            if (res.ok) {
                const data = await res.json();
                setIsForceOpen(data.isForceOpen);
            }
        } catch (error) {
            console.error("Error fetching restaurant status:", error);
        }
    };

    const fetchDiscounts = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://127.0.0.1:5000/api/discounts", {
                headers: {"Authorization": `Bearer ${token}`}
            });
            if (res.ok) {
                const data = await res.json();
                setDiscounts(data);
            }
        } catch (error) {
            console.error("Error fetching discounts:", error);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchMenuItems();
        fetchUsers();
        fetchRoles();
        fetchAnalytics();
        fetchRestaurantStatus();
        fetchDiscounts();
    }, []);

    // --- Handlers ---
    const handleToggleStatus = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://127.0.0.1:5000/api/admin/status", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({isForceOpen: !isForceOpen})
            });
            if (res.ok) {
                const data = await res.json();
                setIsForceOpen(data.isForceOpen);
            }
        } catch (error) {
            alert("Error toggling status");
        }
    };

    const handleToggleAvailability = async (id, currentStatus) => {
        try {
            const isCurrentlyActive = currentStatus !== false;
            const newStatus = !isCurrentlyActive;

            const token = localStorage.getItem("token");
            const res = await fetch(`http://127.0.0.1:5000/api/menu/menu-items/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ isAvailable: newStatus })
            });

            if (res.ok) {
                await fetchMenuItems();
            } else {
                alert("Failed to update availability status");
            }
        } catch (error) {
            console.error("Error updating availability:", error);
        }
    };
    const handleCreateDiscount = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");

            // Prepare the payload, sending multiple variations of the percentage key
            // just in case the backend uses a different name.
            const payload = {
                code: newDiscount.code.trim().toUpperCase(),
                discountPercentage: Number(newDiscount.discountPercentage),
                maxUses: Number(newDiscount.maxUses),
                expiresAt: newDiscount.expiresAt
            };

            const res = await fetch("http://127.0.0.1:5000/api/discounts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("Discount code created! 🎉");
                setNewDiscount({code: '', discountPercentage: '', maxUses: '', expiresAt: ''});
                fetchDiscounts();
            } else {
                const err = await res.json();
                alert(err.message || "Failed to create discount");
                console.error("Backend Validation Error:", err);
            }
        } catch (error) {
            console.error("Error creating discount:", error);
        }
    };
    const handleRoleChange = async (userId, newRoleId) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://127.0.0.1:5000/api/admin/users/${userId}/role`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({roleId: newRoleId})
            });

            if (res.ok) fetchUsers();
        } catch (error) {
            console.error("Error updating role:", error);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://127.0.0.1:5000/api/menu/categories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({name: newCategoryName})
            });
            if (res.ok) {
                setNewCategoryName('');
                fetchCategories();
            }
        } catch (error) {
            console.error("Error adding category:", error);
        }
    };
    const handleUpdateStock = async (id, currentStock, change) => {
        const newStock = currentStock + change;
        if (newStock < 0) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://127.0.0.1:5000/api/menu/menu-items/${id}/availability`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({stock: newStock})
            });

            if (res.ok) {
                fetchMenuItems();
            } else {
                const err = await res.json();
                alert(err.message || "Failed to update stock");
            }
        } catch (error) {
            console.error("Error updating stock:", error);
            alert("Network error updating stock");
        }
    };
    const handleInputChange = (e) => {
        const {name, value, type, checked} = e.target;
        setNewItem(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        const selectedCategory = newItem.category || (categories.length > 0 ? categories[0]._id : '');
        if (!newItem.title || !newItem.price || !selectedCategory) return alert("Please fill title, price, and category.");

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append('name', newItem.title);
            formData.append('title', newItem.title);
            formData.append('description', newItem.description || '');
            formData.append('price', newItem.price);
            formData.append('stock', newItem.stock || 0);
            formData.append('category', selectedCategory);
            formData.append('isAvailable', newItem.isAvailable === true ? 'true' : 'false');
            if (imageFile) formData.append('image', imageFile);

            const res = await fetch("http://127.0.0.1:5000/api/menu/menu-items", {
                method: "POST",
                headers: {"Authorization": `Bearer ${token}`},
                body: formData
            });

            if (res.ok) {
                setNewItem({
                    title: '',
                    description: '',
                    price: '',
                    stock: '',
                    category: categories.length > 0 ? categories[0]._id : '',
                    isAvailable: true
                });
                setImageFile(null);
                fetchMenuItems();
                alert("Menu item added successfully! 🎉");
            } else {
                const err = await res.json();
                alert(err.message || "Failed to add menu item");
            }
        } catch (error) {
            console.error("Error adding item:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://127.0.0.1:5000/api/menu/menu-items/${id}`, {
                method: "DELETE",
                headers: {"Authorization": `Bearer ${token}`}
            });
            if (res.ok) fetchMenuItems();
        } catch (error) {
            console.error("Error deleting item:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h1 className="text-3xl font-extrabold text-gray-900">Admin Dashboard ⚙️</h1>
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border shadow-sm">
                        <span className="text-sm font-bold text-gray-700">
                            {isForceOpen ? "🟢 Force Open (24/7)" : "⏰ Working Hours (08:00–22:00)"}
                        </span>
                        <button
                            onClick={handleToggleStatus}
                            className={`px-3 py-1 rounded-lg text-white font-bold text-xs transition-colors ${
                                isForceOpen ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"
                            }`}
                        >
                            {isForceOpen ? "Disable Force Open" : "Enable Force Open"}
                        </button>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex gap-4 mb-6 border-b pb-3 flex-wrap">
                    <button
                        onClick={() => setActiveTab("menu")}
                        className={`px-4 py-2 font-bold rounded-lg ${activeTab === 'menu' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Menu Management
                    </button>
                    <button
                        onClick={() => setActiveTab("discounts")}
                        className={`px-4 py-2 font-bold rounded-lg ${activeTab === 'discounts' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Discounts 🎟️
                    </button>
                    <button
                        onClick={() => setActiveTab("users")}
                        className={`px-4 py-2 font-bold rounded-lg ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        User Management
                    </button>
                    <button
                        onClick={() => setActiveTab("analytics")}
                        className={`px-4 py-2 font-bold rounded-lg ${activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Sales Analytics
                    </button>
                </div>

                {/* Discounts Tab */}
                {activeTab === "discounts" && (
                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border">
                            <h2 className="text-xl font-bold mb-4">Create New Discount Code 🎟️</h2>
                            <form onSubmit={handleCreateDiscount} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Discount Code (e.g. FOOD20)"
                                        value={newDiscount.code}
                                        onChange={(e) => setNewDiscount({...newDiscount, code: e.target.value})}
                                        className="border p-2 rounded uppercase font-mono"
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="Discount Percent (e.g. 20)"
                                        value={newDiscount.discountPercentage}
                                        onChange={(e) => setNewDiscount({
                                            ...newDiscount,
                                            discountPercentage: e.target.value
                                        })}
                                        min="1"
                                        max="100"
                                        className="border p-2 rounded"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="number"
                                        placeholder="Max Usage Limit (e.g. 50)"
                                        value={newDiscount.maxUses}
                                        onChange={(e) => setNewDiscount({...newDiscount, maxUses: e.target.value})}
                                        min="1"
                                        className="border p-2 rounded"
                                        required
                                    />
                                    <input
                                        type="date"
                                        value={newDiscount.expiresAt}
                                        onChange={(e) => setNewDiscount({...newDiscount, expiresAt: e.target.value})}
                                        className="border p-2 rounded"
                                        required
                                    />
                                </div>
                                <button type="submit"
                                        className="w-full bg-green-600 text-white font-bold py-2.5 rounded-lg hover:bg-green-700">
                                    Create Discount Code
                                </button>
                            </form>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border">
                            <h2 className="text-xl font-bold mb-4">Active Discounts ({discounts.length})</h2>
                            {discounts.length === 0 ? (
                                <p className="text-gray-500">No discount codes created yet.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percent</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Used
                                                / Max
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires
                                                At
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                        {discounts.map(d => (
                                            <tr key={d._id}>
                                                <td className="px-6 py-4 font-mono font-bold text-indigo-600">{d.code}</td>
                                                <td className="px-6 py-4 font-bold text-green-600">{d.discountPercentage}%</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{d.usedCount || 0} / {d.maxUses}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{new Date(d.expiresAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Sales Analytics Tab */}
                {activeTab === "analytics" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border">
                                <h3 className="text-gray-500 font-semibold mb-2">Total Revenue</h3>
                                <p className="text-3xl font-extrabold text-green-600">${analytics.totalRevenue?.toFixed(2) || "0.00"}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border">
                                <h3 className="text-gray-500 font-semibold mb-2">Total Orders (Delivered)</h3>
                                <p className="text-3xl font-extrabold text-blue-600">{analytics.totalOrders || 0}</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue Chart (Last 7 Days)</h3>
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics.chartData || []}>
                                        <CartesianGrid strokeDasharray="3 3"/>
                                        <XAxis dataKey="date"/>
                                        <YAxis/>
                                        <Tooltip/>
                                        <Bar dataKey="revenue" fill="#3b82f6"/>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* User Management Tab */}
                {activeTab === "users" && (
                    <div className="bg-white shadow-sm rounded-xl border overflow-hidden p-6">
                        <h2 className="text-xl font-bold mb-4">Registered Users ({users.length})</h2>
                        {users.length === 0 ? (
                            <p className="text-gray-500">No users found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                    {users.map(user => (
                                        <tr key={user._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role?.name || "Customer"}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <select
                                                    className="px-3 py-1 border rounded bg-gray-50 text-sm font-semibold"
                                                    value={user.role?._id || ""}
                                                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                >
                                                    {roles.map(r => (
                                                        <option key={r._id} value={r._id}>{r.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Menu Management Tab */}
                {activeTab === "menu" && (
                    <div className="space-y-8">
                        {/* Categories Section */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border">
                            <h2 className="text-xl font-bold mb-4">Manage Categories</h2>
                            <form onSubmit={handleAddCategory} className="flex gap-4 mb-4">
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="New Category Name"
                                    className="flex-grow border p-2 rounded"
                                    required
                                />
                                <button type="submit"
                                        className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700">
                                    Add Category
                                </button>
                            </form>
                            <div className="flex flex-wrap gap-2">
                                {categories.map(cat => (
                                    <span key={cat._id}
                                          className="bg-gray-100 px-3 py-1 rounded-full text-sm font-semibold text-gray-700">
                                        {cat.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Add Menu Item Form */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border">
                            <h2 className="text-xl font-bold mb-4">Add New Menu Item</h2>
                            <form onSubmit={handleAddItem} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        name="title"
                                        value={newItem.title}
                                        onChange={handleInputChange}
                                        placeholder="Item Title"
                                        required
                                        className="border p-2 rounded w-full"
                                    />
                                    <input
                                        type="number"
                                        name="price"
                                        value={newItem.price}
                                        onChange={handleInputChange}
                                        placeholder="Price ($)"
                                        step="0.01"
                                        min="0"
                                        required
                                        className="border p-2 rounded w-full"
                                    />
                                </div>
                                <input
                                    type="text"
                                    name="description"
                                    value={newItem.description}
                                    onChange={handleInputChange}
                                    placeholder="Description"
                                    required
                                    className="border p-2 rounded w-full"
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <select
                                        name="category"
                                        value={newItem.category || (categories.length > 0 ? categories[0]._id : '')}
                                        onChange={handleInputChange}
                                        required
                                        className="border p-2 rounded w-full"
                                    >
                                        <option value="" disabled>Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={newItem.stock || ''}
                                        onChange={handleInputChange}
                                        placeholder="Stock (e.g. 50)"
                                        min="0"
                                        required
                                        className="w-full border p-2 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setImageFile(e.target.files[0])}
                                        className="border p-2 rounded w-full"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isAvailable"
                                        checked={newItem.isAvailable}
                                        onChange={handleInputChange}
                                        className="mr-2"
                                        id="isAvailable"
                                    />
                                    <label htmlFor="isAvailable" className="text-gray-700">Is Available?</label>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700"
                                >
                                    {loading ? "Adding..." : "Add Menu Item"}
                                </button>
                            </form>
                        </div>

                        {/* Current Menu Items List */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border">
                            <h2 className="text-xl font-bold mb-4">Current Menu Items</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                    {menuItems.map(item => (
                                        <tr key={item._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {item.imageUrl ? (
                                                    <img src={`http://127.0.0.1:5000${item.imageUrl}`} alt={item.name}
                                                         className="w-12 h-12 object-cover rounded"/>
                                                ) : (
                                                    <div
                                                        className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">No
                                                        Img</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category?.name || 'Uncategorized'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">${item.price?.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleUpdateStock(item._id, item.stock, -1)}
                                                        className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded font-bold text-gray-700 transition-colors"
                                                    >
                                                        -
                                                    </button>
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-bold ${item.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {item.stock}
                                                    </span>
                                                    <button
                                                        onClick={() => handleUpdateStock(item._id, item.stock, 1)}
                                                        className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded font-bold text-gray-700 transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleToggleAvailability(item._id, item.isAvailable !== false)}
                                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors shadow-sm cursor-pointer ${
                                                        item.isAvailable !== false
                                                            ? 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200'
                                                            : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {item.isAvailable !== false ? 'Available ✅' : 'Unavailable ❌'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button onClick={() => handleDeleteItem(item._id)}
                                                        className="text-red-600 hover:text-red-900 font-bold">
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}