const{DataTypes}=require('sequelize');
const sequelize=require('../config/db');
const share=sequelize.define('share',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    userId:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:'users',
            key:'id'
        }
    },
    newsId:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:'news',
            key:'id'
        }
    }
},{
    timestamps:true
});
module.exports=share;
