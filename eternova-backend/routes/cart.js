const express = require('express');
const { getCart, addToCart, updateCartItem, removeCartItem, deleteCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getCart)
    .post(addToCart)
    .delete(deleteCart);

router.route('/:productId')
    .put(updateCartItem)
    .delete(removeCartItem);

module.exports = router;
