const Wishlist = require('../models/Wishlist');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res, next) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user.id }).populate('products');
        if (!wishlist) {
            return res.status(200).json({ success: true, data: { products: [] } });
        }
        res.status(200).json({ success: true, data: wishlist });
    } catch (err) {
        next(err);
    }
};

// @desc    Toggle product in wishlist
// @route   POST /api/wishlist/toggle
// @access  Private
exports.toggleWishlist = async (req, res, next) => {
    try {
        const { productId } = req.body;
        
        let wishlist = await Wishlist.findOne({ user: req.user.id });

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user.id, products: [productId] });
            return res.status(200).json({ success: true, message: 'Added to wishlist', data: wishlist });
        }

        const index = wishlist.products.findIndex(p => p.toString() === productId);

        if (index > -1) {
            // Remove
            wishlist.products.splice(index, 1);
            await wishlist.save();
            return res.status(200).json({ success: true, message: 'Removed from wishlist', data: wishlist });
        } else {
            // Add
            wishlist.products.push(productId);
            await wishlist.save();
            return res.status(200).json({ success: true, message: 'Added to wishlist', data: wishlist });
        }
    } catch (err) {
        next(err);
    }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
exports.removeWishlist = async (req, res, next) => {
    try {
        const productId = req.params.productId;
        const wishlist = await Wishlist.findOne({ user: req.user.id });

        if (!wishlist) {
            return res.status(404).json({ success: false, message: 'Wishlist not found' });
        }

        wishlist.products = wishlist.products.filter(p => p.toString() !== productId);
        await wishlist.save();

        res.status(200).json({ success: true, data: wishlist });
    } catch (err) {
        next(err);
    }
};
