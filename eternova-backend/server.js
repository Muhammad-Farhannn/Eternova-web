const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

// Route files
const auth = require('./routes/auth');
const products = require('./routes/products');
const cart = require('./routes/cart');
const wishlist = require('./routes/wishlist');
const orders = require('./routes/orders');
const payment = require('./routes/payment');
const user = require('./routes/user');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/products', products);
app.use('/api/cart', cart);
app.use('/api/wishlist', wishlist);
app.use('/api/orders', orders);
app.use('/api/payment', payment);
app.use('/api/user', user);

// Error handler middleware (must be after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Eternova server running on port ${PORT}`);
});
