const User = require('../models/User');

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, phone } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, phone },
            { new: true, runValidators: true }
        );

        user.password = undefined;

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
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Please provide old and new password' });
        }

        const user = await User.findById(req.user.id).select('+password');

        const isMatch = await user.matchPassword(oldPassword);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Password incorrect' });
        }

        user.password = newPassword;
        await user.save();

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
        const { label, street, city, state, zip, country, isDefault } = req.body;

        const user = await User.findById(req.user.id);

        user.addresses.push({ label, street, city, state, zip, country, isDefault });

        await user.save();

        res.status(200).json({ success: true, data: user.addresses });
    } catch (err) {
        next(err);
    }
};

// @desc    Update address
// @route   PUT /api/user/address/:addressId
// @access  Private
exports.updateAddress = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const addressId = req.params.addressId;

        const address = user.addresses.id(addressId);

        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        Object.assign(address, req.body);

        await user.save();

        res.status(200).json({ success: true, data: user.addresses });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete address
// @route   DELETE /api/user/address/:addressId
// @access  Private
exports.deleteAddress = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const addressId = req.params.addressId;

        user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);

        await user.save();

        res.status(200).json({ success: true, data: user.addresses });
    } catch (err) {
        next(err);
    }
};
