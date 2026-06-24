const express = require('express');
const { getProducts, getFeaturedProducts, getProduct, getProductReviews, createProductReview } = require('../controllers/productController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .get(getProducts);

router.route('/featured')
    .get(getFeaturedProducts);

router.route('/:id')
    .get(getProduct);

router.route('/:id/reviews')
    .get(getProductReviews)
    .post(protect, createProductReview);

module.exports = router;
