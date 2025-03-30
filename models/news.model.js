const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User=require('./user.model')

const News = sequelize.define('news', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    },
    journalistId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    editorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    contentType: {
        type: DataTypes.ENUM('standard', 'video'),
        allowNull: false,
        defaultValue: 'video'
    },
    youtubeUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isYouTubeUrl(value) {
                if (value && !value.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)/)) {
                    throw new Error('Must be a valid YouTube URL');
                }
            }
        }
    },
    videoPath: {
        type: DataTypes.STRING,
        allowNull: true
    },
    featuredImage: {
        type: DataTypes.STRING,
        allowNull: true
    },
    thumbnailUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    category: {
        type: DataTypes.ENUM('national', 'international', 'sports', 'entertainment', 'district'),
        allowNull: false,
        validate: {
            isIn: {
                args: [['national', 'international', 'sports', 'entertainment', 'district']],
                msg: "Invalid category. Must be one of: national, international, sports, entertainment, district"
            }
        }
    },
    views: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    timestamps: true
});

/// associations
News.belongsTo(User, {
    foreignKey: 'journalistId',
    as: 'journalist'
});

News.belongsTo(User, {
    foreignKey: 'editorId',
    as: 'editor'
});

module.exports = News;