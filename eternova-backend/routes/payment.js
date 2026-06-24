const express = require('express');
const { createPaymentIntent, confirmPayment, codPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/intent', createPaymentIntent);
router.post('/confirm', confirmPayment);
router.post('/cod/:orderId', codPayment);

module.exports = router;
