const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const {checkUserAuth,checkRole}=require('../middlewares/auth.middleware');
// Super Admin routes
router.post('/create-admin', checkUserAuth, checkRole('super_admin'), authController.createAdmin);

// Admin routes
router.post('/create-editor', checkUserAuth, checkRole('admin'), authController.createEditor);

// Editor routes
router.post('/create-journalist', checkUserAuth, checkRole('editor'), authController.createJournalist);


//public route
router.post('/register',authController.register);
router.post('/login',authController.login);
router.get('/logout',authController.logout);



module.exports = router;