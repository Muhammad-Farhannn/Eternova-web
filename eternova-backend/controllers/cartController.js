
// Helper to recalculate totals
const recalculate = (cart) => {
    cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
        if (!cart) {
            return res.status(200).json({ success: true, data: { items: [], totalItems: 0, totalPrice: 0 } });
        }
        res.status(200).json({ success: true, data: cart });
    } catch (err) {
        next(err);
    }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ success: false, message: 'Not enough stock available' });
        }

        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            cart = new Cart({ user: req.user.id, items: [] });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += Number(quantity);
            if (cart.items[itemIndex].quantity > product.stock) {
                return res.status(400).json({ success: false, message: 'Not enough stock available for this quantity' });
            }
        } else {
            cart.items.push({
                product: productId,
                quantity: Number(quantity),
                price: product.price
            });
        }

        recalculate(cart);
        await cart.save();

        res.status(200).json({ success: true, data: cart });
    } catch (err) {
        next(err);
    }
};

// @desc    Update cart item
// @route   PUT /api/cart/:productId
// @access  Private
exports.updateCartItem = async (req, res, next) => {
    try {
        const { quantity } = req.body;
        const productId = req.params.productId;

        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {
            if (quantity <= 0) {
                cart.items.splice(itemIndex, 1);
            } else {
                const product = await Product.findById(productId);
                if (product && product.stock < quantity) {
                    return res.status(400).json({ success: false, message: 'Not enough stock available' });
                }
                cart.items[itemIndex].quantity = Number(quantity);
            }

            recalculate(cart);
            await cart.save();
            return res.status(200).json({ success: true, data: cart });
        } else {
            return res.status(404).json({ success: false, message: 'Item not found in cart' });
        }
    } catch (err) {
        next(err);
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
exports.removeCartItem = async (req, res, next) => {
    try {
        const productId = req.params.productId;
        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        
        recalculate(cart);
        await cart.save();

        res.status(200).json({ success: true, data: cart });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete cart
// @route   DELETE /api/cart
// @access  Private
exports.deleteCart = async (req, res, next) => {
    try {
        await Cart.findOneAndDelete({ user: req.user.id });
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
