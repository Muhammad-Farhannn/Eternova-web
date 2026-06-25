const supabase = require('../config/supabase');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
    try {
        let query = supabase.from('products').select('*', { count: 'exact' });

        // Search by name
        if (req.query.search) {
            query = query.ilike('name', `%${req.query.search}%`);
        }

        // Price range
        if (req.query.minPrice) {
            query = query.gte('price', req.query.minPrice);
        }
        if (req.query.maxPrice) {
            query = query.lte('price', req.query.maxPrice);
        }

        // Sort
        if (req.query.sort) {
            let sortBy = req.query.sort;
            let ascending = true;
            if (sortBy === 'price_asc') { sortBy = 'price'; ascending = true; }
            else if (sortBy === 'price_desc') { sortBy = 'price'; ascending = false; }
            else if (sortBy === 'newest') { sortBy = 'created_at'; ascending = false; }
            else if (sortBy === 'rating') { sortBy = 'ratings'; ascending = false; }
            query = query.order(sortBy, { ascending });
        } else {
            query = query.order('created_at', { ascending: false });
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 12;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit - 1;

        query = query.range(startIndex, endIndex);

        const { data: products, count, error } = await query;

        if (error) throw error;

        // Pagination result
        const pagination = {};
        if (endIndex + 1 < count) {
            pagination.next = { page: page + 1, limit };
        }
        if (startIndex > 0) {
            pagination.prev = { page: page - 1, limit };
        }

        res.status(200).json({
            success: true,
            count: products.length,
            total: count,
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
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_featured', true);

        if (error) throw error;

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
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !product) {
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
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('product_id', req.params.id);

        if (error) throw error;

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

        const { data: product, error: productError } = await supabase
            .from('products')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (productError || !product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Check if already reviewed
        const { data: alreadyReviewed, error: reviewError } = await supabase
            .from('reviews')
            .select('*')
            .eq('product_id', req.params.id)
            .eq('user_id', req.user.id)
            .single();

        if (alreadyReviewed) {
            return res.status(400).json({ success: false, message: 'Product already reviewed' });
        }

        const { data: review, error: createError } = await supabase
            .from('reviews')
            .insert([{
                rating: Number(rating),
                comment,
                name: req.user.name,
                user_id: req.user.id,
                product_id: req.params.id
            }])
            .select()
            .single();

        if (createError) throw createError;

        // Recalculate rating
        const { data: reviews, error: fetchReviewsError } = await supabase
            .from('reviews')
            .select('rating')
            .eq('product_id', req.params.id);

        if (fetchReviewsError) throw fetchReviewsError;

        const numReviews = reviews.length;
        const ratings = reviews.reduce((acc, item) => item.rating + acc, 0) / (numReviews || 1);

        const { error: updateError } = await supabase
            .from('products')
            .update({ num_reviews: numReviews, ratings })
            .eq('id', req.params.id);

        if (updateError) throw updateError;

        res.status(201).json({ success: true, data: review });
    } catch (err) {
        next(err);
    }
};
