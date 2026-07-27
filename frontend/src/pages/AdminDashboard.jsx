import { useState, useEffect } from 'react';

export default function AdminDashboard() {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        price: '',
        category: 'General',
        isAvailable: true
    });
    const [imageFile, setImageFile] = useState(null);

    const fetchMenu = async () => {
        try {
            const response = await fetch("http://127.0.0.1:5000/api/menu/menu-items");
            const data = await response.json();
            if (response.ok) {
                setMenuItems(data);
            }
        } catch (err) {
            setError("Failed to fetch menu items.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewItem(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const formData = new FormData();
        formData.append('title', newItem.title);
        formData.append('description', newItem.description);
        formData.append('price', newItem.price);
        formData.append('category', newItem.category);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const response = await fetch("http://127.0.0.1:5000/api/menu/menu-items", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                alert("Menu item added successfully!");
                fetchMenu();
                setNewItem({ title: '', description: '', price: '', category: 'General', isAvailable: true });
                setImageFile(null);
                e.target.reset();
            } else {
                const data = await response.json();
                alert(data.message || "Failed to add item. Are you logged in as Admin?");
            }
        } catch (err) {
            alert("Network error while adding item.");
        }
    };

    const handleDeleteItem = async (id) => {
        if(!window.confirm("Are you sure you want to delete this item?")) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://127.0.0.1:5000/api/menu/menu-items/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                setMenuItems(prev => prev.filter(item => item._id !== id));
            } else {
                alert("Failed to delete item. Admin access required.");
            }
        } catch (err) {
            alert("Network error.");
        }
    };

    if (loading) return <div className="text-center mt-20 font-bold">Loading Admin Panel... ⚙️</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* بخش فرم افزودن غذای جدید */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
                    <h2 className="text-2xl font-extrabold text-gray-800 mb-6">Add New Item 🍔</h2>
                    <form onSubmit={handleAddItem} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <input type="text" name="title" value={newItem.title} onChange={handleInputChange} required className="mt-1 w-full px-4 py-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea name="description" value={newItem.description} onChange={handleInputChange} required className="mt-1 w-full px-4 py-2 border rounded-lg" rows="3"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                            <input type="number" step="0.01" name="price" value={newItem.price} onChange={handleInputChange} required className="mt-1 w-full px-4 py-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Image</label>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            Add to Menu
                        </button>
                    </form>
                </div>

                {/* بخش مدیریت منوی فعلی */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h2 className="text-2xl font-extrabold text-gray-800 mb-6 flex justify-between items-center">
                        <span>Current Menu</span>
                        <span className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-600">{menuItems.length} Items</span>
                    </h2>

                    {error && <p className="text-red-500 mb-4">{error}</p>}

                    <div className="space-y-4">
                        {menuItems.map(item => (
                            <div key={item._id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <img src={item.image ? `http://127.0.0.1:5000${item.image}` : "https://via.placeholder.com/150"} alt={item.title} className="w-16 h-16 object-cover rounded-lg" />
                                    <div>
                                        <h3 className="font-bold text-gray-900">{item.title}</h3>
                                        <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteItem(item._id)} className="bg-red-100 text-red-600 hover:bg-red-200 font-semibold py-1 px-3 rounded-lg text-sm transition-colors">
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}