const User = require('../models/user.model');
const{Op}=require('sequelize');
const bcrypt=require('bcrypt');
const jwt = require('jsonwebtoken');
const helpers=require('../utils/helper');
const httpStatus=require('../enums/httpStatusCode.enum');
const authController={};

// Create admin (super_admin only)
authController.createAdmin = async (req, res) => {
    const { username, email, password, mobile } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const admin = await User.create({
            username,
            email,
            password: hashedPassword,
            mobile,
            role: 'admin'
        });

        const adminResponse = admin.toJSON();
        delete adminResponse.password;

        return res.success(
            httpStatus.CREATED,
            true,
            "Admin account created successfully",
            adminResponse
        );
    } catch (error) {
        console.error('Create admin error:', error);
        return res.error(
            httpStatus.INTERNAL_SERVER_ERROR,
            false,
            "Error creating admin account",
            error
        );
    }
};

// Create editor (admin only)
authController.createEditor = async (req, res) => {
    const { username, email, password, mobile } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const editor = await User.create({
            username,
            email,
            password: hashedPassword,
            mobile,
            role: 'editor'
        });

        const editorResponse = editor.toJSON();
        delete editorResponse.password;

        return res.success(
            httpStatus.CREATED,
            true,
            "Editor account created successfully",
            editorResponse
        );
    } catch (error) {
        console.error('Create editor error:', error);
        return res.error(
            httpStatus.INTERNAL_SERVER_ERROR,
            false,
            "Error creating editor account",
            error
        );
    }
};

// Create journalist (editor only)
authController.createJournalist = async (req, res) => {
    const { username, email, password, confirmPassword, mobile } = req.body;

    // Validate required fields
    if (!username || !email || !password || !confirmPassword || !mobile) {
        return res.error(
            httpStatus.BAD_REQUEST,
            false,
            "All fields are required"
        );
    }

    // Validate password match
    if (password !== confirmPassword) {
        return res.error(
            httpStatus.BAD_REQUEST,
            false,
            "Passwords do not match"
        );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.error(
            httpStatus.BAD_REQUEST,
            false,
            "Invalid email format"
        );
    }

    try {
        // Check if username or email already exists
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ username }, { email }]
            }
        });

        if (existingUser) {
            return res.error(
                httpStatus.BAD_REQUEST,
                false,
                "Username or email already exists"
            );
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const journalist = await User.create({
            username,
            email,
            password: hashedPassword,
            mobile,
            role: 'journalist'
        });

        const journalistResponse = journalist.toJSON();
        delete journalistResponse.password;

        return res.success(
            httpStatus.CREATED,
            true,
            "Journalist account created successfully",
            journalistResponse
        );
    } catch (error) {
        console.error('Create journalist error:', error);
        return res.error(
            httpStatus.INTERNAL_SERVER_ERROR,
            false,
            "Error creating journalist account",
            error
        );
    }
}; 

// Public registration (for audience only)
authController.register = async (req, res) => {
    const { username, email, password, mobile } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            mobile,
            role: 'audience'  // Force role to be audience
        });

        const userResponse = user.toJSON();
        delete userResponse.password;

        return res.success(
            httpStatus.CREATED,
            true,
            "User registered successfully",
            userResponse
        );
    } catch (error) {
        console.error('Registration error:', error);
        return res.error(
            httpStatus.INTERNAL_SERVER_ERROR,
            false,
            "Error during registration",
            error
        );
    }
};
//login part......................
authController.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.error(
            httpStatus.BAD_REQUEST,
            false,
            "Username and password are required"
        );
    }

    try {
        // Add logging to debug
        console.log('Login attempt for username:', username);
        const user = await User.findOne({ 
            where: { username } ,
            attributes: ['id', 'username', 'password', 'role', 'status'] // Include role and status
        });

        if (!user) {
            console.log('User not found:', username);
            return res.error(
                httpStatus.UNAUTHORIZED,
                false,
                "Invalid username or password"
            );
        }
         // Log user data (except password) for debugging
         console.log('User found:', {
            id: user.id,
            username: user.username,
            role: user.role,
            status: user.status
        });

        // Change to use bcrypt.compare instead of helpers.hash
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.error(
                httpStatus.UNAUTHORIZED,
                false,
                "Invalid username or password"
            );
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                role: user.role 
            },
            process.env.APP_SUPER_SECRET_KEY,
            { expiresIn: '24h' }
        );

        return res.success(
            httpStatus.OK,
            true,
            "Login successful",
            { 
                user: user.username, 
                role: user.role,
                token: token 
            }
        );

    } catch (error) {
        console.error('Login error:', error);
        return res.error(
            httpStatus.INTERNAL_SERVER_ERROR,
            false,
            "Internal server error",
            error
        );
    }
};

//logOut controller...............

authController.logout = async (req, res) => {
    try {    
        return res.success(
            httpStatus.OK,
            true,
            "Logged out successfully"
        );
    } catch (error) {
        console.error('Logout error:', error);
        return res.error(
            httpStatus.INTERNAL_SERVER_ERROR,
            false,
            "Internal server error",
            error
        );
    }
};




module.exports = authController;