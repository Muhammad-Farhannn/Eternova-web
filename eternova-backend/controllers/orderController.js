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
    try {
        const { items, shippingAddress, paymentMethod, itemsPrice, shippingPrice, taxPrice, totalPrice } = req.body;
        
        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }
        
        const { data, error } = await supabase.from('orders').insert([{
            user_id: req.user.id,
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
        
        // Clear cart for the user
        await supabase.from('carts').update({ items: [], total_price: 0, total_items: 0 }).eq('user_id', req.user.id);
        
        res.status(201).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my
// @access  Private
exports.getMyOrders = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ success: false, message: error.message });
        }

        res.status(200).json({ success: true, count: data.length, data });
    } catch (err) {
        next(err);
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*, profiles(name, email)')
            .eq('id', req.params.id)
            .single();

        if (error || !data) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        // Check if order belongs to user
        if (data.user_id !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to view this order' });
        }

        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
    try {
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (orderError || !order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        if (order.user_id !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        
        if (order.order_status !== 'Pending' && order.order_status !== 'Processing') {
             return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
        }

        const { data, error } = await supabase
            .from('orders')
            .update({ order_status: 'Cancelled' })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) {
            return res.status(500).json({ success: false, message: error.message });
        }

        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};
