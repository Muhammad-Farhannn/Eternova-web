const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const sendEmail = require('../utils/sendEmail');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
    try {
        const { shippingAddress, paymentMethod } = req.body;

        const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        // Map cart items into order items format
        const orderItems = cart.items.map(item => ({
            product: item.product._id,
            name: item.product.name,
            image: item.product.images[0] || '',
            price: item.price,
            quantity: item.quantity
        }));

        // Calculate prices
        const itemsPrice = cart.totalPrice;
        const shippingPrice = 0; // Free shipping rule
        const taxPrice = 0; // 0% tax rule
        const totalPrice = itemsPrice + shippingPrice + taxPrice;

        const order = await Order.create({
            user: req.user.id,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice
        });

        // Reduce stock
        for (let i = 0; i < cart.items.length; i++) {
            const product = await Product.findById(cart.items[i].product._id);
            if (product) {
                product.stock = product.stock - cart.items[i].quantity;
                await product.save();
            }
        }

        // Delete user's cart
        await Cart.findOneAndDelete({ user: req.user.id });

        // Send confirmation email
        try {
            await sendEmail({
                to: req.user.email,
                subject: `Eternova Order Confirmation - ${order._id}`,
                text: `Thank you for your order! Your order ID is ${order._id}. Total amount: ${totalPrice} PKR.`
            });
        } catch (error) {
            console.error('Email sending failed', error);
        }

        res.status(201).json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my
// @access  Private
exports.getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort('-createdAt');
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (err) {
        next(err);
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.user._id.toString() !== req.user.id) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.status(200).json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.user.toString() !== req.user.id) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.orderStatus !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Cannot cancel processed orders' });
        }

        order.orderStatus = 'Cancelled';
        await order.save();

        res.status(200).json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
};
