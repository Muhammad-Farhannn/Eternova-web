const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Create payment intent
// @route   POST /api/payment/intent
// @access  Private
exports.createPaymentIntent = async (req, res, next) => {
    try {
        const { amount } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // multiply by 100 to convert to smallest unit
            currency: 'pkr',
            metadata: {
                userId: req.user.id
            }
        });

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Confirm payment for order
// @route   POST /api/payment/confirm
// @access  Private
exports.confirmPayment = async (req, res, next) => {
    try {
        const { orderId, paymentIntentId } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        order.orderStatus = 'Processing';
        order.paymentResult = {
            id: paymentIntentId,
            status: 'paid',
            email: req.user.email
        };

        await order.save();

        res.status(200).json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
};

// @desc    Confirm COD order
// @route   POST /api/payment/cod/:orderId
// @access  Private
exports.codPayment = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        order.paymentMethod = 'cod';
        order.orderStatus = 'Processing';

        await order.save();

        res.status(200).json({ success: true, message: 'COD order confirmed', data: order });
    } catch (err) {
        next(err);
    }
};
