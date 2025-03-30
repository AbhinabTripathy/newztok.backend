const router = require('express').Router();
const newsController = require('../controllers/news.controller');
const { checkUserAuth, checkRole } = require('../middlewares/auth.middleware');

// Public routes
router.get('/public', newsController.getPublicNews);
router.get('/category/:category', newsController.getNewsByCategory);

// Journalist routes
router.post('/create', checkUserAuth, checkRole(['journalist','editor']), newsController.createNews);
router.get('/my-news', checkUserAuth, checkRole('journalist'), newsController.getMyNews);
router.get('/my-pending-news', checkUserAuth, checkRole('journalist'), newsController.getMyPendingNews);
router.get('/my-rejected-news', checkUserAuth, checkRole('journalist'), newsController.getMyRejectedNews);
router.get('/my-approved-news', checkUserAuth, checkRole('journalist'), newsController.getMyApprovedNews);

// Editor routes
router.get('/pending', checkUserAuth, checkRole('editor'), newsController.getPendingNews);
router.put('/:newsId/status', checkUserAuth, checkRole('editor'), newsController.updateNewsStatus);
//trending news route
router.get('/trending',newsController.getTrendingNews);
module.exports = router;