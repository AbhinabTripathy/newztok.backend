const User = require('../models/user.model');
const News = require('../models/news.model');
const httpStatus = require('../enums/httpStatusCode.enum');
const sequelize = require('../config/db');

const userController = {};

// Get journalists assigned to editor
userController.getAssignedJournalists = async (req, res) => {
    try {
        // Get the editor ID from the authenticated user
        const editorId = req.user.id || req.mwValue?.auth?.id;
        
        // Find journalists created by this editor
        const journalists = await User.findAll({
            where: {
                createdBy: editorId,
                role: 'journalist'
            },
            attributes: ['id', 'username', 'email', 'role', 'status', 'createdAt']
        });
        
        if (journalists.length === 0) {
            // If no journalists found, just return a message without any data
            return res.success(
                httpStatus.OK,
                true,
                "No journalists created by you found.",
                []
            );
        }
        
        return res.success(
            httpStatus.OK,
            true,
            "Journalists created by you fetched successfully",
            journalists
        );
    } catch (error) {
        console.error('Fetch journalists error:', error);
        return res.error(
            httpStatus.INTERNAL_SERVER_ERROR,
            false,
            "Error fetching journalists: " + error.message
        );
    }
};

module.exports = userController;