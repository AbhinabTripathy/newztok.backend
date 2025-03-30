const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('user', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            isString(value) {
                if (typeof value !== 'string') {
                    throw new Error('Password must be a string');
                }
            }
        }
    },
    mobile: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('super_admin', 'admin', 'editor', 'journalist', 'audience'),
        defaultValue: 'audience'
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
});

// associations
User.associate = (models) => {
    User.hasMany(models.News, {
        foreignKey: 'journalistId',
        as: 'journalistNews'
    });
    User.hasMany(models.News, {
        foreignKey: 'editorId',
        as: 'editorNews'
    });
};

module.exports = User;
 