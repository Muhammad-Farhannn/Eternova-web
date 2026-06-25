const supabase = require('../config/supabase');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        // Supabase sign up
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        }

        const user = data.user;
        const session = data.session;

        if (user) {
            // Insert profile
            await supabase.from('profiles').insert([
                { id: user.id, email: user.email, name }
            ]);
        }

        res.status(201).json({ 
            success: true, 
            token: session ? session.access_token : null, 
            user: user 
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        res.status(200).json({ 
            success: true, 
            token: data.session.access_token, 
            user: data.user 
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (error) {
            return res.status(404).json({ success: false, message: 'User profile not found' });
        }

        res.status(200).json({ success: true, user: profile });
    } catch (err) {
        next(err);
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.CLIENT_URL}/reset-password`,
        });

        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        }

        res.status(200).json({ success: true, message: 'Email sent' });
    } catch (err) {
        next(err);
    }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
// Note: In Supabase, password reset is handled natively via the client with the access token parsed from the URL fragment.
// For a backend API, typically the frontend uses supabase-js to update the password directly.
// This route is left as a placeholder or can be used if you pass the recovery token to update user.
exports.resetPassword = async (req, res, next) => {
    try {
        const { password } = req.body;
        
        // Assuming req.params.token is the access_token obtained from the hash
        const { data, error } = await supabase.auth.updateUser({ password });

        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        }

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        next(err);
    }
};
