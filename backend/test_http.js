const http = require('http');
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/foodops').then(async () => {
    // Generate a quick token for admin
    const jwt = require('jsonwebtoken');
    const adminUser = await User.findOne({ email: 'mohammad@gmail.com' }); // assuming mohammad is admin
    if (!adminUser) { console.log('Admin not found'); process.exit(1); }
    
    const token = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });
    
    const req = http.request('http://localhost:5000/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
    }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log("HTTP Response:", JSON.parse(data).orders[0]);
            process.exit(0);
        });
    });
    req.end();
});
