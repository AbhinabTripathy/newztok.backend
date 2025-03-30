const User = require('../models/user.model');
const bcrypt = require('bcrypt');

async function seedSuperAdmin() {
    try {
        const superAdminExists = await User.findOne({
            where: { role: 'super_admin' }
        });

        if (!superAdminExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('superadmin123', salt);

            await User.create({
                username: 'superadmin',
                email: 'superadmin@newstalk.com',
                password: hashedPassword,
                mobile: '1234567890',
                role: 'super_admin',
                status: 'active'
            });
            console.log('Super Admin created successfully');
        }
    } catch (error) {
        console.error('Error creating super admin:', error);
    }
}

module.exports = seedSuperAdmin;