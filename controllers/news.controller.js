const News = require('../models/news.model');
const User = require('../models/user.model');
const like=require('../models/like.model');
const comment=require('../models/comment.model');
const share=require('../models/share.model')
const httpStatus = require('../enums/httpStatusCode.enum');
const sequelize = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const newsController = {};

// Configure storage for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = '';
        if (file.fieldname === 'featuredImage') {
            uploadPath = path.join(__dirname, '../uploads/images');
        } else if (file.fieldname === 'video') {
            uploadPath = path.join(__dirname, '../uploads/videos');
        }
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // Increased to 50MB limit
    }
});

// Create new news post (for journalists)
newsController.createNews = async (req, res) => {
    try {
        // Use a single upload field that accepts both image and video
        const uploadAny = upload.single('featuredImage');
        
        
        uploadAny(req, res, async function(err) {
            if (err) {
                console.error('Upload error:', err);
                return res.error(
                    httpStatus.BAD_REQUEST,
                    false,
                    "Error uploading file: " + err.message
                );
            }
            
            try {
                // Extract values from request body and clean them
                let { title, content, category, contentType, youtubeUrl } = req.body;
                
                // Remove any surrounding quotes from string values
                title = title ? title.replace(/^["'](.*)["']$/, '$1') : title;
                content = content ? content.replace(/^["'](.*)["']$/, '$1') : content;
                category = category ? category.replace(/^["'](.*)["']$/, '$1') : category;
                contentType = contentType ? contentType.replace(/^["'](.*)["']$/, '$1') : contentType;
                youtubeUrl = youtubeUrl ? youtubeUrl.replace(/^["'](.*)["']$/, '$1') : youtubeUrl;
                
                const journalistId = req.mwValue.auth.id;
                
                console.log('Cleaned request body:', { title, content, category, contentType, youtubeUrl });
                console.log('File:', req.file);
                
                // Create news object with common fields
                const newsData = {
                    title,
                    content,
                    category,
                    journalistId,
                    status: 'pending',
                    contentType: contentType || 'standard'
                };
                
                // Handle content type specific fields
                if (contentType === 'standard') {
                    if (req.file) {
                        newsData.featuredImage = `/uploads/images/${req.file.filename}`;
                        newsData.thumbnailUrl = newsData.featuredImage; // Use same image for thumbnail
                    }
                } else if (contentType === 'video') {
                    if (youtubeUrl) {
                        newsData.youtubeUrl = youtubeUrl;
                        // Extract YouTube thumbnail if available
                        const videoId = youtubeUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
                        if (videoId && videoId[1]) {
                            newsData.thumbnailUrl = `https://img.youtube.com/vi/${videoId[1]}/hqdefault.jpg`;
                        }
                    } else if (req.file) {
                        // If it's a video file, move it to the videos directory
                        const oldPath = path.join(__dirname, '../uploads/images', req.file.filename);
                        const newPath = path.join(__dirname, '../uploads/videos', req.file.filename);
                        
                        if (fs.existsSync(oldPath)) {
                            fs.renameSync(oldPath, newPath);
                        }
                        
                        newsData.videoPath = `/uploads/videos/${req.file.filename}`;
                    }
                }
                
                // Validate required fields
                if (!title || !content || !category) {
                    return res.error(
                        httpStatus.BAD_REQUEST,
                        false,
                        "Title, content, and category are required"
                    );
                }
                
                // Create the news
                const news = await News.create(newsData);
                return res.success(httpStatus.CREATED, true, "News created successfully", news);
                
            } catch (error) {
                console.error('Create news error:', error);
                return res.error(
                    httpStatus.INTERNAL_SERVER_ERROR,
                    false,
                    "Error creating news: " + error.message
                );
            }
        });
    } catch (error) {
        console.error('Create news outer error:', error);
        return res.error(
            httpStatus.INTERNAL_SERVER_ERROR,
            false,
            "Error processing request: " + error.message
        );
    }
};

// Get journalist's own news with status
newsController.getMyNews = async (req, res) => {
    try {
        const journalistId = req.user.id;
        const news = await News.findAll({
            where: { journalistId },
            include: [
                {
                    model: User,
                    as: 'author', 
                    attributes: ['id', 'username']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        return res.success(httpStatus.OK, true, "Your news fetched successfully", news);
    } catch (error) {
        console.error('Fetch my news error:', error);
        return res.error(httpStatus.INTERNAL_SERVER_ERROR, false, "Error fetching your news", error);
    }
}    

// Get public news (approved only)
newsController.getPublicNews = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const news = await News.findAndCountAll({
            where: { status: 'approved' },
            include: [
                {
                    model: User,
                    as: 'journalist',
                    attributes: ['id', 'name']
                }
            ],
            attributes: [
                'id', 'title', 'content', 'category', 'status', 
                'contentType', 'youtubeUrl', 'videoPath', 
                'featuredImage', 'thumbnailUrl', 'views', // Make sure thumbnailUrl is included
                'createdAt', 'updatedAt'
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        const totalPages = Math.ceil(news.count / limit);

        return res.success(
            httpStatus.OK,
            true,
            "Public news fetched successfully",
            {
                news: news.rows,
                pagination: {
                    totalItems: news.count,
                    totalPages,
                    currentPage: page,
                    itemsPerPage: limit
                }
            }
        );
    } catch (error) {
        console.error('Get public news error:', error);
        return res.error(
            httpStatus.INTERNAL_SERVER_ERROR,
            false,
            "Error fetching public news",
            error
        );
    }
};

// Get pending news (for editors)
newsController.getPendingNews = async (req, res) => {
    try {
        const pendingNews = await News.findAll({
            where: { status: 'pending' },
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['username']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        return res.success(httpStatus.OK, true, "Pending news fetched successfully", pendingNews);
    } catch (error) {
        console.error('Fetch pending news error:', error);
        return res.error(httpStatus.INTERNAL_SERVER_ERROR, false, "Error fetching pending news", error);
    }
};


// Get journalist's pending news
newsController.getMyPendingNews = async (req, res) => {
    try {
        const journalistId = req.user.id;
        
        const pendingNews = await News.findAll({
            where: { 
                journalistId,
                status: 'pending'
            },
            include: [
                {
                    model: User,
                    as: 'journalist',
                    attributes: ['id', 'username']
                }
            ],
            attributes: [
                'id', 'title', 'content', 'category', 'status', 
                'contentType', 'youtubeUrl', 'videoPath', 
                'featuredImage', 'thumbnailUrl', 'views',
                'createdAt', 'updatedAt'
            ],
            order: [['createdAt', 'DESC']]
        });

        return res.success(
            httpStatus.OK, 
            true, 
            "Your pending news fetched successfully", 
            pendingNews
        );
    } catch (error) {
        console.error('Fetch journalist pending news error:', error);
        return res.error(
            httpStatus.INTERNAL_SERVER_ERROR, 
            false, 
            "Error fetching your pending news", 
            error
        );
    }
};


// Get journalist's approved news
newsController.getMyApprovedNews = async (req, res) => {
    try {
        const journalistId = req.user.id;
        
        const approvedNews = await News.findAll({
            where: { 
                journalistId,
                status: 'approved'
            },
            include: [
                {
                    model: User,
                    as: 'journalist',
                    attributes: ['id', 'username']
                },
                {
                    model: User,
                    as: 'editor',
                    attributes: ['id', 'username']
                }
            ],
            attributes: [
                'id', 'title', 'content', 'category', 'status', 
                'contentType', 'youtubeUrl', 'videoPath', 
                'featuredImage', 'thumbnailUrl', 'views',
                'createdAt', 'updatedAt'
            ],
            order: [['updatedAt', 'DESC']]
        });

        return res.success(
            httpStatus.OK, 
            true, 
            "Your approved news fetched successfully", 
            approvedNews
        );
    } catch (error) {
        console.error('Fetch journalist approved news error:', error);
        return res.error(
            httpStatus.INTERNAL_SERVER_ERROR, 
            false, 
            "Error fetching your approved news", 
            error
        );
    }
};


// Get journalist's rejected news
newsController.getMyRejectedNews = async (req, res) => {
    try {
        const journalistId = req.user.id;
        
        const rejectedNews = await News.findAll({
            where: { 
                journalistId,
                status: 'rejected'
            },
            include: [
                {
                    model: User,
                    as: 'journalist',
                    attributes: ['id', 'username']
                },
                {
                    model: User,
                    as: 'editor',
                    attributes: ['id', 'username']
                }
            ],
            attributes: [
                'id', 'title', 'content', 'category', 'status', 
                'contentType', 'youtubeUrl', 'videoPath', 
                'featuredImage', 'thumbnailUrl', 'views',
                'createdAt', 'updatedAt'
                // Removed 'feedback' field as it doesn't exist in the database
            ],
            order: [['updatedAt', 'DESC']]
        });

        return res.success(
            httpStatus.OK, 
            true, 
            "Your rejected news fetched successfully", 
            rejectedNews
        );
    } catch (error) {
        console.error('Fetch journalist rejected news error:', error);
        return res.error(
            httpStatus.INTERNAL_SERVER_ERROR, 
            false, 
            "Error fetching your rejected news", 
            error
        );
    }
};


// Approve/Reject news (for editors)
newsController.updateNewsStatus = async (req, res) => {
    try {
        const { newsId } = req.params;
        const { status, feedback } = req.body; // status can be 'approved' or 'rejected'
        const editorId = req.user.id;

        if (!['approved', 'rejected'].includes(status)) {
            return res.error(httpStatus.BAD_REQUEST, false, "Invalid status. Use 'approved' or 'rejected'");
        }

        const news = await News.findByPk(newsId);
        if (!news) {
            return res.error(httpStatus.NOT_FOUND, false, "News not found");
        }

        await news.update({
            status,
            editorId,
            feedback: feedback || null
        });

        return res.success(httpStatus.OK, true, `News ${status} successfully`, news);
    } catch (error) {
        console.error('Update news status error:', error);
        return res.error(httpStatus.INTERNAL_SERVER_ERROR, false, "Error updating news status", error);
    }
};

 //for getting news by category
newsController.getNewsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const validCategories = ['national', 'international', 'sports', 'entertainment', 'district'];        
        if (!validCategories.includes(category.toLowerCase())) {
            return res.error(httpStatus.BAD_REQUEST, false, "Invalid category");
        }

        const news = await News.findAll({
            where: { 
                status: 'approved',
                category: category 
            },
            include: [
                {
                    model: User,
                    as: 'journalist',
                    attributes: ['username'],
                }
            ],
            attributes: {
                include: [
                    [sequelize.literal('(SELECT COUNT(*) FROM likes WHERE likes.newsId = news.id)'), 'likesCount'],
                    [sequelize.literal('(SELECT COUNT(*) FROM comments WHERE comments.newsId = news.id)'), 'commentsCount'],
                    [sequelize.literal('(SELECT COUNT(*) FROM shares WHERE shares.newsId = news.id)'), 'sharesCount']
                ]
            },
            order: [['createdAt', 'DESC']]
        });
        return res.success(httpStatus.OK, true, `${category} news fetched successfully`, news);
    } catch (error) {
        console.error('fetch category news error:', error);
        return res.error(httpStatus.INTERNAL_SERVER_ERROR, false, "Error fetching category news", error);
    }
};

//Get trending news (5 most recent approved news)
newsController.getTrendingNews = async (req, res) => {
    try {
        const trendingNews = await News.findAll({
            where: { status: 'approved' },
            include: [
                {
                    model: User,
                    as: 'journalist',
                    attributes: ['username']
                }
            ],
            attributes: {
                include: [
                    [sequelize.literal('(SELECT COUNT(*) FROM likes WHERE likes.newsId = news.id)'), 'likesCount'],
                    [sequelize.literal('(SELECT COUNT(*) FROM comments WHERE comments.newsId = news.id)'), 'commentsCount'],
                    [sequelize.literal('(SELECT COUNT(*) FROM shares WHERE shares.newsId = news.id)'), 'sharesCount']
                ]
            },
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        return res.success(httpStatus.OK, true, "Trending news fetched successfully", trendingNews);
    } catch (error) {
        console.error('Fetch trending news error:', error);
        return res.error(httpStatus.INTERNAL_SERVER_ERROR, false, "Error fetching trending news", error);
    }
};


module.exports=newsController;