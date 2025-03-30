const User = require('./user.model');
const News = require('./news.model');
const Like = require('./like.model');
const Comment = require('./comment.model');
const Share = require('./share.model');

// User-News associations
User.hasMany(News, {
    foreignKey: 'journalistId',
    as: 'writtenNews'
});

User.hasMany(News, {
    foreignKey: 'editorId',
    as: 'reviewedNews'
});

News.belongsTo(User, {
    foreignKey: 'journalistId',
    as: 'author'  
});

News.belongsTo(User, {
    foreignKey: 'editorId',
    as: 'reviewer'  
});

// Like associations
News.hasMany(Like, {
    foreignKey: 'newsId',
    as: 'likes'
});

User.hasMany(Like, {
    foreignKey: 'userId',
    as: 'userLikes'
});

Like.belongsTo(News, {
    foreignKey: 'newsId'
});

Like.belongsTo(User, {
    foreignKey: 'userId'
});

// Comment associations
News.hasMany(Comment, {
    foreignKey: 'newsId',
    as: 'comments'
});

User.hasMany(Comment, {
    foreignKey: 'userId',
    as: 'userComments'
});

Comment.belongsTo(News, {
    foreignKey: 'newsId'
});

Comment.belongsTo(User, {
    foreignKey: 'userId'
});

// Share associations
News.hasMany(Share, {
    foreignKey: 'newsId',
    as: 'shares'
});

User.hasMany(Share, {
    foreignKey: 'userId',
    as: 'userShares'
});

Share.belongsTo(News, {
    foreignKey: 'newsId'
});

Share.belongsTo(User, {
    foreignKey: 'userId'
});

module.exports = {
    User,
    News,
    Like,
    Comment,
    Share
};