const supabase = require('../config/supabase');

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, phone } = req.body;

        let { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (fetchError && fetchError.code === 'PGRST116') {
            profile = { id: req.user.id, email: req.user.email };
        } else if (fetchError) {
            return res.status(400).json({ success: false, message: fetchError.message });
        }

        profile.name = name;
        profile.phone = phone;

        const { data: user, error } = await supabase
            .from('profiles')
            .upsert(profile)
            .select()
            .single();

        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        }

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

// @desc    Update user password
// @route   PUT /api/user/password
// @access  Private
exports.updatePassword = async (req, res, next) => {
    try {
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ success: false, message: 'Please provide new password' });
        }

        // Use the auth access token we already have in the headers!
        // req.headers.authorization has the bearer token.
        const token = req.headers.authorization.split(' ')[1];
        
        // Supabase allows password update if we pass the current access token
        // Wait, supabase.auth.updateUser only updates the current authenticated user's session
        // If we initialize a client with the token, it will work.
        // Actually, supabase admin client can also update password:
        const { data, error } = await supabase.auth.admin.updateUserById(req.user.id, {
            password: newPassword
        });

        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        }

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        next(err);
    }
};

// @desc    Add address
// @route   POST /api/user/address
// @access  Private
exports.addAddress = async (req, res, next) => {
    try {
        const newAddress = {
            id: require('crypto').randomUUID(),
            ...req.body
        };

        // Fetch current addresses
        let { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (fetchError && fetchError.code === 'PGRST116') {
            profile = { id: req.user.id, email: req.user.email };
        } else if (fetchError) {
            return res.status(400).json({ success: false, message: fetchError.message });
        }

        let addresses = profile.addresses || [];
        if (!Array.isArray(addresses)) addresses = [];

        // If new address is default, unset others
        if (newAddress.isDefault) {
            addresses = addresses.map(addr => ({ ...addr, isDefault: false }));
        } else if (addresses.length === 0) {
            newAddress.isDefault = true;
        }

        addresses.push(newAddress);
        profile.addresses = addresses;

        const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .upsert(profile)
            .select()
            .single();

        if (updateError) {
            return res.status(400).json({ success: false, message: updateError.message });
        }

        res.status(200).json({ success: true, data: updatedProfile.addresses });
    } catch (err) {
        next(err);
    }
};

// @desc    Update address
// @route   PUT /api/user/address/:addressId
// @access  Private
exports.updateAddress = async (req, res, next) => {
    try {
        const addressId = req.params.addressId;

        let { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (fetchError && fetchError.code === 'PGRST116') {
            profile = { id: req.user.id, email: req.user.email };
        } else if (fetchError) {
            return res.status(400).json({ success: false, message: fetchError.message });
        }

        let addresses = profile.addresses || [];
        if (!Array.isArray(addresses)) addresses = [];

        const index = addresses.findIndex(addr => addr.id === addressId);
        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        if (req.body.isDefault) {
            addresses = addresses.map(addr => ({ ...addr, isDefault: false }));
        }

        addresses[index] = { ...addresses[index], ...req.body };
        profile.addresses = addresses;

        const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .upsert(profile)
            .select()
            .single();

        if (updateError) {
            return res.status(400).json({ success: false, message: updateError.message });
        }

        res.status(200).json({ success: true, data: updatedProfile.addresses });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete address
// @route   DELETE /api/user/address/:addressId
// @access  Private
exports.deleteAddress = async (req, res, next) => {
    try {
        const addressId = req.params.addressId;

        let { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (fetchError && fetchError.code === 'PGRST116') {
            profile = { id: req.user.id, email: req.user.email };
        } else if (fetchError) {
            return res.status(400).json({ success: false, message: fetchError.message });
        }

        let addresses = profile.addresses || [];
        if (!Array.isArray(addresses)) addresses = [];

        addresses = addresses.filter(addr => addr.id !== addressId);
        profile.addresses = addresses;

        const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .upsert(profile)
            .select()
            .single();

        if (updateError) {
            return res.status(400).json({ success: false, message: updateError.message });
        }

        res.status(200).json({ success: true, data: updatedProfile.addresses });
    } catch (err) {
        next(err);
    }
};
