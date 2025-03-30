const User = require('../models/user.model');
const News = require('../models/news.model');
const httpStatus = require('../enums/httpStatusCode.enum');

const userController = {};

// Get journalists assigned to editor
userController.getAssignedJournalists = async (req, res) => {
    try {
        const editorId = req.mwValue.auth.id;

        const journalists = await User.findAll({
            attributes: ['id', 'username', 'email', 'role'],
            include: [{
                model: News,
                as: 'writtenNews',
                where: { editorId: editorId },
                attributes: ['id', 'title', 'status', 'createdAt'],
                required: true
            }],
            where: {
                role: 'journalist'
            }
        });

        return res.success(
            httpStatus.OK,
            true,
            "Assigned journalists fetched successfully",
            journalists
        );
    } catch (error) {
        console.error('Fetch assigned journalists error:', error);
        return res.error(
            httpStatus.INTERNAL_SERVER_ERROR,
            false,
            "Error fetching assigned journalists",
            error
        );
    }
};

module.exports = userController;