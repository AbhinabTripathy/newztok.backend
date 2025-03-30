const HttpStatus = require("../enums/httpStatusCode.enum");
const ResponseMessages = require("../enums/responseMessage.enum");
const {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
} = require("sequelize");

const errorHandler = (err, req, res, next) => {
  console.log("Error Middleware: " , err);

  if (err instanceof ValidationError) {
    return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
      success:false,
      message:ResponseMessages.VALIDATION_ERROR,
      errors:err.errors.map((e) => ({
        message: e.message,
        path: e.path,
        value: e.value,
      }))
   } );
  }

  if (err instanceof UniqueConstraintError) {
    return res.status(HttpStatus.CONFLICT).json({
      success:false,
      message:ResponseMessages.UNIQUE_CONSTRAINT_ERROR,
      errors:err.errors.map((e) => ({
        message: e.message,
        path: e.path,
        value: e.value,
      }))
   });
  }
  

  if (err instanceof ForeignKeyConstraintError) {
    return res.status(HttpStatus.CONFLICT).json({
      success:false,
      message:ResponseMessages.FOREIGN_KEY_CONSTRAINT_ERROR,
      errors:[{message:err.message}]
  });
}

  // Handle other types of Sequelize errors
  if (err.name && err.name.startsWith("Sequelize")) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success:false,
      message:ResponseMessages.DATABASE_ERROR,
      errors:[{message:err.message}]
   } );
  }

  // Default to 500 server error for other uncaught errors
  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    success:false,
    message:ResponseMessages.INTERNAL_SERVER_ERROR,
    errors:[{message:err.message}]
  });
}
  
module.exports = errorHandler;
  
