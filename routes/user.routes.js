const router = require('express').Router();
const userController = require('../controllers/user.controller');
const { checkUserAuth, checkRole } = require('../middlewares/auth.middleware');

// Editor routes
router.get('/assigned-journalists', checkUserAuth, checkRole('editor'), userController.getAssignedJournalists);

module.exports = router;