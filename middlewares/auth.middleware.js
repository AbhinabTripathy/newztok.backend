const helpers = require("../utils/helper");
const User = require("../models/user.model");

let authMiddleware = {};

authMiddleware.checkUserAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.error(403, false, "No token provided");
        }

        const token = authHeader.split(' ')[1];
        
        // Use Promise-based token verification
        try {
            const tokenData = await new Promise((resolve, reject) => {
                helpers.verifyToken(token, (err, decoded) => {
                    if (err) reject(err);
                    else resolve(decoded);
                });
            });

            // Get user data from database
            const user = await User.findByPk(tokenData.id);
            if (!user) {
                return res.error(403, false, "User not found");
            }

            // Store both token data and user object
            req.mwValue = {
                auth: tokenData
            };
            req.user = user;
            next();
        } catch (error) {
            return res.error(403, false, "Invalid token");
        }
    } catch (err) {
        return res.error(403, false, "Authentication failed", err.message);
    }
};


authMiddleware.checkRole = (roles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.error(403, false, "Authentication required");
            }

            // Convert roles parameter to array if it's not already
            const allowedRoles = Array.isArray(roles) ? roles : [roles];
            
            // Check if user's role is in the allowed roles array
            if (!allowedRoles.includes(req.user.role)) {
                return res.error(403, false, "Access denied. Insufficient privileges");
            }

            next();
        } catch (error) {
            return res.error(403, false, "Role verification failed", error.message);
        }
    };
};



module.exports = authMiddleware;
