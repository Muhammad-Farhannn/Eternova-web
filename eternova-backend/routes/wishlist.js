const express = require('express');
const { getWishlist, toggleWishlist, removeWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getWishlist);

router.route('/toggle')
    .post(toggleWishlist);

router.route('/:productId')
    .delete(removeWishlist);

module.exports = router;
