const user = require("../models/user");
const Role = require("../models/role");

const createSuperAdmin = async () => {
    try {
        // Check Super Admin role
        const superAdminRole = await Role.findOne({
            where: {
                roleName: "Super Admin",
            },
        });

        if (!superAdminRole) {
            console.log(" Super Admin role not found.");
            return;
        }

        // Check Super Admin user
        const existingSuperAdmin = await user.findOne({
            where: {
                email: process.env.SUPER_ADMIN_EMAIL,
            },
        });

        if (existingSuperAdmin) {
            console.log(" Super Admin already exists.");
            return;
        }

        // Create Super Admin
        await user.create({
            firstName: process.env.SUPER_ADMIN_FIRST_NAME,
            lastName: process.env.SUPER_ADMIN_LAST_NAME,
            email: process.env.SUPER_ADMIN_EMAIL,
            password: process.env.SUPER_ADMIN_PASSWORD,
            confirmPassword: process.env.SUPER_ADMIN_PASSWORD,
            roleId: superAdminRole.id,
            isActive: true,
        });

        console.log(" Super Admin created successfully.");
    } catch (err) {
        console.error(" Error creating Super Admin:", err.message);
    }
};

module.exports = createSuperAdmin;