const express = require('express');
const { createOrder, getMyOrders, getOrderById, cancelOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
    .post(createOrder);

router.route('/my')
    .get(getMyOrders);

router.route('/:id')
    .get(getOrderById);

router.route('/:id/cancel')
    .put(cancelOrder);

module.exports = router;
