const HttpStatus = require("../enums/httpStatusCode.enum");
const ResponseMessages = require("../enums/responseMessage.enum");

const handleNotFound = (req, res, next) => {
  res.status(HttpStatus.NOT_FOUND).json({
    status: HttpStatus.NOT_FOUND,
    success: false,
    message: ResponseMessages.API_NOT_FOUND,
  });
};
module.exports = handleNotFound;
