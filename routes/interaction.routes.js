const router = require('express').Router();
const interactionController = require('../controllers/interaction.controller');
const { checkUserAuth } = require('../middlewares/auth.middleware');

// Like/Unlike routes
router.post('/news/:newsId/like', checkUserAuth, interactionController.toggleLike);

// Comment routes
router.post('/news/:newsId/comment', checkUserAuth, interactionController.addComment);
router.get('/news/:newsId/comments', interactionController.getComments);

// Share routes
router.post('/news/:newsId/share', checkUserAuth, interactionController.shareNews);
router.get('/news/:newsId/stats', interactionController.getPostStats);
module.exports = router;