const { Like, Comment, Share, News, User } = require('../models');
const httpStatus = require('../enums/httpStatusCode.enum');

const interactionController = {};

// Like/Unlike a news
interactionController.toggleLike = async (req, res) => {
    try {
        const { newsId } = req.params;
        const userId = req.mwValue.auth.id;

        const news = await News.findByPk(newsId);
        if (!news) {
            return res.error(httpStatus.NOT_FOUND, false, "News not found");
        }

        const existingLike = await Like.findOne({
            where: { userId, newsId }
        });

        if (existingLike) {
            await existingLike.destroy();
            return res.success(httpStatus.OK, true, "News unliked successfully");
        }

        await Like.create({ userId, newsId });
        return res.success(httpStatus.CREATED, true, "News liked successfully");
    } catch (error) {
        console.error('Toggle like error:', error);
        return res.error(httpStatus.INTERNAL_SERVER_ERROR, false, "Error processing like", error);
    }
};

// Add comment
interactionController.addComment = async (req, res) => {
    try {
        const { newsId } = req.params;
        const { content } = req.body;
        const userId = req.mwValue.auth.id;

        if (!content) {
            return res.error(httpStatus.BAD_REQUEST, false, "Comment content is required");
        }

        const news = await News.findByPk(newsId);
        if (!news) {
            return res.error(httpStatus.NOT_FOUND, false, "News not found");
        }

        const comment = await Comment.create({
            content,
            userId,
            newsId
        });

        return res.success(httpStatus.CREATED, true, "Comment added successfully", comment);
    } catch (error) {
        console.error('Add comment error:', error);
        return res.error(httpStatus.INTERNAL_SERVER_ERROR, false, "Error adding comment", error);
    }
};

// Get comments for a news
interactionController.getComments = async (req, res) => {
    try {
        const { newsId } = req.params;

        const comments = await Comment.findAll({
            where: { newsId },
            include: [{
                model: User,
                attributes: ['username']
            }],
            order: [['createdAt', 'DESC']]
        });

        return res.success(httpStatus.OK, true, "Comments fetched successfully", comments);
    } catch (error) {
        console.error('Get comments error:', error);
        return res.error(httpStatus.INTERNAL_SERVER_ERROR, false, "Error fetching comments", error);
    }
};

// Share news
interactionController.shareNews = async (req, res) => {
    try {
        const { newsId } = req.params;
        const userId = req.mwValue.auth.id;

        const news = await News.findByPk(newsId);
        if (!news) {
            return res.error(httpStatus.NOT_FOUND, false, "News not found");
        }

        await Share.create({ userId, newsId });
        return res.success(httpStatus.CREATED, true, "News shared successfully");
    } catch (error) {
        console.error('Share news error:', error);
        return res.error(httpStatus.INTERNAL_SERVER_ERROR, false, "Error sharing news", error);
    }
};


// Get post statistics (likes, comments, shares count)
interactionController.getPostStats = async (req, res) => {
    try {
        const { newsId } = req.params;

        const news = await News.findByPk(newsId);
        if (!news) {
            return res.error(httpStatus.NOT_FOUND, false, "News not found");
        }

        const stats = await Promise.all([
            Like.count({ where: { newsId } }),
            Comment.count({ where: { newsId } }),
            Share.count({ where: { newsId } })
        ]);

        const postStats = {
            likes: stats[0],
            comments: stats[1],
            shares: stats[2]
        };

        return res.success(httpStatus.OK, true, "Post statistics fetched successfully", postStats);
    } catch (error) {
        console.error('Get post stats error:', error);
        return res.error(httpStatus.INTERNAL_SERVER_ERROR, false, "Error fetching post statistics", error);
    }
};
module.exports = interactionController;