const multer=require('multer');
const path=require('path');

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'uploads/products')
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+path.extname
    (file.originalname))
    }
});

const upload=multer({
    storage:storage,
    limits:{fileSize:5*1024*1024},//photo uploade limit 5mb
    fileFilter:(req,file,cb)=>{
        if (file.mimetype.startsWith('image/')){
            cb(null,true);
        }else{
            cb(new Error('Not an image! please upload an image'),false);
        }
    }
});

module.exports=upload;