const supabase = require('../config/supabase');

// @desc    Create new guest order
// @route   POST /api/orders/guest
// @access  Public
exports.createGuestOrder = async (req, res, next) => {
    try {
        const { items, shippingAddress, paymentMethod, itemsPrice, shippingPrice, taxPrice, totalPrice } = req.body;
        
        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }
        
        // Use the hardcoded guest profile ID
        const guestUserId = '90330465-a02e-4930-8922-c1195a4aa21b';
        
        const { data, error } = await supabase.from('orders').insert([{
            user_id: guestUserId,
            items,
            shipping_address: shippingAddress,
            payment_method: paymentMethod || 'cod',
            items_price: itemsPrice,
            shipping_price: shippingPrice,
            tax_price: taxPrice,
            total_price: totalPrice,
            order_status: 'Pending',
            is_paid: false
        }]).select().single();
        
        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ success: false, message: 'Failed to create order' });
        }
        
        res.status(201).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
    // Stub
    res.status(501).json({ success: false, message: 'Not implemented' });
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my
// @access  Private
exports.getMyOrders = async (req, res, next) => {
    // Stub
    res.status(501).json({ success: false, message: 'Not implemented' });
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
    // Stub
    res.status(501).json({ success: false, message: 'Not implemented' });
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
    // Stub
    res.status(501).json({ success: false, message: 'Not implemented' });
};
