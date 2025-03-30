const{DataTypes}=require('sequelize');
const sequelize=require('../config/db');
const comment=sequelize.define(
    'comment',{
        id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        content:{
            type:DataTypes.TEXT,
            allowNull:false,

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
    }
);

module.exports=comment;