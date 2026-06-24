const Product = require('../models/Product');
const Review = require('../models/Review');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
    try {
        let query;

        const reqQuery = { ...req.query };
        const removeFields = ['select', 'sort', 'page', 'limit', 'search', 'minPrice', 'maxPrice'];
        removeFields.forEach(param => delete reqQuery[param]);

        let queryStr = JSON.stringify(reqQuery);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        let parsedQuery = JSON.parse(queryStr);

        // Search by name
        if (req.query.search) {
            parsedQuery.name = { $regex: req.query.search, $options: 'i' };
        }

        // Price range
        if (req.query.minPrice || req.query.maxPrice) {
            parsedQuery.price = {};
            if (req.query.minPrice) parsedQuery.price.$gte = req.query.minPrice;
            if (req.query.maxPrice) parsedQuery.price.$lte = req.query.maxPrice;
        }

        query = Product.find(parsedQuery);

        // Sort
        if (req.query.sort) {
            let sortBy = req.query.sort.split(',').join(' ');
            if (req.query.sort === 'price_asc') sortBy = 'price';
            if (req.query.sort === 'price_desc') sortBy = '-price';
            if (req.query.sort === 'newest') sortBy = '-createdAt';
            if (req.query.sort === 'rating') sortBy = '-ratings';
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 12;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Product.countDocuments(parsedQuery);

        query = query.skip(startIndex).limit(limit);

        const products = await query;

        // Pagination result
        const pagination = {};
        if (endIndex < total) {
            pagination.next = { page: page + 1, limit };
        }
        if (startIndex > 0) {
            pagination.prev = { page: page - 1, limit };
        }

        res.status(200).json({
            success: true,
            count: products.length,
            total,
            pagination,
            data: products
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ isFeatured: true });
        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, data: product });
    } catch (err) {
        next(err);
    }
};

// @desc    Get reviews for a product
// @route   GET /api/products/:id/reviews
// @access  Public
exports.getProductReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ product: req.params.id });
        res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
exports.createProductReview = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Check if already reviewed
        const alreadyReviewed = await Review.findOne({
            product: req.params.id,
            user: req.user.id
        });

        if (alreadyReviewed) {
            return res.status(400).json({ success: false, message: 'Product already reviewed' });
        }

        const review = await Review.create({
            rating: Number(rating),
            comment,
            name: req.user.name,
            user: req.user.id,
            product: req.params.id
        });

        // Recalculate rating
        const reviews = await Review.find({ product: req.params.id });
        product.numReviews = reviews.length;
        product.ratings = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

        await product.save();

        res.status(201).json({ success: true, data: review });
    } catch (err) {
        next(err);
    }
};
